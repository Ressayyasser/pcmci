# Advanced Features Implementation - OCP Cogénération Dashboard

## Project Overview

This update implements a comprehensive system for advanced anomaly detection, causal reasoning, and reinforcement learning-based recommendations for the OCP cogénération energy system. The system provides users with detailed causal graphs, interactive scenario testing, real-time signal control, and explainable AI recommendations.

---

## Architecture

### Backend Modules

#### 1. **DAG Manager** (`backend/src/dag_manager.py`)
- **Purpose**: Manages PCMCI causal discovery graphs with temporal lags
- **Key Classes**:
  - `DAGNode`: Represents system variables (state, exogenous, action)
  - `CausalLink`: Temporal causal relationships with strength, p-value, E-value, and natural explanations
  - `DAGManager`: Main manager for graph operations

- **Features**:
  - Support for temporal lags (τ = 0, 1, 2, 3 months)
  - Significance testing (highly significant, significant, weak, marginal)
  - Robustness quantification using E-values (VanderWeele)
  - Cytoscape.js visualization format export
  - Path finding and strongest link extraction

#### 2. **Signal Controller** (`backend/src/signal_controller.py`)
- **Purpose**: Enables real-time system signal manipulation and scenario simulation
- **Key Classes**:
  - `SignalState`: Current operational state snapshot
  - `AnomalyScenario`: 9 predefined anomaly scenarios for testing
  - `SignalController`: Main controller for state management

- **Anomaly Scenarios**:
  1. **NORMAL**: Baseline operation (no anomalies)
  2. **STEAM_LOSS**: -20% HP steam inlet (upstream supply issues)
  3. **TURBINE_DEGRADATION**: -15% system efficiency (mechanical wear)
  4. **CONDENSER_FOULING**: +8°C condenser temperature (thermal issue)
  5. **LOAD_SPIKE**: +25% electrical demand (grid requirement increase)
  6. **CASCADING_FAILURE**: Multiple simultaneous failures (critical)
  7. **MAINTENANCE_IMPACT**: Controlled shutdown for maintenance
  8. **SEASONAL_VARIATION**: Normal seasonal patterns
  9. **EXTREME_AMBIENT**: High ambient temperature effects

- **Features**:
  - Manual signal adjustment via sliders
  - Scenario-based state transitions
  - State history tracking
  - RL agent callback registration

#### 3. **Explained RL Agent** (`backend/src/explained_rl_agent.py`)
- **Purpose**: Causal MDP agent providing recommendations with SHAP-like feature importance
- **Key Classes**:
  - `ActionType`: 7 control actions (increase GTA, optimize steam, maintenance, etc.)
  - `Recommendation`: Complete recommendation with reasoning, impact, risks, and monitoring metrics
  - `CausalMDPAgent`: Main agent implementing Q-learning with causal constraints

- **Action Types**:
  1. `INCREASE_GTA1/2/3`: Raise generator turbine load (production increase)
  2. `OPTIMIZE_STEAM_ROUTING`: Adjust MP/BP steam split ratio
  3. `ACTIVATE_AUXILIARY_BOILER`: Supplement HP steam during shortage
  4. `MAINTENANCE_CONDENSER`: Emergency condenser cleaning (thermal recovery)
  5. `DO_NOTHING`: Continue normal operation (stability)

- **Explainability Features**:
  - SHAP-style feature importance scores
  - Causal chain reasoning (8+ step sequences)
  - Risk assessment with mitigation strategies
  - Economic impact analysis
  - Step-by-step implementation guides
  - Real-time monitoring metric recommendations

---

## Frontend Pages

### 1. **Causal DAG Page** (`app/causal-dag/page.tsx`)
- **URL**: `/causal-dag`
- **Purpose**: Visualize PCMCI temporal causal graph

- **Features**:
  - Interactive node selection (highlight connections)
  - Variable information display (type, unit, description)
  - Causal links with:
    - Temporal lag visualization (τ)
    - Strength metrics (normalized correlation)
    - P-value significance testing
    - Robustness measures (E-value)
    - Natural language explanations
  - DAG summary statistics
  - PCMCI algorithm explanation

- **Technical Details**:
  - 9 nodes representing system variables
  - 6+ temporal causal relationships with different lags
  - Color-coded significance levels
  - Tabbed interface (Graph, Variables, Links, Summary)

### 2. **Scenario Simulator** (`app/scenario-simulator/page.tsx`)
- **URL**: `/scenario-simulator`
- **Purpose**: Test anomaly scenarios and observe RL agent reactions

- **Features**:
  - 5 anomaly scenarios with detailed descriptions
  - Real-time system state display (9 metrics)
  - RL agent recommendations with:
    - Action type and confidence level
    - Expected reward (Q-value)
    - Detailed reasoning (SHAP-based)
    - Estimated impact on variables
    - Implementation steps
    - Risk assessment
    - Monitoring metrics
    - Feature importance (SHAP values)

- **Interaction Model**:
  - Select scenario → Load system state → Generate recommendation
  - View causal reasoning → Understand implementation
  - Assess risks and economics → Monitor outcomes

### 3. **Real-time Control Dashboard** (`app/realtime-control/page.tsx`)
- **URL**: `/realtime-control`
- **Purpose**: Interactively control system signals and observe derived metric changes

- **Control Signals** (with range sliders):
  1. HP Steam Inlet (100-200 t/h)
  2. GTA1/2/3 Load (20-50 MW each)
  3. Condenser Temperature (25-50°C)

- **Features**:
  - Real-time slider adjustments (0.1 granularity)
  - Automatic derivation of:
    - Total Production (MW)
    - Net Balance (MWh)
    - System Efficiency (%)
    - Anomaly Score (0-1)
  - Dynamic alert generation
  - 20-entry state history tracking
  - Status indicators (increasing/decreasing/stable)

- **System Intelligence**:
  - Cascading calculations based on causal relationships
  - Efficiency degradation due to condenser temperature
  - Anomaly score synthesis from multiple sources
  - Real-time alert threshold checking

### 4. **Explained Recommendations** (`app/explained-recommendations/page.tsx`)
- **URL**: `/explained-recommendations`
- **Purpose**: Detailed causal reasoning for each possible recommendation

- **Recommendation Set** (3 detailed examples):
  1. **Condenser Maintenance**:
     - Confidence: 95%
     - Causal chain: 8 thermodynamic steps
     - Economics: 45k DH cost, 1.8-month payback
     - Risk severity: Medium (production loss)

  2. **Increase GTA1 Load by 5MW**:
     - Confidence: 85%
     - Causal chain: Mechanical power generation sequence
     - Economics: 8.4k DH net benefit, 700% ROI
     - Risk severity: Low-Medium

  3. **Optimize Steam Routing (MP/BP)**:
     - Confidence: 82%
     - Causal chain: Thermodynamic exergy optimization
     - Economics: 8.25k DH monthly benefit, 99.6k DH annual
     - Risk severity: Medium (consumer coordination)

- **Per-Recommendation Content**:
  - Trigger conditions
  - Full causal chain (root cause → system impact)
  - Evidence from PCMCI analysis
  - Step-by-step implementation (5-7 steps)
  - Risk assessment with mitigations
  - Economic impact analysis
  - Monitoring metrics

---

## API Routes

### GET `/api/advanced`

**Query Parameters**:
- `endpoint`: Specify which data to retrieve
  - `dag`: Returns PCMCI causal graph (nodes + edges + summary)
  - `scenario`: Returns system state for anomaly scenario
  - `recommendation`: Returns RL agent recommendation

**Example Requests**:
```
GET /api/advanced?endpoint=dag
GET /api/advanced?endpoint=scenario&scenario=steam_loss
GET /api/advanced?endpoint=recommendation&scenario=condenser_fouling
```

**Response Format**:
- **DAG**: Nodes array, edges array, Cytoscape format, summary statistics
- **Scenario State**: 9 system signal values + timestamp
- **Recommendation**: Action, confidence, impact, reasoning, SHAP values, risks

---

## Key Innovations

### 1. **Causal Reasoning Framework**
- PCMCI (Peter-Clark Momentary Conditional Independence) discovery
- Temporal lag support (distinguishes immediate vs. delayed effects)
- Robustness quantification (E-values for unmeasured confounders)
- Natural language causal explanations

### 2. **Thermodynamic Grounding**
- Recommendations based on fundamental thermodynamic principles
- Isentropic efficiency calculations
- Exergy analysis for steam routing optimization
- Heat balance equations integrated into scenario simulations

### 3. **Explainable AI (XAI)**
- SHAP-style feature importance for each recommendation
- Multi-step causal chains (not black-box decisions)
- Risk assessment with concrete mitigation strategies
- Economic cost-benefit analysis for each action

### 4. **Interactive Learning**
- Real-time signal manipulation with immediate feedback
- Scenario-based testing without risking production
- Observable cascading effects through causal chains
- Actionable monitoring metrics post-recommendation

---

## Navigation Structure

```
Main Dashboard
├── Analysis & Insights (Existing)
│   ├── Analyse PCMCI
│   ├── Anomalies
│   ├── Stratégie RL
│   └── Insights
└── Advanced (New)
    ├── DAG Causal       → /causal-dag
    ├── Scénarios        → /scenario-simulator
    ├── Contrôle Temps-réel → /realtime-control
    └── Explications     → /explained-recommendations
```

---

## Data Flow

```
User Interaction
    ↓
Frontend Component (React state)
    ↓
API Route (/api/advanced)
    ↓
Python Backend Module (dag_manager, signal_controller, explained_rl_agent)
    ↓
Computed Responses (JSON)
    ↓
Frontend Rendering & Visualization
```

---

## Future Extensions

1. **Live Integration with OCP SCADA**:
   - Replace mock data with real-time Modbus/OPC-UA streams
   - Historical data from InfluxDB

2. **Advanced PCMCI**:
   - Implement full PCMCI algorithm (currently using simplified model)
   - Parallel testing for high-dimensional time series

3. **Deep RL Agents**:
   - PPO or DQN agents for multi-objective optimization
   - Model-based predictive control

4. **Predictive Analytics**:
   - 30-day ahead anomaly forecasting
   - Maintenance scheduling optimization

5. **Mobile Dashboard**:
   - React Native app for operator alerts
   - WebSocket real-time notifications

---

## Testing Recommendations

1. **Scenario Validation**:
   - Verify steam_loss scenario cascades to production decrease
   - Confirm condenser_fouling increases anomaly score
   - Test cascading_failure triggers multiple alerts

2. **RL Agent Testing**:
   - Verify maintenance action triggered at >0.6 anomaly score
   - Check GTA1 load increase improves net balance
   - Validate steam routing optimization reduces IPE metric

3. **UI/UX Testing**:
   - Test real-time slider responsiveness
   - Verify causal chain rendering across all recommendations
   - Check SHAP values sum to ~100%

---

## Technology Stack

- **Frontend**: Next.js 16 (React 19), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Python (dataclasses, numpy, pandas, enum)
- **API**: Next.js Route Handlers (TypeScript)
- **Visualization**: Cytoscape.js (DAG), Recharts (charts), Custom SVG

---

## Performance Notes

- DAG nodes: 9 variables
- Causal links: 6+ relationships per scenario
- State history: 20 entries kept in memory
- Recommendation generation: <100ms (mock data)
- API response times: <50ms (Next.js edge runtime)

---

## Compliance & Safety

- All recommendations include risk assessment
- Mitigation strategies for identified hazards
- Monitoring metrics to track recommendation outcomes
- Economic justification for maintenance actions
- SCADA system coordination recommendations

---

**Last Updated**: April 2026
**Version**: 1.0
**Status**: MVP Complete
