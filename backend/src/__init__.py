"""
Fair Flow - OCP Energy System Optimization with PCMCI Causal Analysis
"""

__version__ = "0.1.0"
__author__ = "OCP Energy Team"

from .data_generator import OCPDataGenerator, load_or_generate_data
from .preprocessing import DataPreprocessor, prepare_data_for_analysis
from .config import (
    PCMCI_CONFIG,
    ANOMALY_CONFIG,
    RL_CONFIG,
    DASHBOARD_CONFIG,
    API_CONFIG,
    PROJECT_ROOT,
    DATA_DIR,
    RESULTS_DIR,
    MODELS_DIR,
)

__all__ = [
    'OCPDataGenerator',
    'load_or_generate_data',
    'DataPreprocessor',
    'prepare_data_for_analysis',
    'PCMCI_CONFIG',
    'ANOMALY_CONFIG',
    'RL_CONFIG',
    'DASHBOARD_CONFIG',
    'API_CONFIG',
]
