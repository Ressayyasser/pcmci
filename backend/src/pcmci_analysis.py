"""
PCMCI (Peter-Clark Moment Conditional Independence) Analysis Module
Detects causal relationships between energy variables in OCP systems.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

try:
    from tigramite import data_processing as pp
    from tigramite.models import LinearMediation
    from tigramite.toymodels import generate_nonlinear_model
except ImportError:
    print("[v0] Warning: tigramite not installed. Using simplified PCMCI implementation.")
    LinearMediation = None


class PCMCIAnalyzer:
    """
    Performs PCMCI causal analysis on energy system data.
    Identifies causal relationships between generators, heaters, compressors.
    """
    
    def __init__(self, tau_max: int = 12, alpha: float = 0.05):
        """
        Initialize PCMCI Analyzer.
        
        Args:
            tau_max: Maximum time lag to test (in hours)
            alpha: Significance level for independence tests
        """
        self.tau_max = tau_max
        self.alpha = alpha
        self.causal_graph = None
        self.adjacency_matrix = None
        self.variable_names = None
        self.strength_matrix = None
        
    def preprocess_data(self, df: pd.DataFrame, 
                       columns_to_analyze: Optional[List[str]] = None) -> np.ndarray:
        """
        Preprocess data for PCMCI analysis.
        Handles missing values, standardization, and lag creation.
        
        Args:
            df: Input dataframe with time series
            columns_to_analyze: Specific columns to analyze (default: all numeric)
            
        Returns:
            Preprocessed data array (N_TIME, N_VARS)
        """
        if columns_to_analyze is None:
            columns_to_analyze = [col for col in df.columns 
                                 if col not in ['timestamp', 'anomaly_indicator']]
        
        self.variable_names = columns_to_analyze
        data = df[columns_to_analyze].values
        
        # Handle missing values
        data = np.nan_to_num(data, nan=np.nanmean(data, axis=0))
        
        # Standardization (zero-mean, unit variance)
        data = (data - np.mean(data, axis=0)) / (np.std(data, axis=0) + 1e-10)
        
        return data
    
    def compute_correlation_matrix(self, df: pd.DataFrame, 
                                   columns_to_analyze: Optional[List[str]] = None) -> np.ndarray:
        """
        Compute correlation matrix between variables.
        Serves as foundation for causal analysis.
        """
        if columns_to_analyze is None:
            columns_to_analyze = [col for col in df.columns 
                                 if col not in ['timestamp', 'anomaly_indicator']]
        
        data = df[columns_to_analyze].values
        corr_matrix = np.corrcoef(data.T)
        
        return corr_matrix, columns_to_analyze
    
    def estimate_causality_simplified(self, df: pd.DataFrame) -> Dict:
        """
        Simplified PCMCI implementation using Granger causality principles.
        Identifies causal relationships between variables.
        
        Args:
            df: Input dataframe
            
        Returns:
            Dictionary with causal structure and relationships
        """
        # Select energy-related variables
        energy_cols = [col for col in df.columns if 'power' in col.lower() or 'energy' in col.lower()]
        if not energy_cols:
            energy_cols = [col for col in df.columns if col not in ['timestamp', 'anomaly_indicator']][:10]
        
        data = self.preprocess_data(df, energy_cols)
        self.variable_names = energy_cols
        
        N_TIME, N_VARS = data.shape
        
        # Initialize causal graph (adjacency matrix)
        self.adjacency_matrix = np.zeros((N_VARS, N_VARS))
        self.strength_matrix = np.zeros((N_VARS, N_VARS))
        
        # Compute lagged correlations for causality
        for i in range(N_VARS):
            for j in range(N_VARS):
                if i != j:
                    # Check if variable i at time t-1 predicts variable j at time t
                    max_corr = 0
                    best_lag = 0
                    
                    for lag in range(1, min(self.tau_max + 1, N_TIME // 4)):
                        if lag < N_TIME:
                            corr = np.abs(np.corrcoef(data[:-lag, i], data[lag:, j])[0, 1])
                            if corr > max_corr:
                                max_corr = corr
                                best_lag = lag
                    
                    # Set edge if correlation is significant
                    if max_corr > 0.3:  # Threshold for causality
                        self.adjacency_matrix[i, j] = 1
                        self.strength_matrix[i, j] = max_corr
        
        # Build causal graph structure
        causal_edges = []
        for i in range(N_VARS):
            for j in range(N_VARS):
                if self.adjacency_matrix[i, j] > 0:
                    causal_edges.append({
                        'from': energy_cols[i],
                        'to': energy_cols[j],
                        'strength': float(self.strength_matrix[i, j]),
                        'direction': 'causal'
                    })
        
        self.causal_graph = {
            'edges': causal_edges,
            'nodes': energy_cols,
            'adjacency_matrix': self.adjacency_matrix.tolist(),
            'strength_matrix': self.strength_matrix.tolist()
        }
        
        return self.causal_graph
    
    def get_causal_structure(self) -> Dict:
        """Returns the computed causal structure."""
        return self.causal_graph
    
    def identify_root_causes(self, target_variable: str, 
                            causal_graph: Dict) -> List[str]:
        """
        Identify root causes for a target variable anomaly.
        Traces backward through causal graph.
        
        Args:
            target_variable: Variable to trace causality for
            causal_graph: Computed causal graph
            
        Returns:
            List of potential root causes
        """
        if target_variable not in causal_graph['nodes']:
            return []
        
        root_causes = []
        target_idx = causal_graph['nodes'].index(target_variable)
        
        # Find all variables that cause the target
        for edge in causal_graph['edges']:
            if edge['to'] == target_variable:
                root_causes.append({
                    'variable': edge['from'],
                    'strength': edge['strength'],
                    'lag': 1  # Simplified: assume 1-hour lag
                })
        
        # Sort by strength
        root_causes.sort(key=lambda x: x['strength'], reverse=True)
        
        return root_causes
    
    def explain_anomaly(self, df: pd.DataFrame, 
                       anomaly_time_idx: int,
                       causal_graph: Dict) -> Dict:
        """
        Explain what caused an anomaly using causal graph.
        
        Args:
            df: Input dataframe
            anomaly_time_idx: Index of anomalous timestamp
            causal_graph: Computed causal graph
            
        Returns:
            Explanation dictionary with contributing factors
        """
        if anomaly_time_idx <= self.tau_max:
            return {'error': 'Anomaly too early in time series'}
        
        explanation = {
            'timestamp': df.iloc[anomaly_time_idx]['timestamp'],
            'contributing_factors': [],
            'strength_of_evidence': 0.0
        }
        
        # For each causal relationship, check if upstream variable had anomaly
        total_strength = 0
        for edge in causal_graph['edges']:
            lag = 1  # Simplified
            if anomaly_time_idx - lag >= 0:
                upstream_col = edge['from']
                downstream_col = edge['to']
                
                if upstream_col in df.columns and downstream_col in df.columns:
                    upstream_val = df.iloc[anomaly_time_idx - lag][upstream_col]
                    downstream_val = df.iloc[anomaly_time_idx][downstream_col]
                    
                    # Check if upstream had significant deviation
                    upstream_mean = df[upstream_col].mean()
                    upstream_std = df[upstream_col].std()
                    
                    if abs(upstream_val - upstream_mean) > 2 * upstream_std:
                        explanation['contributing_factors'].append({
                            'variable': upstream_col,
                            'value': float(upstream_val),
                            'zscore': float((upstream_val - upstream_mean) / (upstream_std + 1e-10)),
                            'causal_strength': edge['strength']
                        })
                        total_strength += edge['strength']
        
        explanation['strength_of_evidence'] = min(total_strength / len(causal_graph['edges']) if causal_graph['edges'] else 0, 1.0)
        
        return explanation


def run_pcmci_analysis(df: pd.DataFrame, 
                       tau_max: int = 12) -> Dict:
    """
    Run complete PCMCI analysis on OCP data.
    
    Args:
        df: Input dataframe with energy data
        tau_max: Maximum lag to test
        
    Returns:
        Complete analysis results
    """
    print("[v0] Starting PCMCI causal analysis...")
    
    analyzer = PCMCIAnalyzer(tau_max=tau_max)
    
    # Perform causal analysis
    causal_graph = analyzer.estimate_causality_simplified(df)
    
    print(f"[v0] Found {len(causal_graph['edges'])} causal relationships")
    print(f"[v0] Variables analyzed: {len(causal_graph['nodes'])}")
    
    return {
        'causal_graph': causal_graph,
        'analyzer': analyzer,
        'n_edges': len(causal_graph['edges']),
        'n_nodes': len(causal_graph['nodes'])
    }
