import { NextRequest, NextResponse } from 'next/server'

// Mock DAG data for PCMCI visualization
function getMockDAG() {
  return {
    nodes: [
      { id: "vapeur_HP_admission", label: "HP Steam Inlet", type: "exogenous", unit: "t/h", description: "High pressure steam from upstream" },
      { id: "GTA1_load", label: "GTA1 Load", type: "state", unit: "MW", description: "Generator 1 electrical output" },
      { id: "GTA2_load", label: "GTA2 Load", type: "state", unit: "MW", description: "Generator 2 electrical output" },
      { id: "GTA3_load", label: "GTA3 Load", type: "state", unit: "MW", description: "Generator 3 electrical output" },
      { id: "prod_total", label: "Total Production", type: "state", unit: "MW", description: "Combined electrical production" },
      { id: "bilan_net", label: "Net Balance", type: "state", unit: "MWh", description: "Net energy balance" },
      { id: "system_efficiency", label: "Efficiency", type: "state", unit: "%", description: "System thermal efficiency" },
      { id: "condenser_temp", label: "Condenser Temp", type: "state", unit: "°C", description: "Condenser outlet temperature" },
      { id: "anomaly_score", label: "Anomaly Score", type: "state", unit: "score", description: "Detected anomaly intensity" },
    ],
    edges: [
      { id: "e1", source: "vapeur_HP_admission", target: "prod_total", lag: 0, strength: 0.92, p_value: 0.001, significance: "highly_significant", explanation: "HP steam directly drives turbine production" },
      { id: "e2", source: "vapeur_HP_admission", target: "GTA1_load", lag: 1, strength: 0.87, p_value: 0.002, significance: "highly_significant", explanation: "HP steam with 1-month lag affects GTA1 efficiency" },
      { id: "e3", source: "GTA1_load", target: "prod_total", lag: 0, strength: 0.81, p_value: 0.005, significance: "significant", explanation: "GTA1 contributes to total production" },
      { id: "e4", source: "prod_total", target: "bilan_net", lag: 0, strength: 0.81, p_value: 0.001, significance: "highly_significant", explanation: "Total production directly impacts net balance" },
      { id: "e5", source: "system_efficiency", target: "bilan_net", lag: 1, strength: -0.68, p_value: 0.008, significance: "significant", explanation: "Low efficiency reduces net balance" },
      { id: "e6", source: "condenser_temp", target: "system_efficiency", lag: 1, strength: -0.71, p_value: 0.003, significance: "highly_significant", explanation: "High condenser temperature degrades efficiency" },
    ],
    summary: {
      num_nodes: 9,
      num_links: 6,
      num_significant_links: 5,
      avg_strength: 0.80,
      max_lag: 2
    }
  }
}

// Mock scenario simulator
function getScenarioState(scenario: string) {
  const baselineState = {
    timestamp: new Date().toISOString(),
    vapeur_HP_admission: 190.0,
    GTA1_load: 38.0,
    GTA2_load: 39.0,
    GTA3_load: 37.0,
    prod_total: 114.0,
    vapeur_MP_soutir: 85.0,
    vapeur_BP_soutir: 45.0,
    bilan_net: 42.5,
    system_efficiency: 78.5,
    condenser_temp: 32.0,
    anomaly_score: 0.05,
    maintenance_flag: false,
  }

  if (scenario === "steam_loss") {
    return {
      ...baselineState,
      vapeur_HP_admission: 152.0,
      prod_total: 91.2,
      bilan_net: 28.5,
      system_efficiency: 72.1,
      anomaly_score: 0.42,
    }
  } else if (scenario === "condenser_fouling") {
    return {
      ...baselineState,
      condenser_temp: 40.0,
      system_efficiency: 71.2,
      bilan_net: 36.8,
      anomaly_score: 0.48,
    }
  } else if (scenario === "load_spike") {
    return {
      ...baselineState,
      GTA1_load: 47.5,
      GTA2_load: 48.8,
      GTA3_load: 46.2,
      prod_total: 142.5,
      bilan_net: 52.3,
      system_efficiency: 75.6,
      anomaly_score: 0.22,
    }
  } else if (scenario === "cascading_failure") {
    return {
      ...baselineState,
      vapeur_HP_admission: 133.0,
      GTA1_load: 28.5,
      GTA2_load: 29.4,
      GTA3_load: 27.1,
      prod_total: 85.0,
      bilan_net: 15.2,
      system_efficiency: 62.5,
      condenser_temp: 44.0,
      anomaly_score: 0.75,
    }
  }
  
  return baselineState
}

// Mock RL recommendations
function generateRLRecommendation(state: any) {
  const { prod_total, bilan_net, system_efficiency, anomaly_score, condenser_temp } = state

  if (anomaly_score > 0.6) {
    return {
      action: "maintenance_condenser",
      confidence: 0.95,
      expected_reward: 15.5,
      estimated_impact: {
        system_efficiency: 5.2,
        anomaly_score: -0.4,
        bilan_net: 6.5,
      },
      detailed_reasoning: [
        `Anomaly score (${anomaly_score.toFixed(3)}) indicates thermal system degradation`,
        `Condenser temperature elevated: ${condenser_temp.toFixed(1)}°C vs target 32°C`,
        "PCMCI shows condenser_temp → system_efficiency (lag=1, strength=-0.71)",
        "Condenser fouling reduces heat rejection, cascading into production loss",
        "Maintenance will restore thermal performance within 4-6 hours",
      ],
      affected_variables: ["system_efficiency", "anomaly_score", "bilan_net"],
      implementation_steps: [
        "Schedule maintenance window (off-peak preferred)",
        "Shut down condenser cooling circuit",
        "Perform mechanical cleaning of condenser tubes",
        "Run pressure test at 2.5 bar for integrity check",
        "Restart and verify temperature drop to <32°C"
      ],
      risks: [
        "Production loss during 4-6 hour maintenance window",
        "Temporary spike in import power from external grid",
        "High cost (~45k DH) vs. benefit calculation required"
      ],
      monitoring_metrics: [
        "Condenser outlet temperature (target: drop 6-8°C)",
        "System efficiency recovery",
        "Anomaly score reduction"
      ],
      shap_values: {
        anomaly_score: 0.45,
        condenser_temp: 0.35,
        system_efficiency: 0.15,
        bilan_net: 0.05
      }
    }
  } else if (bilan_net < 30) {
    return {
      action: "increase_GTA1",
      confidence: 0.85,
      expected_reward: 8.2,
      estimated_impact: {
        prod_total: 8.5,
        bilan_net: 8.2,
        system_efficiency: 1.2,
      },
      detailed_reasoning: [
        `Current production (${prod_total.toFixed(1)} MW) is below capacity target (120 MW)`,
        "PCMCI causal analysis shows strong link: GTA1_load → prod_total (lag=0, strength=0.85)",
        "Increasing GTA1 will directly improve net balance and reduce operational deficit",
        `Expected impact: +8.2 MWh on net balance`,
      ],
      affected_variables: ["prod_total", "bilan_net", "system_efficiency"],
      implementation_steps: [
        "Open GTA1 inlet valve to 85% position",
        "Monitor pressure and temperature for 2 minutes",
        "Adjust load setpoint to +5 MW in SCADA system",
        "Verify voltage stability at PJ5 substation",
        "Confirm production increase within 5 minutes"
      ],
      risks: [
        "Pressure spike if inlet valve opened too quickly → Mitigation: Use gradual ramp",
        "Increased bearing load → Mitigation: Monitor vibration sensors",
        "Grid frequency impact if coordination with grid operator pending"
      ],
      monitoring_metrics: [
        "GTA1 electrical power output",
        "Vibration levels (bearing health)",
        "Steam pressure at turbine inlet",
        "Net energy balance (5-min moving average)"
      ],
      shap_values: {
        bilan_net: 0.40,
        prod_total: 0.35,
        system_efficiency: 0.15,
        anomaly_score: 0.10
      }
    }
  } else if (system_efficiency < 75) {
    return {
      action: "optimize_steam_routing",
      confidence: 0.82,
      expected_reward: 6.4,
      estimated_impact: {
        system_efficiency: 3.5,
        bilan_net: 4.8,
        anomaly_score: -0.1,
      },
      detailed_reasoning: [
        `System efficiency (${system_efficiency.toFixed(1)}%) is below target (78% minimum)`,
        "Causal analysis reveals vapor_MP_soutir affects bilan_net (strength=0.76)",
        "Optimal steam routing will distribute resources between GTA units and MP consumers",
        "This minimizes steam losses and improves thermal efficiency"
      ],
      affected_variables: ["system_efficiency", "bilan_net"],
      implementation_steps: [
        "Access vapor distribution control panel",
        "Check current MP/BP split ratio (target: 60/40)",
        "Adjust distribution valve to optimal position",
        "Monitor IPE (steam/MWh) for 10 minutes",
        "Lock in optimal configuration"
      ],
      risks: [
        "Loss of pressure in MP circuit if not balanced → Mitigation: Monitor pressures continuously"
      ],
      monitoring_metrics: [
        "IPE (vapor/MWh metric)",
        "MP and BP pressure stability",
        "System efficiency improvement trend"
      ],
      shap_values: {
        system_efficiency: 0.50,
        bilan_net: 0.30,
        prod_total: 0.15,
        anomaly_score: 0.05
      }
    }
  }
  
  // Default: do nothing
  return {
    action: "do_nothing",
    confidence: 0.92,
    expected_reward: 0.5,
    estimated_impact: {},
    detailed_reasoning: [
      "System operating within normal parameters",
      `All KPIs stable: Production ${prod_total.toFixed(1)} MW, Efficiency ${system_efficiency.toFixed(1)}%`,
      "Continue monitoring; no intervention required at this moment"
    ],
    affected_variables: [],
    implementation_steps: [],
    risks: [],
    monitoring_metrics: ["General system stability"],
    shap_values: {}
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const endpoint = searchParams.get('endpoint')

  if (endpoint === 'dag') {
    return NextResponse.json(getMockDAG())
  } else if (endpoint === 'scenario') {
    const scenario = searchParams.get('scenario') || 'normal'
    const state = getScenarioState(scenario)
    return NextResponse.json(state)
  } else if (endpoint === 'recommendation') {
    const scenario = searchParams.get('scenario') || 'normal'
    const state = getScenarioState(scenario)
    const recommendation = generateRLRecommendation(state)
    return NextResponse.json(recommendation)
  }

  return NextResponse.json({
    error: 'Invalid endpoint. Use: dag, scenario, recommendation'
  }, { status: 400 })
}
