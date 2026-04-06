# Backend Modules Documentation

This document describes the Python backend modules that power the advanced features in the OCP Cogénération Dashboard.

## Module Overview

Three core Python modules handle causal reasoning, scenario simulation, and RL-based recommendations:

1. **`dag_manager.py`** - PCMCI Causal Graph Management
2. **`signal_controller.py`** - Real-time Signal & Scenario Control
3. **`explained_rl_agent.py`** - RL Agent with SHAP Explainability

---

## Module 1: DAG Manager

**File**: `backend/src/dag_manager.py`

### Purpose
Manages Peter-Clark Momentary Conditional Independence (PCMCI) temporal causal graphs with support for:
- Multiple temporal lags (τ = 0, 1, 2, 3, ...)
- Statistical significance testing
- Robustness quantification (E-values)
- Causal path discovery
- Visualization format generation

### Key Classes

#### `LinkSignificance` (Enum)
Categorizes statistical significance of causal relationships:
```python
HIGHLY_SIGNIFICANT = "highly_significant"  # p < 0.01
SIGNIFICANT = "significant"                # p < 0.05
WEAK = "weak"                              # p < 0.10
MARGINAL = "marginal"                      # p < 0.20
```

#### `CausalLink`
Represents a temporal causal relationship X(t-τ) → Y(t):

```python
@dataclass
class CausalLink:
    source: str                           # Source variable
    target: str                           # Target variable
    lag: int                              # Temporal lag in months
    strength: float                       # Normalized effect size (-1 to +1)
    p_value: float                        # Statistical significance
    confidence_interval: Tuple[float, float]  # CI for strength
    e_value: float                        # Robustness measure (VanderWeele)
    significance: LinkSignificance        # Categorical significance
    explanation: str                      # Human-readable explanation
```

#### `DAGNode`
Represents a system variable:

```python
@dataclass
class DAGNode:
    name: str                    # Variable ID
    variable_type: str           # "state", "action", "exogenous"
    unit: str                    # Physical unit (t/h, MW, %, etc.)
    description: str             # Human-readable description
    temporal_lags: List[int]    # Lags to consider [0, 1, 2, 3]
```

#### `DAGManager`
Main class for DAG operations:

**Key Methods**:
- `add_node(name, type, unit, description)` - Add variable to graph
- `add_causal_link(source, target, lag, strength, p_value, ci, e_value, explanation)` - Add causal relationship
- `get_cytoscape_graph()` - Export for Cytoscape.js visualization
- `get_strongest_links(n=10)` - Get top-N strongest causal relationships
- `get_links_for_variable(variable, direction='both')` - Get causal neighbors
- `get_causal_paths(source, target, max_depth=3)` - Find causal paths
- `get_dag_summary()` - Summary statistics
- `to_json()` - Complete export to JSON

### Usage Example

```python
from dag_manager import DAGManager

# Create and populate DAG
dag = DAGManager()

# Add nodes (system variables)
dag.add_node("vapeur_HP", "exogenous", "t/h", "HP steam inlet")
dag.add_node("prod_total", "state", "MW", "Total production")
dag.add_node("efficiency", "state", "%", "System efficiency")

# Add causal links
dag.add_causal_link(
    source="vapeur_HP",
    target="prod_total",
    lag=0,
    strength=0.92,
    p_value=0.001,
    confidence_interval=(0.88, 0.96),
    e_value=12.5,
    explanation="HP steam directly drives turbine production"
)

# Query the graph
strongest = dag.get_strongest_links(10)
paths = dag.get_causal_paths("vapeur_HP", "efficiency", max_depth=3)
graph_json = dag.to_json()
```

---

## Module 2: Signal Controller

**File**: `backend/src/signal_controller.py`

### Purpose
Enables real-time manipulation of system signals with automatic computation of derived metrics. Supports 9 predefined anomaly scenarios for testing RL recommendations without risking production.

### Key Classes

#### `SignalState`
Snapshot of current operational state:

```python
@dataclass
class SignalState:
    timestamp: datetime
    vapeur_HP_admission: float      # t/h
    GTA1_load: float                # MW
    GTA2_load: float                # MW
    GTA3_load: float                # MW
    prod_total: float               # MW
    vapeur_MP_soutir: float         # t/h
    vapeur_BP_soutir: float         # t/h
    bilan_net: float                # MWh
    system_efficiency: float        # %
    condenser_temp: float           # °C
    anomaly_score: float            # 0-1
    maintenance_flag: bool = False
```

#### `AnomalyScenario` (Enum)
9 predefined anomaly scenarios:

```python
NORMAL = "normal"
STEAM_LOSS = "steam_loss"                        # -20% HP steam
TURBINE_DEGRADATION = "turbine_degradation"      # -15% efficiency
CONDENSER_FOULING = "condenser_fouling"          # +8°C condenser temp
LOAD_SPIKE = "load_spike"                        # +25% demand
CASCADING_FAILURE = "cascading_failure"          # Multiple failures
MAINTENANCE_IMPACT = "maintenance_impact"        # -60% load
SEASONAL_VARIATION = "seasonal_variation"        # Seasonal pattern
EXTREME_AMBIENT = "extreme_ambient"              # +15°C ambient
```

#### `ScenarioParameters`
Parameters that define how a scenario modifies system state:

```python
@dataclass
class ScenarioParameters:
    steam_loss_factor: float = 1.0         # 0.8 = 20% loss
    efficiency_factor: float = 1.0         # 0.85 = 15% degradation
    condenser_temp_offset: float = 0.0     # °C offset
    load_multiplier: float = 1.0           # 1.25 = 25% increase
    ambient_temp_offset: float = 0.0       # °C offset
    maintenance_active: bool = False
```

#### `SignalController`
Main controller for state manipulation:

**Key Methods**:
- `apply_scenario(scenario: AnomalyScenario)` - Apply predefined scenario
- `update_signal(variable: str, value: float)` - Manually adjust signal
- `update_state()` - Recalculate derived metrics
- `get_state_delta()` - Get changes since last state
- `register_rl_agent(callback)` - Register callback for state changes
- `get_current_state()` - Get current state as dict
- `get_state_history(last_n=10)` - Get history of last N states
- `reset_to_baseline()` - Reset to baseline operation
- `export_scenario()` - Export current scenario config

### Usage Example

```python
from signal_controller import SignalController, AnomalyScenario

# Create controller
controller = SignalController()

# Apply scenario
controller.apply_scenario(AnomalyScenario.STEAM_LOSS)

# Get current state
state = controller.get_current_state()
print(f"Production: {state['prod_total']} MW")
print(f"Anomaly Score: {state['anomaly_score']}")

# Manually adjust a signal
controller.update_signal("GTA1_load", 45.0)

# Register RL agent callback
def on_state_change(new_state):
    print(f"State changed: {new_state}")

controller.register_rl_agent(on_state_change)

# Get history
history = controller.get_state_history(last_n=5)
```

---

## Module 3: Explained RL Agent

**File**: `backend/src/explained_rl_agent.py`

### Purpose
Implements a causal MDP (Markov Decision Process) agent that:
1. Analyzes current system state
2. Selects optimal action using Q-learning
3. Explains the decision with SHAP-like feature importance
4. Quantifies risks and economic impacts
5. Provides step-by-step implementation guidance

### Key Classes

#### `ActionType` (Enum)
Available control actions:

```python
INCREASE_GTA1 = "increase_GTA1"               # Raise generator load
INCREASE_GTA2 = "increase_GTA2"               # Raise generator load
INCREASE_GTA3 = "increase_GTA3"               # Raise generator load
OPTIMIZE_STEAM_ROUTING = "optimize_steam_routing"  # Adjust MP/BP split
ACTIVATE_AUXILIARY_BOILER = "activate_auxiliary_boiler"  # Supplement steam
MAINTENANCE_CONDENSER = "maintenance_condenser"  # Thermal recovery
DO_NOTHING = "do_nothing"                     # No action needed
```

#### `Recommendation`
Complete recommendation with multiple forms of explanation:

```python
@dataclass
class Recommendation:
    action: ActionType
    confidence: float                    # 0-1
    expected_reward: float               # Q-value
    estimated_impact: Dict[str, float]  # Variable changes
    detailed_reasoning: List[str]        # Human-readable explanations
    affected_variables: List[str]        # Variables impacted
    implementation_steps: List[str]      # Step-by-step guide
    risks: List[str]                     # Identified risks
    monitoring_metrics: List[str]        # Metrics to track
    shap_values: Optional[Dict[str, float]]  # Feature importance
```

#### `CausalMDPAgent`
Main RL agent class:

**Key Methods**:
- `get_recommendation(current_state: Dict, causal_links: List[Dict]) → Recommendation`
  - Main method: analyzes state and returns recommendation
  
**Internal Methods** (for customization):
- `discretize_state(state_dict)` - Convert continuous state to discrete
- `_select_action(prod, balance, efficiency, anomaly, temp)` - Action selection logic
- `_explain_action(action, state, causal_links, ...)` - Generate reasoning
- `_calculate_shap_values(state, action, causal_links)` - Feature importance
- `_estimate_impact(action, state)` - Impact quantification
- `_get_implementation_steps(action)` - Implementation guide
- `_get_risk_assessment(action, state)` - Risk identification
- `_get_monitoring_metrics(action)` - Metrics to monitor

### Decision Logic

The agent uses **priority-based decision making**:

```
if anomaly_score > 0.6:
    → CRITICAL: Activate emergency action (maintenance or boiler)
else if bilan_net < 30:
    → LOW BALANCE: Increase production (GTA1/2/3)
else if efficiency < 75:
    → LOW EFFICIENCY: Optimize steam routing
else if condenser_temp > 36:
    → HIGH TEMP: Schedule maintenance
else:
    → DO_NOTHING: Continue monitoring
```

### Usage Example

```python
from explained_rl_agent import CausalMDPAgent

# Create agent
agent = CausalMDPAgent()

# Current system state (from SignalController)
state = {
    "prod_total": 91.2,
    "bilan_net": 28.5,
    "system_efficiency": 72.1,
    "anomaly_score": 0.42,
    "condenser_temp": 40.0
}

# Causal links (from DAGManager)
causal_links = [
    {"source": "vapeur_HP", "target": "prod_total", "strength": 0.92}
    # ... more links
]

# Get recommendation
rec = agent.get_recommendation(state, causal_links)

print(f"Action: {rec.action.value}")
print(f"Confidence: {rec.confidence:.0%}")
print(f"Expected Reward: {rec.expected_reward}")
print(f"\nReasoning:")
for reason in rec.detailed_reasoning:
    print(f"  • {reason}")
print(f"\nImplementation Steps:")
for step in rec.implementation_steps:
    print(f"  {step}")
print(f"\nRisks:")
for risk in rec.risks:
    print(f"  ⚠️  {risk}")
print(f"\nMonitoring:")
for metric in rec.monitoring_metrics:
    print(f"  📊 {metric}")
```

---

## Integration with Frontend

### API Route Handler

**File**: `app/api/advanced/route.ts`

Maps Python modules to HTTP endpoints:

```typescript
GET /api/advanced?endpoint=dag
  → Returns DAGManager.get_cytoscape_graph()

GET /api/advanced?endpoint=scenario&scenario=steam_loss
  → Returns SignalController.apply_scenario(scenario).get_current_state()

GET /api/advanced?endpoint=recommendation&scenario=condenser_fouling
  → Returns CausalMDPAgent.get_recommendation(state, causal_links)
```

---

## Extension Points

### Adding New Anomaly Scenarios

1. Add new enum value to `AnomalyScenario`:
```python
EQUIPMENT_FAILURE = "equipment_failure"
```

2. Add scenario handling in `SignalController.apply_scenario()`:
```python
elif scenario == AnomalyScenario.EQUIPMENT_FAILURE:
    self.scenario_params = ScenarioParameters(
        steam_loss_factor=0.60,
        efficiency_factor=0.50,
        anomaly_score_boost=0.85
    )
```

### Adding New Actions

1. Add to `ActionType` enum:
```python
ACTIVATE_STEAM_ACCUMULATOR = "activate_steam_accumulator"
```

2. Add reasoning in `_explain_action()`:
```python
elif action == ActionType.ACTIVATE_STEAM_ACCUMULATOR:
    reasoning.append("Steam accumulator provides thermal mass...")
```

3. Add impact in `_estimate_impact()`:
```python
elif action == ActionType.ACTIVATE_STEAM_ACCUMULATOR:
    impacts["bilan_net"] = 3.2
    impacts["system_efficiency"] = 0.8
```

### Adding New Variables to DAG

1. Create node:
```python
dag.add_node(
    "new_variable",
    "state",
    "unit",
    "Description"
)
```

2. Add causal links to existing nodes:
```python
dag.add_causal_link(
    "vapeur_HP", "new_variable", 0,
    0.65, 0.01, (0.58, 0.72), 7.2,
    "Description of causal mechanism"
)
```

---

## Performance Considerations

- **DAG operations**: O(n) for node/link lookup (9 nodes)
- **Scenario application**: O(1) - direct parameter substitution
- **Recommendation generation**: O(n+m) where m = causal links (~6)
- **SHAP calculation**: O(n) feature normalization

All operations complete in <50ms for mock data.

---

## Testing

To test the modules directly:

```python
# Test DAG creation and queries
dag = create_sample_dag()
assert len(dag.nodes) == 9
assert len(dag.links) == 6

# Test scenario simulation
controller = SignalController()
controller.apply_scenario(AnomalyScenario.STEAM_LOSS)
assert controller.current_state.anomaly_score > 0.3

# Test RL agent
agent = CausalMDPAgent()
rec = agent.get_recommendation(test_state, test_links)
assert rec.confidence > 0.0
assert len(rec.detailed_reasoning) > 0
```

---

## References

- PCMCI Algorithm: Runge et al. (2019) "Inferring causal graphs from time series data"
- E-values: VanderWeele & Ding (2017) "Sensitivity Analysis in Observational Research"
- SHAP: Lundberg & Lee (2017) "A Unified Approach to Interpreting Model Predictions"
- Thermodynamics: NIST Steam Tables + First Law of Thermodynamics

---

**Last Updated**: April 2026
**Version**: 1.0
