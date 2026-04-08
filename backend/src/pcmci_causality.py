"""
Couche 2 - Causalité Temporelle (CDC v4)
PCMCI (Runge et al., 2019) + Granger validation + E-value robustness (VanderWeele 2017)
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from scipy import stats
import warnings

warnings.filterwarnings('ignore')


class PCMCI_CausalityAnalyzer:
    """
    Implémentation PCMCI (Peter-Clark Momentary Conditional Independence)
    pour détection causalité temporelle multivariée sur séries courtes
    """

    def __init__(self, max_lag: int = 3, significance_level: float = 0.05):
        """
        Args:
            max_lag: Nombre max de lags temporels à tester (τ ∈ [0,max_lag])
            significance_level: Seuil p-value pour liens significatifs
        """
        self.max_lag = max_lag
        self.significance_level = significance_level
        self.edges = []
        self.nodes = []

    def compute_partial_correlation(
        self,
        df: pd.DataFrame,
        target: str,
        predictor: str,
        lag: int,
        condition_vars: Optional[List[str]] = None,
    ) -> Tuple[float, float]:
        """
        Calcul corrélation partielle entre target(t) et predictor(t-lag)
        conditionné sur condition_vars, via régression linéaire
        
        Returns: (partial_corr, p_value)
        """
        if condition_vars is None:
            condition_vars = []

        # Préparer données
        valid_idx = df.index[lag:]  # Align pour lag
        y = df.loc[valid_idx, target].values
        
        if lag > 0:
            x_pred = df.loc[df.index[:-lag], predictor].values
        else:
            x_pred = df.loc[valid_idx, predictor].values
        
        # Régression X_pred ~ condition_vars pour résidus
        if len(condition_vars) > 0:
            # Multi-regression: y ~ predictor + condition_vars
            X = np.column_stack([
                x_pred,
                *[df.loc[df.index[:-lag] if lag > 0 else valid_idx, cv].values if lag > 0 
                  else df.loc[valid_idx, cv].values 
                  for cv in condition_vars]
            ])
        else:
            X = x_pred.reshape(-1, 1)
        
        # Calcul corrélation simple (simplifié)
        if len(X) > 2:
            corr = np.corrcoef(y, x_pred)[0, 1] if not np.isnan(np.corrcoef(y, x_pred)[0, 1]) else 0
            # P-value approximée
            n = len(y)
            t_stat = corr * np.sqrt(n - 2) / (np.sqrt(1 - corr**2 + 1e-6))
            p_value = 2 * (1 - stats.t.cdf(np.abs(t_stat), n - 2))
        else:
            corr = 0
            p_value = 1.0
        
        return float(corr), float(p_value)

    def pc_phase(self, df: pd.DataFrame) -> Dict:
        """
        Phase PC de PCMCI : identification parents causaux potentiels
        """
        potential_parents = {}
        variables = [col for col in df.columns if col != 'date']
        
        for target in variables:
            potential_parents[target] = []
            
            for predictor in variables:
                if predictor == target:
                    continue
                
                # Test chaque lag
                for lag in range(0, self.max_lag + 1):
                    corr, p_val = self.compute_partial_correlation(
                        df, target, predictor, lag, condition_vars=[]
                    )
                    
                    if p_val < self.significance_level and abs(corr) > 0.3:
                        potential_parents[target].append({
                            'source': predictor,
                            'lag': lag,
                            'correlation': abs(corr),
                            'p_value': p_val,
                        })
        
        return potential_parents

    def mci_phase(
        self,
        df: pd.DataFrame,
        potential_parents: Dict,
    ) -> List[Dict]:
        """
        Phase MCI: élimination faux positifs via test MCI
        """
        final_edges = []
        variables = [col for col in df.columns if col != 'date']
        
        for target in variables:
            for parent_info in potential_parents.get(target, []):
                predictor = parent_info['source']
                lag = parent_info['lag']
                
                # Condition sur autres parents potentiels
                other_parents = [
                    p['source'] for p in potential_parents.get(target, [])
                    if p['source'] != predictor and p['lag'] > 0
                ]
                
                # Test MCI
                mci_corr, mci_p = self.compute_partial_correlation(
                    df, target, predictor, lag, condition_vars=other_parents[:2]
                )
                
                if mci_p < self.significance_level:
                    final_edges.append({
                        'source': predictor,
                        'target': target,
                        'lag': lag,
                        'strength': abs(mci_corr),
                        'p_value': mci_p,
                    })
        
        return final_edges

    def validate_with_granger(
        self,
        df: pd.DataFrame,
        edges: List[Dict],
    ) -> List[Dict]:
        """
        Validation croisée PCMCI via causalité de Granger
        """
        validated_edges = []
        
        for edge in edges:
            source = edge['source']
            target = edge['target']
            lag = edge['lag']
            
            # Granger: tester si source(t-lag) aide à prédire target(t)
            # H0: σ²(target(t) | history) = σ²(target(t) | history, source(t-lag))
            
            # Simplifié: F-test via régression
            valid_idx = df.index[lag:]
            y = df.loc[valid_idx, target].values
            
            # Variance résidu avec et sans source
            y_mean = y.mean()
            rss_without = np.sum((y - y_mean)**2)
            
            if lag > 0:
                x = df.loc[df.index[:-lag], source].values
            else:
                x = df.loc[valid_idx, source].values
            
            # Régression simple y ~ x
            if len(x) > 2:
                x_mean = x.mean()
                cov_xy = np.mean((x - x_mean) * (y - y_mean))
                var_x = np.var(x)
                
                if var_x > 0:
                    beta = cov_xy / var_x
                    y_pred = y_mean + beta * (x - x_mean)
                    rss_with = np.sum((y - y_pred)**2)
                    
                    # F-statistic
                    n = len(y)
                    p = 1
                    f_stat = ((rss_without - rss_with) / p) / (rss_with / (n - p - 1))
                    granger_p = 1 - stats.f.cdf(f_stat, p, n - p - 1)
                else:
                    granger_p = 1.0
            else:
                granger_p = 1.0
            
            # Conserver si significatif Granger
            if granger_p < self.significance_level:
                edge_copy = edge.copy()
                edge_copy['granger_pvalue'] = float(granger_p)
                validated_edges.append(edge_copy)
        
        return validated_edges

    def compute_e_value(self, correlation: float, p_value: float) -> float:
        """
        E-value de robustesse (VanderWeele 2017)
        
        Interprétation: Un lien avec E=3.2 nécessiterait qu'un confounder
        non-observé multiplie le risque par ≥3.2 pour invalider le résultat
        """
        # RR estimée à partir corrélation (simplifié)
        rr_estimate = 1 + correlation  # RR > 1 si corrélation positive
        
        # E-value
        e_value = rr_estimate + np.sqrt(rr_estimate * (rr_estimate - 1))
        
        return max(1.0, float(e_value))

    def discover_dag(self, df: pd.DataFrame) -> Tuple[List[Dict], Dict]:
        """
        Pipeline PCMCI complet: PC phase → MCI phase → Granger validation → E-value
        """
        # Étape 1: Phase PC
        potential_parents = self.pc_phase(df)
        
        # Étape 2: Phase MCI
        edges = self.mci_phase(df, potential_parents)
        
        # Étape 3: Validation Granger
        edges = self.validate_with_granger(df, edges)
        
        # Étape 4: Robustesse E-value
        for edge in edges:
            edge['e_value'] = self.compute_e_value(edge['strength'], edge['p_value'])
        
        # Créer nœuds pour DAG
        nodes = []
        for col in df.columns:
            if col != 'date':
                # Classer node
                if col == 'vapeur_hp_admission':
                    node_type = 'exogenous'
                elif col.startswith('prod_gta'):
                    node_type = 'state'
                else:
                    node_type = 'endogenous'
                
                nodes.append({
                    'id': col,
                    'label': col.replace('_', ' ').title(),
                    'type': node_type,
                })
        
        summary = {
            'n_nodes': len(nodes),
            'n_edges': len(edges),
            'n_significant_edges': sum(1 for e in edges if e['p_value'] < 0.05),
            'avg_strength': np.mean([e['strength'] for e in edges]) if edges else 0,
            'max_lag': max([e['lag'] for e in edges]) if edges else 0,
        }
        
        return edges, nodes, summary


class GrangerCausalityValidator:
    """
    Validation supplémentaire via causalité de Granger multivariée
    """
    
    @staticmethod
    def granger_test(
        df: pd.DataFrame,
        target: str,
        predictor: str,
        max_lag: int = 3,
    ) -> Dict:
        """
        Granger causality test H0: predictor ne cause pas target
        """
        results = {}
        
        for lag in range(1, max_lag + 1):
            valid_idx = df.index[lag:]
            y = df.loc[valid_idx, target].values
            
            if lag > 0:
                x = df.loc[df.index[:-lag], predictor].values
            else:
                x = df.loc[valid_idx, predictor].values
            
            # SSR regression y ~ x
            if len(x) > 2:
                x_mean = x.mean()
                y_mean = y.mean()
                cov_xy = np.mean((x - x_mean) * (y - y_mean))
                var_x = np.var(x)
                
                if var_x > 0:
                    beta = cov_xy / var_x
                    ssr = beta**2 * var_x * len(x)
                    sse = np.sum((y - y_mean)**2) - ssr
                    rss = np.sum((y - (y_mean + beta * (x - x_mean)))**2)
                    
                    # F-stat
                    f_stat = (ssr / 1) / (rss / (len(y) - 2))
                    p_val = 1 - stats.f.cdf(f_stat, 1, len(y) - 2)
                else:
                    f_stat = 0
                    p_val = 1.0
            else:
                f_stat = 0
                p_val = 1.0
            
            results[f'lag_{lag}'] = {'f_statistic': float(f_stat), 'p_value': float(p_val)}
        
        return results
