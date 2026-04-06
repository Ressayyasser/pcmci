# Quick Start Guide - Advanced Features

## What's New?

Your OCP Cogénération Dashboard now includes **4 new advanced pages** for causal analysis, scenario testing, interactive control, and detailed recommendations.

---

## New Pages Overview

### 1. DAG Causal (`/causal-dag`)
**Understand system relationships**

What you'll find:
- Interactive temporal causal graph showing how system variables influence each other
- Each arrow represents a "cause → effect" relationship with a time lag (e.g., "past steam pressure affects today's efficiency")
- Click any variable to highlight its causes and effects
- See the strength of each relationship (0.0 = weak, 1.0 = strong) and confidence levels

Example insight:
- "Condenser temperature at time T affects system efficiency 1 month later"
- Strength: 0.71 | P-value: 0.003 | Very confident

**Use this when**: You want to understand which variables drive changes in your system

---

### 2. Scenario Simulator (`/scenario-simulator`)
**Test anomalies without risk**

What you can do:
1. Select an anomaly scenario (Steam Loss, Condenser Fouling, Load Spike, Cascading Failure, or Normal)
2. See how the system state changes
3. Watch the RL agent automatically recommend an action
4. Read the detailed causal reasoning explaining WHY that action makes sense

Example:
```
Scenario: Condenser Fouling (+8°C temperature)
↓
System efficiency drops to 71% (from 78%)
↓
RL Agent Recommendation: "Activate Condenser Maintenance"
↓
Confidence: 95% | Expected Reward: 15.5
↓
Why: "High condenser temperature reduces heat rejection → increases back-pressure on turbine → destroys efficiency"
```

**Use this when**: You want to test how the system reacts to problems before they happen

---

### 3. Real-time Control (`/realtime-control`)
**Adjust signals and watch the cascading effects**

What you can do:
1. Use sliders to adjust 5 key signals:
   - HP Steam Inlet (100-200 t/h)
   - GTA1/2/3 Load (20-50 MW each)
   - Condenser Temperature (25-50°C)

2. Watch the system automatically calculate:
   - Total Production (MW)
   - Net Balance (MWh)
   - System Efficiency (%)
   - Anomaly Score (0-1)

3. View real-time history of your changes
4. Get instant alerts if metrics cross critical thresholds

Example:
```
You increase GTA1_load from 38 to 43 MW
↓
AUTOMATIC: Total production increases by 5 MW
AUTOMATIC: Net balance improves by 8.2 MWh
AUTOMATIC: Anomaly score stays stable
```

**Use this when**: You want to understand the real-time consequences of control actions

---

### 4. Explained Recommendations (`/explained-recommendations`)
**Deep dive into each possible action**

Each recommendation includes:

**1. Causal Chain** (Why it works)
- 8-step sequence from root cause to system improvement
- Example: "Fouling reduces heat transfer → temperature rises → efficiency drops → (our action) cleans condenser → heat transfers again → efficiency recovers"

**2. Evidence** (Why we're confident)
- PCMCI causal analysis results
- P-values showing statistical significance
- Temporal lag explanations

**3. Implementation** (How to do it)
- Step-by-step instructions (5-7 steps)
- Safety considerations
- Coordination requirements

**4. Impact** (What changes)
- Operational metrics (efficiency +5.2%, temperature -8°C)
- Economic impact (45k DH cost, 1.8-month payback)
- Revenue implications

**5. Risks** (What could go wrong)
- Identified risks with severity levels (High/Medium/Low)
- Concrete mitigation strategies for each risk
- Examples: "Pressure spike risk → Solution: Use gradual ramp (1 MW/min max)"

**6. Monitoring** (What to watch)
- Key metrics to track after action implementation
- Target values and normal ranges

Example Recommendation: **Condenser Maintenance**
```
Trigger:        Temperature > 38°C + Efficiency < 75%
Confidence:     95%
Expected Gain:  15.5 Q-value
Economics:      -45k DH cost, +3000 MWh annual gain, 1.8-month payback
Implementation: 7 steps, 4-6 hours total
Main Risks:     Production loss (mitigated by off-peak scheduling)
```

**Use this when**: You need to understand the full implications of a recommendation before implementing it

---

## Typical User Workflows

### Workflow 1: "What caused the anomaly?"
1. Go to Dashboard → See anomaly alert
2. Visit **DAG Causal** → Click the anomaly score node → Trace backward through causal links
3. Identify root cause variables
4. Go to **Real-time Control** → Adjust those variables to see effect

### Workflow 2: "What if we had a steam shortage?"
1. Visit **Scenario Simulator**
2. Select "Steam Loss" scenario
3. Read the RL recommendation + confidence level
4. Read "Why This Works" section to understand the reasoning
5. Go to **Explained Recommendations** for full implementation details

### Workflow 3: "Should we do condenser maintenance?"
1. Visit **Explained Recommendations** → Select "Activate Condenser Maintenance"
2. Read the 8-step causal chain
3. Review risks and mitigations
4. Check economics (payback period)
5. Make informed decision with full context

### Workflow 4: "How will this control action affect production?"
1. Visit **Real-time Control**
2. Adjust the relevant slider (e.g., increase GTA1 load)
3. Watch derived metrics update in real-time
4. View history table to see the exact impacts
5. Understand trade-offs immediately

---

## Key Concepts

### Temporal Lag (τ)
- "How far in the past does cause X affect effect Y?"
- τ=0: Immediate effect (same time period)
- τ=1: 1-month lagged effect
- τ=2: 2-month lagged effect

### Confidence Level
- "How sure is the RL agent about this recommendation?"
- 95% = Very confident (do it)
- 85% = Confident (consider doing it)
- 70% = Somewhat confident (monitor before acting)

### E-value (Robustness)
- "How strong would confounding need to be to invalidate this causal link?"
- E-value > 8: Very robust (confounders would need 8× strength to matter)
- E-value > 3: Moderately robust
- E-value < 2: Weak (could be confounded)

### SHAP Values
- "Which variables mattered most for this decision?"
- Percentage breakdown (should sum to ~100%)
- Example: 45% anomaly_score, 35% condenser_temp, 15% efficiency, 5% balance

---

## Important Notes

### Real-time Control Safety
- All sliders have min/max limits reflecting physical constraints
- System won't let you set impossible values
- Derived metrics are calculated based on thermodynamic principles
- Anomaly score synthesizes multiple warning signals

### Scenario Simulator Fidelity
- Scenarios are realistic but simplified
- Actual system response may vary ±5% due to unmodeled dynamics
- Use for testing conceptual approaches, not exact predictions

### Recommendation Confidence Levels
- Based on Q-learning training on historical data (simulated)
- Real SCADA integration would improve confidence through more training data
- Always cross-check recommendations against domain expertise

---

## Tips & Tricks

1. **Trace a causal link**: Go to DAG Causal → Click source variable → See all downstream effects
2. **Test before implementing**: Use Scenario Simulator to see RL recommendation without real action
3. **Understand the cascade**: Use Real-time Control to see how your action propagates through the system
4. **Make informed decisions**: Read Explained Recommendations for full economic analysis
5. **Monitor outcome**: After implementing a recommendation, check the monitoring metrics section

---

## Troubleshooting

**Q: Why does the RL agent recommend "Do Nothing"?**
A: System is operating within normal parameters. No intervention needed. Continue monitoring.

**Q: Why do derived metrics change when I adjust one signal?**
A: Causal relationships! That signal affects other variables through the causal chains shown in DAG Causal.

**Q: Why is the anomaly score so high?**
A: Multiple warning signals triggered simultaneously. Check Real-time Control alerts. Visit Explained Recommendations for recommended action.

**Q: Can I change my mind mid-implementation?**
A: Use Real-time Control to reset to baseline and start over.

---

## Next Steps

1. **Explore the DAG**: Understand your system's causal structure
2. **Test a scenario**: See how the system reacts to anomalies
3. **Play with controls**: Adjust signals and observe cascading effects
4. **Read a recommendation**: Deep dive into one action's full implications
5. **Make a decision**: Use this knowledge to improve system operations

---

**Questions?** Contact your system administrator or refer to the detailed technical documentation in `ADVANCED_FEATURES.md`
