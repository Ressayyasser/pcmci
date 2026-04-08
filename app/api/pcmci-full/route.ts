import { NextRequest, NextResponse } from 'next/server'

/**
 * API Route: Complete PCMCI Analysis
 * Integrates Data Preprocessing (Layer 1) + Causality (Layer 2) + Anomaly Detection (Layer 3)
 * 
 * Based on CDC v4 Chapters 3.1-3.4
 */

interface PCMCIResponse {
  status: 'success' | 'error'
  data: {
    dag: {
      nodes: Array<{
        id: string
        label: string
        type: 'exogenous' | 'state' | 'endogenous'
        unit: string
        description: string
      }>
      edges: Array<{
        id: string
        source: string
        target: string
        lag: number
        strength: number
        p_value: number
        granger_pvalue: number
        e_value: number
        explanation: string
      }>
      summary: {
        num_nodes: number
        num_links: number
        num_significant_links: number
        avg_strength: number
        max_lag: number
      }
    }
    anomalies: {
      detected: Array<{
        variable: string
        timestamp: string
        residual_value: number
        anomaly_score: number
        severity: 'low' | 'medium' | 'high'
      }>
      summary: {
        total_detected: number
        by_variable: Record<string, number>
        critical_scada_alerts: number
      }
    }
    data_quality: {
      n_observations: number
      date_range: string
      stationarity_status: Record<string, boolean>
      concept_drift_events: Record<string, number>
    }
  }
  metadata: {
    generated_at: string
    pcmci_params: {
      max_lag: number
      significance_level: number
    }
  }
}

// Simulated PCMCI Results (Mock - in production would call Python backend)
const generatePCMCIResults = (): PCMCIResponse => {
  const mockNodes = [
    {
      id: 'vapeur_hp_admission',
      label: 'Vapeur HP Admission',
      type: 'exogenous' as const,
      unit: 't/h',
      description: 'Vapeur haute pression admission (490°C, 58bar)',
    },
    {
      id: 'prod_gta1',
      label: 'GTA1 Production',
      type: 'state' as const,
      unit: 'MWh/mois',
      description: 'Production électrique turbine GTA1 (47 MVA)',
    },
    {
      id: 'prod_gta2',
      label: 'GTA2 Production',
      type: 'state' as const,
      unit: 'MWh/mois',
      description: 'Production électrique turbine GTA2 (47 MVA)',
    },
    {
      id: 'prod_gta3',
      label: 'GTA3 Production',
      type: 'state' as const,
      unit: 'MWh/mois',
      description: 'Production électrique turbine GTA3 (47 MVA)',
    },
    {
      id: 'bilan_net',
      label: 'Bilan Net Énergétique',
      type: 'endogenous' as const,
      unit: 'MWh/mois',
      description: 'Bilan net production - consommation (cible: >0)',
    },
    {
      id: 'vapeur_mp',
      label: 'Vapeur MP Distribution',
      type: 'endogenous' as const,
      unit: 't/h',
      description: 'Vapeur moyenne pression (8.5 bar / 225°C)',
    },
    {
      id: 'vapeur_bp',
      label: 'Vapeur BP Distribution',
      type: 'endogenous' as const,
      unit: 't/h',
      description: 'Vapeur basse pression (5.5 bar / 155°C)',
    },
    {
      id: 'efficacite_systeme',
      label: 'Efficacité Système',
      type: 'endogenous' as const,
      unit: '%',
      description: 'Efficacité énergétique globale (cible: 38%)',
    },
    {
      id: 'perte_thermique',
      label: 'Perte Thermique',
      type: 'endogenous' as const,
      unit: 'MWh/mois',
      description: 'Pertes thermiques condensateur & tuyauterie',
    },
    {
      id: 'indicateur_performance',
      label: 'IPE (Indicateur Perf)',
      type: 'endogenous' as const,
      unit: 'ratio',
      description: 'Indicateur Performance Énergétique vs cible',
    },
  ]

  const mockEdges = [
    {
      id: 'edge_1',
      source: 'vapeur_hp_admission',
      target: 'prod_gta1',
      lag: 0,
      strength: 0.87,
      p_value: 0.001,
      granger_pvalue: 0.002,
      e_value: 4.2,
      explanation: 'Vapeur HP drives GTA1 output directly (τ=0, same month)',
    },
    {
      id: 'edge_2',
      source: 'vapeur_hp_admission',
      target: 'prod_gta2',
      lag: 0,
      strength: 0.85,
      p_value: 0.001,
      granger_pvalue: 0.001,
      e_value: 4.8,
      explanation: 'Vapeur HP drives GTA2 output directly (τ=0, same month)',
    },
    {
      id: 'edge_3',
      source: 'vapeur_hp_admission',
      target: 'prod_gta3',
      lag: 0,
      strength: 0.83,
      p_value: 0.002,
      granger_pvalue: 0.003,
      e_value: 3.9,
      explanation: 'Vapeur HP drives GTA3 output directly (τ=0, same month)',
    },
    {
      id: 'edge_4',
      source: 'prod_gta1',
      target: 'bilan_net',
      lag: 0,
      strength: 0.92,
      p_value: 0.0001,
      granger_pvalue: 0.0001,
      e_value: 5.5,
      explanation: 'GTA1 production is major positive driver of energy balance',
    },
    {
      id: 'edge_5',
      source: 'prod_gta2',
      target: 'bilan_net',
      lag: 0,
      strength: 0.91,
      p_value: 0.0001,
      granger_pvalue: 0.0001,
      e_value: 5.3,
      explanation: 'GTA2 production is major positive driver of energy balance',
    },
    {
      id: 'edge_6',
      source: 'prod_gta3',
      target: 'bilan_net',
      lag: 0,
      strength: 0.89,
      p_value: 0.0001,
      granger_pvalue: 0.0001,
      e_value: 5.1,
      explanation: 'GTA3 production is major positive driver of energy balance',
    },
    {
      id: 'edge_7',
      source: 'vapeur_mp',
      target: 'efficacite_systeme',
      lag: 1,
      strength: 0.56,
      p_value: 0.018,
      granger_pvalue: 0.022,
      e_value: 2.8,
      explanation: 'MP vapor distribution affects system efficiency (τ=1 month delay)',
    },
    {
      id: 'edge_8',
      source: 'vapeur_bp',
      target: 'perte_thermique',
      lag: 1,
      strength: -0.62,
      p_value: 0.012,
      granger_pvalue: 0.015,
      e_value: 3.1,
      explanation: 'Higher BP vapor reduces thermal losses downstream (τ=1 month)',
    },
    {
      id: 'edge_9',
      source: 'efficacite_systeme',
      target: 'perte_thermique',
      lag: 0,
      strength: -0.71,
      p_value: 0.003,
      granger_pvalue: 0.005,
      e_value: 3.7,
      explanation: 'Higher efficiency reduces thermal losses (τ=0, immediate)',
    },
    {
      id: 'edge_10',
      source: 'perte_thermique',
      target: 'bilan_net',
      lag: 2,
      strength: -0.48,
      p_value: 0.042,
      granger_pvalue: 0.051,
      e_value: 2.2,
      explanation: 'Thermal losses degrade energy balance (τ=2 months causal lag)',
    },
  ]

  return {
    status: 'success',
    data: {
      dag: {
        nodes: mockNodes,
        edges: mockEdges,
        summary: {
          num_nodes: mockNodes.length,
          num_links: mockEdges.length,
          num_significant_links: mockEdges.filter(e => e.p_value < 0.05).length,
          avg_strength: mockEdges.reduce((sum, e) => sum + Math.abs(e.strength), 0) / mockEdges.length,
          max_lag: Math.max(...mockEdges.map(e => e.lag)),
        },
      },
      anomalies: {
        detected: [
          {
            variable: 'prod_gta1',
            timestamp: '2024-08-15',
            residual_value: -245.6,
            anomaly_score: 0.82,
            severity: 'high',
          },
          {
            variable: 'perte_thermique',
            timestamp: '2024-09-01',
            residual_value: 127.3,
            anomaly_score: 0.68,
            severity: 'medium',
          },
        ],
        summary: {
          total_detected: 2,
          by_variable: {
            prod_gta1: 1,
            perte_thermique: 1,
          },
          critical_scada_alerts: 0,
        },
      },
      data_quality: {
        n_observations: 60,
        date_range: '2021-01-01 to 2025-12-01',
        stationarity_status: {
          vapeur_hp_admission: false,
          prod_gta1: false,
          prod_gta2: false,
          prod_gta3: false,
          bilan_net: false,
          vapeur_mp: false,
          vapeur_bp: false,
          efficacite_systeme: true,
          perte_thermique: false,
          indicateur_performance: true,
        },
        concept_drift_events: {
          vapeur_hp_admission: 2,
          prod_gta1: 1,
          bilan_net: 3,
        },
      },
    },
    metadata: {
      generated_at: new Date().toISOString(),
      pcmci_params: {
        max_lag: 3,
        significance_level: 0.05,
      },
    },
  }
}

export async function GET(request: NextRequest) {
  try {
    const results = generatePCMCIResults()
    return NextResponse.json(results)
  } catch (error) {
    console.error('[v0] PCMCI analysis error:', error)
    return NextResponse.json(
      { status: 'error', message: 'Failed to compute PCMCI analysis' },
      { status: 500 }
    )
  }
}
