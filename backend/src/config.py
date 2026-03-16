"""
Configuration and constants for PCMCI analysis.
"""

from pathlib import Path
from dataclasses import dataclass
from typing import List

# Project directories
PROJECT_ROOT = Path(__file__).parent.parent
DATA_DIR = PROJECT_ROOT / "data"
RESULTS_DIR = PROJECT_ROOT / "results"
MODELS_DIR = PROJECT_ROOT / "models"

# Create directories if they don't exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)


@dataclass
class PCMCIConfig:
    """Configuration for PCMCI causal analysis."""
    
    # Temporal parameters
    tau_max: int = 5  # Maximum time lag
    pc_alpha: float = 0.05  # Significance level for PC algorithm
    
    # Variable list
    variable_names: List[str] = None
    
    def __post_init__(self):
        if self.variable_names is None:
            self.variable_names = [
                'Ambient_Temp',
                'Grid_Demand',
                'Gas_Flow',
                'Heat_Demand',
                'CHP_Output_Elec',
                'CHP_Output_Heat',
                'Boiler_Output',
                'Grid_Export',
                'Fuel_Efficiency'
            ]


@dataclass
class AnomalyDetectionConfig:
    """Configuration for anomaly detection."""
    
    # Isolation Forest parameters
    contamination: float = 0.05  # Expected proportion of anomalies
    n_estimators: int = 100
    random_state: int = 42
    
    # CUSUM parameters
    threshold: float = 5.0  # CUSUM threshold
    drift: float = 0.5  # Reference value for drift detection
    
    # Detection window
    window_size: int = 24  # Hours for rolling statistics


@dataclass
class RLConfig:
    """Configuration for Q-Learning agent."""
    
    # Q-Learning parameters
    gamma: float = 0.95  # Discount factor
    alpha: float = 0.1  # Learning rate
    epsilon: float = 0.1  # Exploration rate
    
    # Action space
    gas_flow_actions: tuple = (-2, -1, 0, 1, 2)  # Changes in m³/h
    boiler_actions: tuple = (-1, 0, 1)  # Changes in MWth
    
    # Reward structure
    efficiency_weight: float = 0.4
    cost_weight: float = 0.3
    emission_weight: float = 0.3
    
    # Training
    n_episodes: int = 100
    max_steps_per_episode: int = 1000
    target_update_frequency: int = 10


@dataclass
class DashboardConfig:
    """Configuration for Dash dashboard."""
    
    # Server
    host: str = '127.0.0.1'
    port: int = 8050
    debug: bool = True
    
    # Refresh interval
    graph_refresh_interval: int = 5000  # milliseconds
    
    # Display settings
    max_points_to_display: int = 500
    default_lookback: str = '7d'  # 7 days


@dataclass
class APIConfig:
    """Configuration for FastAPI server."""
    
    # Server
    host: str = '127.0.0.1'
    port: int = 8000
    reload: bool = True
    
    # CORS
    allow_origins: List[str] = None
    
    def __post_init__(self):
        if self.allow_origins is None:
            self.allow_origins = [
                'http://localhost:3000',
                'http://localhost:8050',
                'http://localhost:8000',
            ]


# Global instances
PCMCI_CONFIG = PCMCIConfig()
ANOMALY_CONFIG = AnomalyDetectionConfig()
RL_CONFIG = RLConfig()
DASHBOARD_CONFIG = DashboardConfig()
API_CONFIG = APIConfig()


# Feature importance thresholds
CAUSAL_STRENGTH_THRESHOLD = 0.3  # Minimum correlation for causal relationship
ANOMALY_SEVERITY_THRESHOLD = 0.7  # Above this is critical
