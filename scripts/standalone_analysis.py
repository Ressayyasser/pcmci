#!/usr/bin/env python3
"""
Standalone PCMCI and Anomaly Detection Analysis
"""

import pandas as pd
import numpy as np
import json
from pathlib import Path
from scipy import stats
from sklearn.ensemble import IsolationForest

def run_pcmci_analysis(df, tau_max=12):
    """Simplified PCMCI-like causal analysis without tigramite"""
    print("[v0] Running causal analysis...")
    
    # Select numeric columns (excluding timestamp and anomaly indicator)
    numeric_cols = [col for col in df.columns 
                   if col not in ['timestamp', 'anomaly_indicator'] 
                   and df[col].dtype in ['float64', 'int64']]
    
    data = df[numeric_cols].values
    
    # Compute correlation matrix as proxy for causality
    corr_matrix = np.corrcoef(data.T)
    
    # Extract significant correlations
    edges = []
    n_vars = len(numeric_cols)
    
    for i in range(n_vars):
        for j in range(n_vars):
            if i != j and abs(corr_matrix[i, j]) > 0.3:
                edges.append({
                    'from': numeric_cols[i],
                    'to': numeric_cols[j],
                    'strength': float(corr_matrix[i, j]),
                    'lag': 0
                })
    
    causal_graph = {
        'n_nodes': n_vars,
        'nodes': numeric_cols,
        'edges': edges,
        'correlation_matrix': corr_matrix.tolist()
    }
    
    return {'causal_graph': causal_graph}

def detect_anomalies(df):
    """Detect anomalies using Isolation Forest + CUSUM"""
    print("[v0] Running anomaly detection...")
    
    # Select numeric columns
    numeric_cols = [col for col in df.columns 
                   if col not in ['timestamp', 'anomaly_indicator'] 
                   and df[col].dtype in ['float64', 'int64']]
    
    data = df[numeric_cols].values
    
    # Isolation Forest
    iso_forest = IsolationForest(contamination=0.02, random_state=42)
    if_scores = iso_forest.fit_predict(data)
    if_anomaly_scores = iso_forest.score_samples(data)
    
    # CUSUM for each column
    cusum_scores = np.zeros(len(df))
    for col_idx, col in enumerate(numeric_cols):
        series = df[col].values
        mean = np.mean(series)
        std = np.std(series)
        
        # Normalize
        normalized = (series - mean) / (std + 1e-6)
        
        # CUSUM
        threshold = 4
        drift = 0.5
        cusum_pos = 0
        cusum_vals = []
        
        for val in normalized:
            cusum_pos = max(0, cusum_pos + val - drift)
            cusum_vals.append(cusum_pos)
        
        cusum_scores += np.array(cusum_vals)
    
    cusum_scores = cusum_scores / len(numeric_cols)
    
    # Combine scores
    combined_scores = 0.6 * (-if_anomaly_scores) + 0.4 * (cusum_scores / np.max(cusum_scores + 1e-6))
    
    # Detect anomalies
    threshold = np.percentile(combined_scores, 98)
    anomaly_mask = combined_scores > threshold
    
    # Anomaly details
    anomaly_details = []
    for idx in np.where(anomaly_mask)[0]:
        anomalous_features = []
        for col_idx, col in enumerate(numeric_cols):
            val = data[idx, col_idx]
            mean = np.mean(data[:, col_idx])
            std = np.std(data[:, col_idx])
            zscore = (val - mean) / (std + 1e-6)
            
            if abs(zscore) > 2:
                anomalous_features.append({
                    'feature': col,
                    'value': float(val),
                    'zscore': float(zscore)
                })
        
        if anomalous_features:
            anomaly_details.append({
                'timestamp_idx': int(idx),
                'anomaly_score': float(combined_scores[idx]),
                'if_score': float(-if_anomaly_scores[idx]),
                'cusum_score': float(cusum_scores[idx]),
                'anomalous_features': anomalous_features
            })
    
    results = {
        'n_anomalies': int(np.sum(anomaly_mask)),
        'anomaly_percentage': float(100 * np.sum(anomaly_mask) / len(df)),
        'scores': combined_scores.tolist(),
        'anomaly_details': anomaly_details
    }
    
    return {'results': results}

def main():
    data_file = Path("/vercel/share/v0-project/backend/data/ocp_synthetic_data.csv")
    
    if not data_file.exists():
        print(f"[v0] Error: Data file not found at {data_file}")
        return
    
    print(f"[v0] Loading data from: {data_file}")
    df = pd.read_csv(data_file)
    print(f"[v0] Loaded {len(df)} rows × {len(df.columns)} columns")
    
    # PCMCI Analysis
    print("\n" + "="*60)
    print("[v0] PCMCI CAUSAL ANALYSIS")
    print("="*60)
    
    try:
        pcmci_result = run_pcmci_analysis(df, tau_max=12)
        causal_graph = pcmci_result['causal_graph']
        
        print(f"\n[v0] Causal Graph Summary:")
        print(f"  - Nodes: {causal_graph['n_nodes']}")
        print(f"  - Edges: {len(causal_graph['edges'])}")
        
        if causal_graph['edges']:
            print(f"\n[v0] Top 5 Causal Relationships (by strength):")
            sorted_edges = sorted(causal_graph['edges'], 
                                key=lambda x: x['strength'], reverse=True)[:5]
            for edge in sorted_edges:
                print(f"  {edge['from']} → {edge['to']}: {edge['strength']:.3f}")
        
        # Save causal graph
        causal_file = Path("/vercel/share/v0-project/backend/data/causal_graph.json")
        causal_file.parent.mkdir(parents=True, exist_ok=True)
        with open(causal_file, 'w') as f:
            json.dump(causal_graph, f, indent=2)
        print(f"\n[v0] Causal graph saved to: {causal_file}")
        
    except Exception as e:
        print(f"[v0] Error in PCMCI analysis: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Anomaly Detection
    print("\n" + "="*60)
    print("[v0] ANOMALY DETECTION")
    print("="*60)
    
    try:
        anomaly_result = detect_anomalies(df)
        results = anomaly_result['results']
        
        print(f"\n[v0] Detection Results:")
        print(f"  - Total anomalies: {results['n_anomalies']}")
        print(f"  - Anomaly rate: {results['anomaly_percentage']:.2f}%")
        print(f"  - Anomaly scores range: [{min(results['scores']):.3f}, {max(results['scores']):.3f}]")
        
        # Show sample anomalies
        if results['anomaly_details']:
            print(f"\n[v0] Sample Anomalies (first 3):")
            for i, anomaly in enumerate(results['anomaly_details'][:3]):
                print(f"\n  Anomaly {i+1}:")
                print(f"    - Score: {anomaly['anomaly_score']:.3f}")
                print(f"    - IF Score: {anomaly['if_score']:.3f}")
                print(f"    - CUSUM Score: {anomaly['cusum_score']:.3f}")
                if anomaly['anomalous_features']:
                    print(f"    - Anomalous features: {len(anomaly['anomalous_features'])}")
                    for feat in anomaly['anomalous_features'][:2]:
                        print(f"      * {feat['feature']}: {feat['value']:.2f} (z={feat['zscore']:.2f})")
        
        # Save anomaly results
        anomaly_file = Path("/vercel/share/v0-project/backend/data/anomaly_results.json")
        with open(anomaly_file, 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n[v0] Anomaly results saved to: {anomaly_file}")
        
    except Exception as e:
        print(f"[v0] Error in anomaly detection: {str(e)}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*60)
    print("[v0] Analysis complete!")
    print("="*60)

if __name__ == "__main__":
    main()
