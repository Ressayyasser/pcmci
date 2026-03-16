#!/usr/bin/env python
"""
Setup script to initialize synthetic data for the OCP system.
Run this first to generate the base dataset.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.data_generator import OCPDataGenerator
from src.preprocessing import DataPreprocessor
from src.config import DATA_DIR, RESULTS_DIR

def main():
    print("=" * 60)
    print("Fair Flow - OCP Data Setup")
    print("=" * 60)
    
    # Generate synthetic data
    print("\n1. Generating synthetic OCP cogeneration data...")
    generator = OCPDataGenerator(seed=42)
    df = generator.generate_dataset(n_samples=8760)  # 1 year of hourly data
    
    data_path = DATA_DIR / "OCP_Plant_01_data.csv"
    df.to_csv(data_path)
    print(f"   ✓ Generated dataset with {len(df)} samples")
    print(f"   ✓ Saved to: {data_path}")
    
    # Preprocess data
    print("\n2. Preprocessing data...")
    preprocessor = DataPreprocessor()
    df_clean = preprocessor.preprocess(df, fill_method='forward', normalize=True)
    
    preprocessed_path = DATA_DIR / "OCP_Plant_01_preprocessed.csv"
    df_clean.to_csv(preprocessed_path)
    print(f"   ✓ Preprocessed dataset")
    print(f"   ✓ Saved to: {preprocessed_path}")
    
    # Data summary
    print("\n3. Data Summary:")
    print(f"   Shape: {df.shape}")
    print(f"   Date range: {df.index.min()} to {df.index.max()}")
    print(f"   Variables: {df.columns.tolist()}")
    print(f"\n   Statistics (first 5 variables):")
    print(df.iloc[:, :5].describe().round(2))
    
    print("\n" + "=" * 60)
    print("Setup complete! Data ready for PCMCI analysis.")
    print("=" * 60)

if __name__ == "__main__":
    main()
