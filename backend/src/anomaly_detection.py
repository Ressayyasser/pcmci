"""
Anomaly Detection Module for OCP Energy Systems.
Combines Isolation Forest (unsupervised) with CUSUM (sequential).
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional
from scipy import stats


class IsolationForestDetector:
    """Isolation Forest based anomaly detection."""
    
    def __init__(self, contamination: float = 0.02):
        """
        Initialize Isolation Forest detector.
        
        Args:
            contamination: Expected proportion of anomalies (0-1)
        """
        self.contamination = contamination
        self.model = None
        self.threshold = None
        
    def fit(self, data: np.ndarray) -> None:
        """
        Fit Isolation Forest model.
        
        Args:
            data: Input features (N_SAMPLES, N_FEATURES)
        """
        try:
            from sklearn.ensemble import IsolationForest
            self.model = IsolationForest(
                contamination=self.contamination,
                random_state=42,
                n_estimators=100
            )
            self.model.fit(data)
            print("[v0] Isolation Forest fitted")
        except ImportError:
            print("[v0] sklearn not available, using simplified anomaly detection")
            self.model = None
    
    def predict(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Predict anomalies.
        
        Returns:
            Tuple of (predictions, anomaly_scores)
            predictions: -1 for anomaly, 1 for normal
            scores: Anomaly scores (higher = more anomalous)
        """
        if self.model is not None:
            predictions = self.model.predict(data)
            scores = -self.model.score_samples(data)
        else:
            # Simplified: use statistical outliers
            mean = np.mean(data, axis=0)
            std = np.std(data, axis=0)
            z_scores = np.abs((data - mean) / (std + 1e-10))
            predictions = np.where(np.max(z_scores, axis=1) > 3, -1, 1)
            scores = np.max(z_scores, axis=1)
        
        return predictions, scores


class CUSUMDetector:
    """Cumulative Sum Control Chart for sequential anomaly detection."""
    
    def __init__(self, threshold: float = 5.0, drift: float = 0.5):
        """
        Initialize CUSUM detector.
        
        Args:
            threshold: Control limit for CUSUM statistic
            drift: Expected drift (0.5 * sigma by default)
        """
        self.threshold = threshold
        self.drift = drift
        self.cusum_pos = None
        self.cusum_neg = None
        self.mean = None
        self.std = None
        
    def fit(self, data: np.ndarray) -> None:
        """
        Fit CUSUM parameters from training data.
        
        Args:
            data: Training data (N_SAMPLES, N_FEATURES)
        """
        self.mean = np.mean(data, axis=0)
        self.std = np.std(data, axis=0)
        self.cusum_pos = np.zeros(data.shape[1])
        self.cusum_neg = np.zeros(data.shape[1])
        print(f"[v0] CUSUM fitted with mean shape {self.mean.shape}")
    
    def predict(self, data: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
        """
        Detect anomalies using CUSUM.
        
        Args:
            data: Data to check (N_SAMPLES, N_FEATURES)
            
        Returns:
            Tuple of (anomaly_flags, cusum_values)
        """
        if self.mean is None:
            return np.zeros(data.shape[0]), np.zeros(data.shape[0])
        
        anomalies = np.zeros(data.shape[0], dtype=bool)
        cusum_values = np.zeros(data.shape[0])
        
        # Normalize data
        normalized = (data - self.mean) / (self.std + 1e-10)
        
        # Apply CUSUM to each sample
        cusum_pos = np.zeros(data.shape[1])
        cusum_neg = np.zeros(data.shape[1])
        
        for t in range(data.shape[0]):
            sample = normalized[t]
            
            # Update CUSUM statistics
            cusum_pos = np.maximum(0, cusum_pos + sample - self.drift)
            cusum_neg = np.maximum(0, cusum_neg - sample - self.drift)
            
            # Check if any feature exceeds threshold
            max_cusum = np.max(np.maximum(cusum_pos, cusum_neg))
            cusum_values[t] = max_cusum
            
            if max_cusum > self.threshold:
                anomalies[t] = True
        
        return anomalies, cusum_values


class EnergyAnomalyDetector:
    """
    Combined anomaly detector for OCP energy systems.
    Uses Isolation Forest + CUSUM for comprehensive detection.
    """
    
    def __init__(self, 
                 contamination: float = 0.02,
                 cusum_threshold: float = 5.0,
                 ensemble_weight_if: float = 0.6,
                 ensemble_weight_cusum: float = 0.4):
        """
        Initialize Energy Anomaly Detector.
        
        Args:
            contamination: Expected anomaly rate
            cusum_threshold: CUSUM control limit
            ensemble_weight_if: Weight for Isolation Forest in ensemble
            ensemble_weight_cusum: Weight for CUSUM in ensemble
        """
        self.if_detector = IsolationForestDetector(contamination=contamination)
        self.cusum_detector = CUSUMDetector(threshold=cusum_threshold)
        self.ensemble_weight_if = ensemble_weight_if
        self.ensemble_weight_cusum = ensemble_weight_cusum
        self.anomaly_thresholds = {}
        self.feature_names = []
        
    def fit(self, df: pd.DataFrame, 
            feature_columns: Optional[List[str]] = None) -> None:
        """
        Fit both detectors on training data.
        
        Args:
            df: Input dataframe
            feature_columns: Columns to use for detection
        """
        if feature_columns is None:
            feature_columns = [col for col in df.columns 
                              if col not in ['timestamp', 'anomaly_indicator']]
        
        self.feature_names = feature_columns
        data = df[feature_columns].values
        
        # Handle NaN
        data = np.nan_to_num(data, nan=np.nanmean(data, axis=0))
        
        print(f"[v0] Fitting anomaly detectors on {len(feature_columns)} features...")
        
        # Fit both detectors
        self.if_detector.fit(data)
        self.cusum_detector.fit(data)
        
        # Compute per-feature thresholds
        for i, col in enumerate(feature_columns):
            self.anomaly_thresholds[col] = {
                'mean': float(df[col].mean()),
                'std': float(df[col].std()),
                'min': float(df[col].min()),
                'max': float(df[col].max())
            }
    
    def predict(self, df: pd.DataFrame, 
                return_scores: bool = True) -> Dict:
        """
        Detect anomalies using ensemble method.
        
        Args:
            df: Input dataframe
            return_scores: Whether to return anomaly scores
            
        Returns:
            Dictionary with anomaly predictions and details
        """
        data = df[self.feature_names].values
        data = np.nan_to_num(data, nan=np.nanmean(data, axis=0))
        
        # Get predictions from both detectors
        if_preds, if_scores = self.if_detector.predict(data)
        cusum_flags, cusum_scores = self.cusum_detector.predict(data)
        
        # Ensemble scoring
        # Normalize scores to [0, 1]
        if_normalized = (if_scores - if_scores.min()) / (if_scores.max() - if_scores.min() + 1e-10)
        cusum_normalized = (cusum_scores - cusum_scores.min()) / (cusum_scores.max() - cusum_scores.min() + 1e-10)
        
        # Combine scores
        ensemble_scores = (
            self.ensemble_weight_if * if_normalized + 
            self.ensemble_weight_cusum * cusum_normalized
        )
        
        # Determine anomalies (>0.5 threshold)
        predictions = ensemble_scores > 0.5
        
        # Identify anomalous features for each timestamp
        anomaly_details = []
        for t in range(len(df)):
            if predictions[t]:
                anomaly_info = {
                    'timestamp': df.iloc[t]['timestamp'] if 'timestamp' in df.columns else t,
                    'anomaly_score': float(ensemble_scores[t]),
                    'if_score': float(if_scores[t]),
                    'cusum_score': float(cusum_scores[t]),
                    'anomalous_features': []
                }
                
                # Identify which features are anomalous
                for i, col in enumerate(self.feature_names):
                    val = data[t, i]
                    mean = self.anomaly_thresholds[col]['mean']
                    std = self.anomaly_thresholds[col]['std']
                    
                    z_score = (val - mean) / (std + 1e-10)
                    if abs(z_score) > 2:  # 2-sigma threshold
                        anomaly_info['anomalous_features'].append({
                            'feature': col,
                            'value': float(val),
                            'zscore': float(z_score),
                            'expected': float(mean)
                        })
                
                anomaly_details.append(anomaly_info)
        
        return {
            'predictions': predictions,
            'scores': ensemble_scores.tolist(),
            'n_anomalies': int(np.sum(predictions)),
            'anomaly_percentage': float(100 * np.sum(predictions) / len(predictions)),
            'anomaly_details': anomaly_details if return_scores else []
        }


def detect_anomalies(df: pd.DataFrame,
                     feature_columns: Optional[List[str]] = None,
                     fit_on_data: Optional[pd.DataFrame] = None) -> Dict:
    """
    Run complete anomaly detection analysis.
    
    Args:
        df: Data to analyze
        feature_columns: Features to use (default: all numeric except timestamp)
        fit_on_data: Data to fit detectors on (if None, use df)
        
    Returns:
        Detection results
    """
    print("[v0] Starting anomaly detection analysis...")
    
    if feature_columns is None:
        feature_columns = [col for col in df.columns 
                          if col not in ['timestamp', 'anomaly_indicator']]
    
    detector = EnergyAnomalyDetector()
    
    # Fit on data (use full dataset if not provided)
    fit_data = fit_on_data if fit_on_data is not None else df
    detector.fit(fit_data, feature_columns)
    
    # Predict on data
    results = detector.predict(df)
    
    print(f"[v0] Detected {results['n_anomalies']} anomalies ({results['anomaly_percentage']:.2f}%)")
    
    return {
        'detector': detector,
        'results': results,
        'feature_columns': feature_columns
    }
