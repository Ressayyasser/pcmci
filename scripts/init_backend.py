#!/usr/bin/env python3
"""
Initialize backend: Generate synthetic data and prepare datasets
"""
import sys
import os
from pathlib import Path

# Add backend to path
backend_path = Path("/vercel/share/v0-project/backend")
sys.path.insert(0, str(backend_path))

from src.data_generator import DataGenerator
from src.config import Config
import pandas as pd

def main():
    print("[v0] Initializing OCP Energy Analysis Backend...")
    
    # Initialize config
    config = Config()
    print(f"[v0] Config loaded: {len(config.VARIABLES)} variables")
    
    # Create data generator
    generator = DataGenerator(config)
    print("[v0] DataGenerator initialized")
    
    # Generate synthetic data
    print("[v0] Generating 365 days of synthetic data...")
    df = generator.generate_timeseries(
        n_days=365,
        noise_level=0.15,
        anomaly_probability=0.02,
        anomaly_severity=0.3
    )
    
    print(f"[v0] Data generated: shape={df.shape}")
    print(f"[v0] Columns: {list(df.columns)}")
    print(f"[v0] Date range: {df.index[0]} to {df.index[-1]}")
    print(f"[v0] Missing values: {df.isnull().sum().sum()}")
    
    # Save to CSV
    output_dir = backend_path / "data"
    output_dir.mkdir(exist_ok=True)
    
    csv_path = output_dir / "ocp_energy_data.csv"
    df.to_csv(csv_path)
    print(f"[v0] Data saved to {csv_path}")
    
    # Save metadata
    metadata = {
        "n_rows": len(df),
        "n_columns": len(df.columns),
        "date_range": f"{df.index[0]} to {df.index[-1]}",
        "variables": list(df.columns),
        "anomaly_count": (df['is_anomaly'] == True).sum() if 'is_anomaly' in df.columns else 0
    }
    
    print(f"[v0] Metadata: {metadata}")
    print("[v0] Backend initialization complete!")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
