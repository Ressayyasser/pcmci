import { NextRequest, NextResponse } from 'next/server'

/**
 * Consolidated Analytics Endpoint
 * Combines insights and summary data to eliminate redundancy
 */

export async function GET(request: NextRequest) {
  const mockAnalyticsData = {
    summary: {
      data: {
        total_records: 8760,
        num_variables: 14,
        time_range: '2024-01-01 to 2024-12-31',
        date_range: { start: '2024-01-01', end: '2024-12-31' },
      },
      pcmci: {
        num_links: 55,
        significant_links: 12,
      },
      anomalies: {
        total_detected: 31,
        detection_rate: 0.945,
      },
      rl_agent: {
        final_reward: -1.34,
        backtest_reward: -58.9,
        training_episodes: 50,
      },
    },
    insights: {
      key_findings: [
        'Strong Causal Relationship: Ambient Temperature → Heater Temperature (0.92 strength, zero lag)',
        'Generator Speed Dominates Grid Voltage Stability (0.91 strength correlation)',
        'Efficiency-Cost Trade-off Identified: System efficiency inversely correlates with cost per kWh (-0.79)',
        'Compressor Performance Shows 82% efficiency with stable operational patterns',
        'Grid Frequency Strongly Influences Generator Speed (0.88 strength)',
      ],
      recommendations: [
        'Implement adaptive heater control based on ambient temperature predictions (lead time: 1-2 hours)',
        'Use generator speed feedback for pre-emptive grid voltage stabilization',
        'Deploy PPO strategy for cost-efficiency optimization during peak hours',
        'Generator load anomalies (5 instances) warrant investigation of load-shedding mechanisms',
        'Establish alert thresholds at ±3 standard deviations for real-time monitoring',
        'Implement predictive maintenance schedule based on compressor temperature trends',
      ],
      next_steps: [
        'Install thermal insulation to reduce ambient temperature coupling',
        'Consider upgrading compressor to achieve efficiency targets above 0.8',
        'Implement demand-side management for cost optimization',
        'Schedule maintenance for generator bearings within 30 days',
        'Deploy real-time monitoring dashboard for grid stability metrics',
      ],
    },
  }

  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/analytics`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (e) {
      console.log('[v0] Backend unavailable, using mock analytics data')
    }

    return NextResponse.json(mockAnalyticsData)
  } catch (error) {
    console.error('[v0] Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}
