"""
Data preprocessing and preparation for PCMCI analysis.
Handles missing values, normalization, and feature engineering.
"""

import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from pathlib import Path


class DataPreprocessor:
    """Preprocess data for time series causal analysis."""
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.feature_means = None
        self.feature_stds = None
        
    def preprocess(self, df, fill_method='forward', normalize=True):
        """
        Preprocess data for causal analysis.
        
        Args:
            df: DataFrame with time series data
            fill_method: 'forward', 'backward', 'interpolate'
            normalize: Whether to standardize features
        
        Returns:
            Preprocessed DataFrame
        """
        df_clean = df.copy()
        
        # Handle missing values
        if fill_method == 'forward':
            df_clean = df_clean.fillna(method='ffill').fillna(method='bfill')
        elif fill_method == 'interpolate':
            df_clean = df_clean.interpolate(method='linear', limit_direction='both')
        elif fill_method == 'backward':
            df_clean = df_clean.fillna(method='bfill').fillna(method='ffill')
        
        # Handle any remaining NaNs
        df_clean = df_clean.fillna(df_clean.mean())
        
        # Detect and handle outliers (3-sigma rule)
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            mean = df_clean[col].mean()
            std = df_clean[col].std()
            upper_bound = mean + 3 * std
            lower_bound = mean - 3 * std
            
            # Replace outliers with the mean
            df_clean[col] = df_clean[col].clip(lower_bound, upper_bound)
        
        # Normalize if requested
        if normalize:
            df_normalized = pd.DataFrame(
                self.scaler.fit_transform(df_clean[numeric_cols]),
                columns=numeric_cols,
                index=df_clean.index
            )
            df_clean[numeric_cols] = df_normalized
            
            # Store for inverse transform
            self.feature_means = self.scaler.mean_
            self.feature_stds = self.scaler.scale_
        
        return df_clean
    
    def engineer_features(self, df, lag=3):
        """
        Create lagged features for time series analysis.
        
        Args:
            df: DataFrame
            lag: Number of lagged steps to include
        
        Returns:
            DataFrame with original and lagged features
        """
        df_lagged = df.copy()
        
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        for col in numeric_cols:
            for i in range(1, lag + 1):
                df_lagged[f'{col}_lag{i}'] = df[col].shift(i)
        
        # Drop rows with NaN (from lagging)
        df_lagged = df_lagged.dropna()
        
        return df_lagged
    
    def get_causality_features(self, df):
        """Extract features for causal analysis (original + key lags)."""
        # Keep original variables for PCMCI
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        
        # Remove binary/flag columns for causal analysis
        causality_cols = [col for col in numeric_cols 
                         if '_Flag' not in col and '_Anomaly' not in col]
        
        return df[causality_cols]
    
    def inverse_transform(self, normalized_data):
        """Reverse normalization."""
        if self.scaler is None:
            return normalized_data
        return self.scaler.inverse_transform(normalized_data)


def prepare_data_for_analysis(data_path=None, df=None, normalize=True):
    """
    Complete preprocessing pipeline.
    
    Args:
        data_path: Path to CSV file or None
        df: DataFrame (if data_path is None)
        normalize: Normalize features
    
    Returns:
        Tuple of (original_df, preprocessed_df, preprocessor)
    """
    # Load data
    if df is None:
        if data_path is None:
            raise ValueError("Provide either data_path or df")
        df = pd.read_csv(data_path, index_col='timestamp', parse_dates=True)
    
    # Preprocess
    preprocessor = DataPreprocessor()
    df_preprocessed = preprocessor.preprocess(df, normalize=normalize)
    
    return df, df_preprocessed, preprocessor


if __name__ == "__main__":
    # Test preprocessing
    from data_generator import load_or_generate_data
    
    df = load_or_generate_data(n_samples=1000)
    print(f"Original data shape: {df.shape}")
    
    preprocessor = DataPreprocessor()
    df_clean = preprocessor.preprocess(df, normalize=True)
    print(f"Cleaned data shape: {df_clean.shape}")
    print(f"\nCleaned data sample:\n{df_clean.head()}")
    
    # Feature engineering
    df_lagged = preprocessor.engineer_features(df_clean, lag=3)
    print(f"\nLagged features shape: {df_lagged.shape}")
