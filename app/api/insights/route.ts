import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock insights data - matches Insight interface from insights/page.tsx
  const mockInsightsData = {
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
      'Deploy Q-Learning strategy for cost-efficiency optimization during peak hours',
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
  }

  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/insights`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Backend insights data used')
        return NextResponse.json(data)
      }
    } catch (e) {
      console.log('[v0] Backend unavailable, using mock insights data')
    }

    // Return mock data as fallback
    return NextResponse.json(mockInsightsData)
  } catch (error) {
    console.error('[v0] Insights API error:', error)
    return NextResponse.json(mockInsightsData)
  }
}
