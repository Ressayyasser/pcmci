"""
Real-time Signal Controller & Scenario Simulator
Allows users to modify energy system state in real-time and observe RL agent reactions
"""

from dataclasses import dataclass, field
from typing import Dict, List, Callable, Optional
from datetime import datetime
import numpy as np
import pandas as pd
from enum import Enum


class AnomalyScenario(Enum):
    """Predefined anomaly scenarios for testing"""
    NORMAL = "normal"
    STEAM_LOSS = "steam_loss"  # -20% HP steam
    TURBINE_DEGRADATION = "turbine_degradation"  # -15% efficiency
    CONDENSER_FOULING = "condenser_fouling"  # +10°C condenser temp
    LOAD_SPIKE = "load_spike"  # +25% electrical demand
    CASCADING_FAILURE = "cascading_failure"  # Multiple issues
    MAINTENANCE_IMPACT = "maintenance_impact"  # Controlled shutdown
    SEASONAL_VARIATION = "seasonal_variation"  # Normal seasonal pattern
    EXTREME_AMBIENT = "extreme_ambient"  # High ambient temperature


@dataclass
class SignalState:
    """Current state of energy system signals"""
    timestamp: datetime
    vapeur_HP_admission: float  # t/h
    GTA1_load: float  # MW
    GTA2_load: float  # MW
    GTA3_load: float  # MW
    prod_total: float  # MW
    vapeur_MP_soutir: float  # t/h
    vapeur_BP_soutir: float  # t/h
    bilan_net: float  # MWh
    system_efficiency: float  # %
    condenser_temp: float  # °C
    anomaly_score: float  # 0-1
    maintenance_flag: bool = False
    
    def to_dict(self) -> Dict:
        return {
            "timestamp": self.timestamp.isoformat(),
            "vapeur_HP_admission": round(self.vapeur_HP_admission, 2),
            "GTA1_load": round(self.GTA1_load, 2),
            "GTA2_load": round(self.GTA2_load, 2),
            "GTA3_load": round(self.GTA3_load, 2),
            "prod_total": round(self.prod_total, 2),
            "vapeur_MP_soutir": round(self.vapeur_MP_soutir, 2),
            "vapeur_BP_soutir": round(self.vapeur_BP_soutir, 2),
            "bilan_net": round(self.bilan_net, 2),
            "system_efficiency": round(self.system_efficiency, 2),
            "condenser_temp": round(self.condenser_temp, 2),
            "anomaly_score": round(self.anomaly_score, 3),
            "maintenance_flag": self.maintenance_flag
        }


@dataclass
class ScenarioParameters:
    """Parameters for anomaly scenarios"""
    steam_loss_factor: float = 1.0  # 0.8 = 20% loss
    efficiency_factor: float = 1.0  # 0.85 = 15% degradation
    condenser_temp_offset: float = 0.0  # °C offset
    load_multiplier: float = 1.0  # 1.25 = 25% increase
    ambient_temp_offset: float = 0.0  # °C offset
    maintenance_active: bool = False


class SignalController:
    """
    Real-time signal controller for energy system simulation
    Allows users to modify state variables and observe system reaction
    """
    
    def __init__(self, baseline_state: Optional[SignalState] = None):
        self.current_state = baseline_state or self._create_baseline_state()
        self.state_history: List[SignalState] = [self.current_state]
        self.scenario_params = ScenarioParameters()
        self.rl_agent_callback: Optional[Callable] = None
        self.alert_subscribers: List[Callable] = []
        
    def _create_baseline_state(self) -> SignalState:
        """Create baseline operational state"""
        return SignalState(
            timestamp=datetime.now(),
            vapeur_HP_admission=190.0,
            GTA1_load=38.0,
            GTA2_load=39.0,
            GTA3_load=37.0,
            prod_total=114.0,
            vapeur_MP_soutir=85.0,
            vapeur_BP_soutir=45.0,
            bilan_net=42.5,
            system_efficiency=78.5,
            condenser_temp=32.0,
            anomaly_score=0.05,
            maintenance_flag=False
        )
    
    def apply_scenario(self, scenario: AnomalyScenario):
        """Apply a predefined anomaly scenario"""
        if scenario == AnomalyScenario.NORMAL:
            self.scenario_params = ScenarioParameters()
        
        elif scenario == AnomalyScenario.STEAM_LOSS:
            self.scenario_params = ScenarioParameters(
                steam_loss_factor=0.80,
                efficiency_factor=0.85,
                anomaly_score_boost=0.35
            )
        
        elif scenario == AnomalyScenario.TURBINE_DEGRADATION:
            self.scenario_params = ScenarioParameters(
                efficiency_factor=0.85,
                condenser_temp_offset=3.0,
                anomaly_score_boost=0.25
            )
        
        elif scenario == AnomalyScenario.CONDENSER_FOULING:
            self.scenario_params = ScenarioParameters(
                condenser_temp_offset=8.0,
                efficiency_factor=0.80,
                anomaly_score_boost=0.40
            )
        
        elif scenario == AnomalyScenario.LOAD_SPIKE:
            self.scenario_params = ScenarioParameters(
                load_multiplier=1.25,
                efficiency_factor=0.90,
                anomaly_score_boost=0.20
            )
        
        elif scenario == AnomalyScenario.CASCADING_FAILURE:
            self.scenario_params = ScenarioParameters(
                steam_loss_factor=0.70,
                efficiency_factor=0.70,
                condenser_temp_offset=12.0,
                anomaly_score_boost=0.70
            )
        
        elif scenario == AnomalyScenario.MAINTENANCE_IMPACT:
            self.scenario_params = ScenarioParameters(
                load_multiplier=0.60,
                maintenance_active=True,
                condenser_temp_offset=-5.0
            )
        
        elif scenario == AnomalyScenario.SEASONAL_VARIATION:
            month = datetime.now().month
            if month in [6, 7, 8]:  # Summer
                self.scenario_params = ScenarioParameters(
                    ambient_temp_offset=15.0,
                    efficiency_factor=0.88,
                    condenser_temp_offset=5.0
                )
            else:
                self.scenario_params = ScenarioParameters()
        
        self.update_state()
    
    def update_signal(self, variable: str, value: float):
        """Manually update a single signal variable"""
        if hasattr(self.current_state, variable):
            setattr(self.current_state, variable, value)
            self.update_state()
        else:
            raise ValueError(f"Unknown variable: {variable}")
    
    def update_state(self):
        """Update state based on scenario parameters and trigger RL agent"""
        # Apply scenario modifications
        new_state = SignalState(
            timestamp=datetime.now(),
            vapeur_HP_admission=self.current_state.vapeur_HP_admission * self.scenario_params.steam_loss_factor,
            GTA1_load=self.current_state.GTA1_load * self.scenario_params.load_multiplier,
            GTA2_load=self.current_state.GTA2_load * self.scenario_params.load_multiplier,
            GTA3_load=self.current_state.GTA3_load * self.scenario_params.load_multiplier,
            prod_total=self.current_state.prod_total * self.scenario_params.load_multiplier,
            vapeur_MP_soutir=self.current_state.vapeur_MP_soutir * self.scenario_params.steam_loss_factor,
            vapeur_BP_soutir=self.current_state.vapeur_BP_soutir * self.scenario_params.steam_loss_factor,
            bilan_net=self.current_state.bilan_net * self.scenario_params.efficiency_factor,
            system_efficiency=max(20, self.current_state.system_efficiency * self.scenario_params.efficiency_factor),
            condenser_temp=self.current_state.condenser_temp + self.scenario_params.condenser_temp_offset,
            anomaly_score=min(1.0, self.current_state.anomaly_score + getattr(self.scenario_params, 'anomaly_score_boost', 0.0)),
            maintenance_flag=self.scenario_params.maintenance_active
        )
        
        self.current_state = new_state
        self.state_history.append(new_state)
        
        # Trigger RL agent callback if registered
        if self.rl_agent_callback:
            self.rl_agent_callback(new_state)
    
    def get_state_delta(self) -> Dict:
        """Get changes from previous state to current state"""
        if len(self.state_history) < 2:
            return {}
        
        prev = self.state_history[-2]
        curr = self.state_history[-1]
        
        return {
            "vapeur_HP_admission_change": round(curr.vapeur_HP_admission - prev.vapeur_HP_admission, 2),
            "prod_total_change": round(curr.prod_total - prev.prod_total, 2),
            "bilan_net_change": round(curr.bilan_net - prev.bilan_net, 2),
            "system_efficiency_change": round(curr.system_efficiency - prev.system_efficiency, 2),
            "condenser_temp_change": round(curr.condenser_temp - prev.condenser_temp, 2),
            "anomaly_score_change": round(curr.anomaly_score - prev.anomaly_score, 3)
        }
    
    def register_rl_agent(self, callback: Callable):
        """Register callback function to be called when state changes"""
        self.rl_agent_callback = callback
    
    def subscribe_to_alerts(self, callback: Callable):
        """Subscribe to system alerts"""
        self.alert_subscribers.append(callback)
    
    def get_current_state(self) -> Dict:
        """Get current system state as dict"""
        return self.current_state.to_dict()
    
    def get_state_history(self, last_n: int = 10) -> List[Dict]:
        """Get last n states from history"""
        return [s.to_dict() for s in self.state_history[-last_n:]]
    
    def reset_to_baseline(self):
        """Reset system to baseline state"""
        self.current_state = self._create_baseline_state()
        self.state_history = [self.current_state]
        self.scenario_params = ScenarioParameters()
    
    def export_scenario(self) -> Dict:
        """Export current scenario configuration"""
        return {
            "parameters": {
                "steam_loss_factor": self.scenario_params.steam_loss_factor,
                "efficiency_factor": self.scenario_params.efficiency_factor,
                "condenser_temp_offset": self.scenario_params.condenser_temp_offset,
                "load_multiplier": self.scenario_params.load_multiplier,
                "ambient_temp_offset": self.scenario_params.ambient_temp_offset,
                "maintenance_active": self.scenario_params.maintenance_active
            },
            "current_state": self.current_state.to_dict(),
            "state_history": self.get_state_history()
        }
