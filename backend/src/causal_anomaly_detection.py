"""
Couche 3 - Détection d'Anomalies Causales (CDC v4)
Isolation Forest sur résidus causaux + Test CUSUM causal
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple, Optional
from sklearn.ensemble import IsolationForest
import warnings

warnings.filterwarnings('ignore')


class CausalAnomalyDetector:
    """
    Détection anomalies dans résidus causaux (non dans valeurs brutes)
    Permet distinction déviations bénignes vs ruptures causalement significatives
    """

    def __init__(self, contamination: float = 0.1):
        """
        Args:
            contamination: Proportion d'anomalies attendues
        """
        self.contamination = contamination
        self.isolationforest = IsolationForest(contamination=contamination, random_state=42)
        self.causal_residuals = {}
        self.anomalies_found = []

    def compute_causal_residuals(
        self,
        df: pd.DataFrame,
        edges: List[Dict],
        variables: List[str],
    ) -> Dict[str, np.ndarray]:
        """
        Calcul résidus causaux: r_t^j = X_t^j - X̂_t^j(parents PCMCI)
        
        Pour chaque variable, on soustrait les effets causaux de ses parents
        """
        residuals = {}
        
        for target in variables:
            # Identifier parents causaux du target
            parents = [e for e in edges if e['target'] == target]
            
            if not parents:
                # Pas de parent: résidu = la série elle-même
                residuals[target] = df[target].values
            else:
                # Initialiser avec la série
                y = df[target].values.copy()
                
                # Soustraire contribution causale de chaque parent
                for parent_edge in parents:
                    parent = parent_edge['source']
                    lag = parent_edge['lag']
                    strength = parent_edge['strength']
                    
                    # Contribution: strength * parent(t-lag)
                    if lag > 0:
                        parent_values = np.concatenate([[np.nan] * lag, df[parent].values[:-lag]])
                    else:
                        parent_values = df[parent].values
                    
                    # Soustraire contribution
                    y = y - strength * parent_values
                
                residuals[target] = y
        
        self.causal_residuals = residuals
        return residuals

    def detect_anomalies_isolation_forest(
        self,
        residuals: Dict[str, np.ndarray],
        threshold_anomaly_score: float = 0.7,
    ) -> List[Dict]:
        """
        Isolation Forest sur résidus causaux
        
        Anomalie si anomaly_score(r_t^j, n) > θ_causal
        """
        anomalies = []
        
        for var_name, residual_series in residuals.items():
            # Reshape pour IF
            X = residual_series.reshape(-1, 1)
            
            # Ajuster IF
            try:
                self.isolationforest.fit(X)
                scores = -self.isolationforest.score_samples(X)  # Négatif = plus haut score = anomalie
                predictions = self.isolationforest.predict(X)  # -1 = anomalie, 1 = normal
                
                # Identifier indices anomalies
                anomaly_indices = np.where(predictions == -1)[0]
                
                for idx in anomaly_indices:
                    anomalies.append({
                        'variable': var_name,
                        'index': int(idx),
                        'residual_value': float(residual_series[idx]),
                        'anomaly_score': float(scores[idx]),
                        'is_anomaly': scores[idx] > threshold_anomaly_score,
                    })
            except:
                pass  # Pas assez de données
        
        self.anomalies_found = anomalies
        return anomalies

    def cusum_causal_test(
        self,
        edge_strengths: List[float],
        baseline_strength: Optional[float] = None,
        threshold: float = 5.0,
        drift: float = 0.5,
    ) -> Dict:
        """
        Test CUSUM causal: détection rupture de tendance dans force d'un lien causal
        
        C_k = max(0, C_{k-1} + β_k - μ_0 - K)
        
        Où:
        - β_k = force du lien au temps k
        - μ_0 = valeur baseline
        - K = seuil sensibilité
        - Alarme si C_k > H
        """
        if baseline_strength is None:
            baseline_strength = np.mean(edge_strengths[:max(3, len(edge_strengths)//3)])
        
        cusum = []
        cumsum = 0
        alerts = []
        
        for k, beta_k in enumerate(edge_strengths):
            # Calcul CUSUM
            cumsum = max(0, cumsum + beta_k - baseline_strength - drift)
            cusum.append(cumsum)
            
            # Alarme si CUSUM dépasse threshold
            if cumsum > threshold:
                alerts.append({
                    'time_index': int(k),
                    'cusum_value': float(cumsum),
                    'estimated_strength': float(beta_k),
                    'severity': 'high' if cumsum > threshold * 1.5 else 'medium',
                })
        
        return {
            'cusum_series': [float(c) for c in cusum],
            'baseline_strength': float(baseline_strength),
            'alerts': alerts,
            'n_alerts': len(alerts),
        }

    def flag_critical_scada_thresholds(self, df: pd.DataFrame) -> List[Dict]:
        """
        Seuils SCADA critiques (CDC v4 Section 3.4)
        """
        alerts = []
        
        # Vibration GTA1/2 > 4.5 mm/s → mécanique précoce
        if 'vibration_gta1' in df.columns:
            critical_idx = df[df['vibration_gta1'] > 4.5].index
            if len(critical_idx) > 0:
                alerts.append({
                    'tag': 'vibration_gta1',
                    'threshold': 4.5,
                    'unit': 'mm/s',
                    'interpretation': 'Anomalie mécanique précoce GTA1 détectée',
                    'count': len(critical_idx),
                })
        
        # Temperature HRS: dérive > 15°C/mois → encrassement
        if 'temperature_hrs_entree' in df.columns:
            monthly_change = df['temperature_hrs_entree'].diff()
            critical_idx = monthly_change[monthly_change > 15].index
            if len(critical_idx) > 0:
                alerts.append({
                    'tag': 'temperature_hrs_entree',
                    'threshold': '15°C/month',
                    'unit': '°C',
                    'interpretation': 'Dérive encrassement/corrosion HRS détectée',
                    'count': len(critical_idx),
                })
        
        # Pression GTA: chute > 3 bar/h → dégradation
        if 'pression_gta' in df.columns:
            hourly_change = df['pression_gta'].diff()
            # Note: données mensuelles donc pas vraiment horaire
            critical_threshold = 3  # bar par période
            critical_idx = hourly_change[hourly_change.abs() > critical_threshold].index
            if len(critical_idx) > 0:
                alerts.append({
                    'tag': 'pression_gta',
                    'threshold': f'>{critical_threshold} bar/period',
                    'unit': 'bar',
                    'interpretation': 'Chute pression turbine → dégradation performance',
                    'count': len(critical_idx),
                })
        
        return alerts


class AnomalyExplainer:
    """
    Explication des anomalies détectées par chaîne causale
    """
    
    @staticmethod
    def explain_anomaly(
        anomaly: Dict,
        edges: List[Dict],
        df: pd.DataFrame,
    ) -> Dict:
        """
        Expliquer une anomalie en remontant la chaîne causale
        """
        target_var = anomaly['variable']
        anomaly_idx = anomaly['index']
        
        # Trouver causes (edges entrantes au target)
        incoming_edges = [e for e in edges if e['target'] == target_var]
        
        explanation = {
            'anomaly_variable': target_var,
            'anomaly_index': anomaly_idx,
            'residual_value': anomaly['residual_value'],
            'anomaly_score': anomaly['anomaly_score'],
            'likely_causes': [],
            'causal_chain': [],
        }
        
        # Identifier causes probables
        for edge in incoming_edges:
            source = edge['source']
            lag = edge['lag']
            
            if anomaly_idx - lag >= 0:
                source_value = df.iloc[anomaly_idx - lag][source] if source in df.columns else None
                
                explanation['likely_causes'].append({
                    'source_variable': source,
                    'lag': lag,
                    'edge_strength': edge['strength'],
                    'source_value_at_lag': float(source_value) if source_value is not None else None,
                    'p_value': edge['p_value'],
                })
                
                # Construire chaîne causale (récursif simplifié)
                explanation['causal_chain'].append(
                    f"{source}(t-{lag}) → {target_var}(t) [strength={edge['strength']:.3f}]"
                )
        
        return explanation
