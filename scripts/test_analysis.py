#!/usr/bin/env python3
"""
Test PCMCI and Anomaly Detection modules.
"""

import sys
import pandas as pd
import numpy as np
from pathlib import Path

# Add backend to path
sys.path.insert(0, "/vercel/share/v0-project/backend")

from src.pcmci_analysis import run_pcmci_analysis
from src.anomaly_detection import detect_anomalies

def main():
    print("[v0] Loading synthetic data...")
    
    data_file = Path("/vercel/share/v0-project/backend/data/ocp_synthetic_data.csv")
    if not data_file.exists():
        print(f"[v0] Error: Data file not found at {data_file}")
        return
    
    df = pd.read_csv(data_file)
    print(f"[v0] Loaded {len(df)} rows × {len(df.columns)} columns")
    
    # Test PCMCI Analysis
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
        import json
        causal_file = Path("/vercel/share/v0-project/backend/data/causal_graph.json")
        with open(causal_file, 'w') as f:
            json.dump(causal_graph, f, indent=2)
        print(f"\n[v0] Causal graph saved to: {causal_file}")
        
    except Exception as e:
        print(f"[v0] Error in PCMCI analysis: {str(e)}")
        import traceback
        traceback.print_exc()
    
    # Test Anomaly Detection
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
        import json
        anomaly_file = Path("/vercel/share/v0-project/backend/data/anomaly_results.json")
        
        # Convert numpy/pandas objects to JSON-serializable format
        anomaly_output = {
            'n_anomalies': results['n_anomalies'],
            'anomaly_percentage': results['anomaly_percentage'],
            'scores': results['scores'],
            'anomaly_details': results['anomaly_details'][:10]  # Save first 10
        }
        
        with open(anomaly_file, 'w') as f:
            json.dump(anomaly_output, f, indent=2)
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
