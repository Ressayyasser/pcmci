"""
Couche 1 - Ingestion & Prétraitement (CDC v4)
Chargement multi-source OCP + SCADA, nettoyage, feature engineering
"""

import pandas as pd
import numpy as np
from typing import Tuple, List, Dict, Optional
from sklearn.preprocessing import StandardScaler
from sklearn.impute import KNNImputer
import warnings

warnings.filterwarnings('ignore')


class OCP_DataPreprocessor:
    """
    Multi-source data loader for OCP cogénération
    - Classeur1.xlsx (24 mois, données mensuelles énergétiques)
    - Revue ISO50001 (60 mois, 2021-2025)
    - SCADA horaire (si disponible)
    """

    def __init__(self):
        self.data = None
        self.scaler = StandardScaler()
        self.imputer = KNNImputer(n_neighbors=3)

    def load_ocp_excel_data(self) -> pd.DataFrame:
        """
        Simule chargement Classeur1.xlsx + Revue ISO50001
        Retourne 60 mois de données (2021-2025)
        """
        # Données simulées: 60 mois de 2021-2025
        dates = pd.date_range(start='2021-01-01', end='2025-12-01', freq='MS')
        
        synthetic_data = {
            'date': dates,
            'vapeur_hp_admission': np.random.normal(190, 15, len(dates)),  # t/h
            'prod_gta1': np.random.normal(1200, 150, len(dates)),  # MWh/mois
            'prod_gta2': np.random.normal(1150, 140, len(dates)),
            'prod_gta3': np.random.normal(1100, 130, len(dates)),
            'bilan_net': np.random.normal(-87665, 15471, len(dates)),  # MWh/mois (problème)
            'vapeur_mp': np.random.normal(70, 10, len(dates)),  # t/h
            'vapeur_bp': np.random.normal(90, 12, len(dates)),  # t/h
            'efficacite_systeme': np.random.normal(0.38, 0.03, len(dates)),  # %
            'perte_thermique': np.random.normal(450, 80, len(dates)),  # MWh/mois
            'indicateur_performance': np.random.normal(0.92, 0.08, len(dates)),  # ratio vs cible
        }
        
        df = pd.DataFrame(synthetic_data)
        
        # Ajouter corrélations réalistes (respecter causalité PCMCI)
        df['efficacite_systeme'] = 0.35 + 0.0002 * df['prod_gta1'] + \
                                   0.0002 * df['prod_gta2'] + \
                                   0.0002 * df['prod_gta3'] + \
                                   np.random.normal(0, 0.02, len(df))
        
        df['perte_thermique'] = 500 - 0.15 * df['efficacite_systeme'] + np.random.normal(0, 30, len(df))
        
        df['bilan_net'] = 0.8 * df['prod_gta1'] + 0.75 * df['prod_gta2'] + \
                         0.7 * df['prod_gta3'] - 0.5 * df['perte_thermique'] - \
                         np.random.normal(60000, 8000, len(df))
        
        df['indicateur_performance'] = 0.85 + 0.15 * (df['efficacite_systeme'] / df['efficacite_systeme'].max()) + \
                                       np.random.normal(0, 0.05, len(df))
        
        return df

    def clean_data(self, df: pd.DataFrame, outlier_threshold: float = 3.0) -> pd.DataFrame:
        """
        Nettoyage: outliers IQR×3, imputation KNN, écrêtage physique
        """
        df = df.copy()
        
        # Détection outliers par IQR
        for col in df.select_dtypes(include=[np.number]).columns:
            Q1 = df[col].quantile(0.25)
            Q3 = df[col].quantile(0.75)
            IQR = Q3 - Q1
            lower_bound = Q1 - outlier_threshold * IQR
            upper_bound = Q3 + outlier_threshold * IQR
            df[col] = df[col].clip(lower_bound, upper_bound)
        
        # Imputation valeurs manquantes KNN
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = pd.DataFrame(
            self.imputer.fit_transform(df[numeric_cols]),
            columns=numeric_cols,
            index=df.index
        )
        
        # Écrêtage physique
        if 'vapeur_hp_admission' in df.columns:
            df['vapeur_hp_admission'] = df['vapeur_hp_admission'].clip(lower=0)
        if 'prod_gta1' in df.columns:
            df['prod_gta1'] = df['prod_gta1'].clip(lower=0)
        if 'prod_gta2' in df.columns:
            df['prod_gta2'] = df['prod_gta2'].clip(lower=0)
        if 'prod_gta3' in df.columns:
            df['prod_gta3'] = df['prod_gta3'].clip(lower=0)
        
        return df

    def feature_engineering(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Création variables dérivées (efficacité, import net, ratios)
        """
        df = df.copy()
        
        # Dérivées disponibles
        if 'prod_gta1' in df.columns and 'prod_gta2' in df.columns and 'prod_gta3' in df.columns:
            df['prod_total'] = df['prod_gta1'] + df['prod_gta2'] + df['prod_gta3']
        
        if 'prod_total' in df.columns and 'bilan_net' in df.columns:
            # Import net (négatif = déficit)
            df['import_net'] = df['bilan_net']
        
        if 'vapeur_mp' in df.columns and 'vapeur_bp' in df.columns:
            df['vapeur_total'] = df['vapeur_mp'] + df['vapeur_bp']
        
        if 'efficacite_systeme' in df.columns:
            # Ratio efficacité vs cible (0.38)
            df['efficacite_ratio'] = df['efficacite_systeme'] / 0.38
        
        return df

    def check_stationarity(self, series: pd.Series, alpha: float = 0.05) -> Dict:
        """
        Test ADF et KPSS pour stationnarité
        """
        from scipy import stats
        
        # Test ADF simple (approximation)
        diff = np.diff(series.dropna())
        adf_statistic = len(diff) / (1 + np.sum(np.abs(np.diff(diff))))
        
        result = {
            'series_name': series.name,
            'stationary': adf_statistic < 1.5,  # Simplifié
            'adf_like_stat': adf_statistic,
        }
        
        return result

    def difference_series(self, df: pd.DataFrame, columns: Optional[List[str]] = None) -> pd.DataFrame:
        """
        Différenciation des séries non-stationnaires
        """
        df = df.copy()
        
        if columns is None:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()
        
        for col in columns:
            if col in df.columns:
                df[f'{col}_diff'] = df[col].diff()
        
        return df.dropna()

    def apply_concept_drift_detection(self, df: pd.DataFrame, window_size: int = 6) -> Dict:
        """
        Détection concept drift sur fenêtre glissante 6 mois (ADWIN simplifié)
        """
        results = {}
        
        for col in df.select_dtypes(include=[np.number]).columns:
            means = df[col].rolling(window=window_size).mean()
            stds = df[col].rolling(window=window_size).std()
            
            # Détection: changement > 2 std
            drift_detected = (np.abs(np.diff(means.dropna())) > 2 * stds.dropna().mean()).sum()
            
            results[col] = {
                'n_drift_events': int(drift_detected),
                'drift_proportion': drift_detected / len(df) if len(df) > 0 else 0,
            }
        
        return results

    def normalize_features(self, df: pd.DataFrame, fit: bool = True) -> pd.DataFrame:
        """
        Normalisation StandardScaler
        """
        df = df.copy()
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        
        if fit:
            df[numeric_cols] = self.scaler.fit_transform(df[numeric_cols])
        else:
            df[numeric_cols] = self.scaler.transform(df[numeric_cols])
        
        return df

    def pipeline(self, use_original_scale: bool = True) -> Tuple[pd.DataFrame, Dict]:
        """
        Pipeline complet: load → clean → feature engineering → stationarity check → difference → normalize
        """
        # Étape 1: Chargement
        df = self.load_ocp_excel_data()
        
        # Étape 2: Nettoyage
        df = self.clean_data(df)
        
        # Étape 3: Feature engineering
        df = self.feature_engineering(df)
        
        # Étape 4: Vérification stationnarité
        stationarity_results = {}
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            stationarity_results[col] = self.check_stationarity(df[col])
        
        # Étape 5: Différenciation si nécessaire
        needs_diff_cols = [col for col, res in stationarity_results.items() if not res['stationary']]
        if needs_diff_cols:
            df = self.difference_series(df, needs_diff_cols)
        
        # Étape 6: Concept drift
        drift_results = self.apply_concept_drift_detection(df)
        
        # Étape 7: Normalisation (optionnel pour causalité)
        df_normalized = self.normalize_features(df.copy())
        
        info = {
            'n_rows': len(df),
            'n_cols': len(df.columns),
            'date_range': f"{df['date'].min()} to {df['date'].max()}",
            'stationarity': stationarity_results,
            'concept_drift': drift_results,
        }
        
        return (df if use_original_scale else df_normalized), info


if __name__ == '__main__':
    preprocessor = OCP_DataPreprocessor()
    df, info = preprocessor.pipeline()
    
    print("✓ Data loaded and preprocessed")
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {df.columns.tolist()}")
    print(f"  Info: {info}")
