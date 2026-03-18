import { NextRequest, NextResponse } from 'next/server'

// Mock insights data
const mockInsightsData = {
  key_findings: [
    {
      title: 'Strong Causal Relationship: Ambient Temperature → Heater Temperature',
      description: 'Analysis reveals a 0.92 strength correlation with zero lag, indicating immediate thermal response to environment.',
      impact: 'High',
      actionable: true,
    },
    {
      title: 'Generator Speed Dominates Grid Voltage Stability',
      description: 'Grid voltage is highly responsive to generator speed (0.91 strength), suggesting tight mechanical control.',
      impact: 'High',
      actionable: true,
    },
    {
      title: 'Efficiency-Cost Trade-off Identified',
      description: 'System efficiency inversely correlates with cost per kWh (-0.79), indicating potential optimization opportunities.',
      impact: 'Medium',
      actionable: true,
    },
  ],
  recommendations: [
    {
      category: 'Control Optimization',
      items: [
        'Implement adaptive heater control based on ambient temperature predictions (lead time: 1-2 hours)',
        'Use generator speed feedback for pre-emptive grid voltage stabilization',
        'Deploy Q-Learning strategy for cost-efficiency optimization during peak hours',
      ],
    },
    {
      category: 'Anomaly Response',
      items: [
        'Generator load anomalies (5 instances) warrant investigation of load-shedding mechanisms',
        'Establish alert thresholds at ±3 standard deviations for real-time monitoring',
        'Implement predictive maintenance schedule based on compressor temperature trends',
      ],
    },
    {
      category: 'System Improvements',
      items: [
        'Install thermal insulation to reduce ambient temperature coupling with internal systems',
        'Consider upgrading compressor to achieve efficiency targets above 0.8',
        'Implement demand-side management to reduce cost per kWh during off-peak hours',
      ],
    },
  ],
  predictive_insights: [
    {
      metric: 'Expected Anomalies (Next 7 days)',
      value: '2-4',
      confidence: 0.87,
      reasoning: 'Based on historical frequency and seasonal patterns',
    },
    {
      metric: 'Optimal Cost Reduction Target',
      value: '12-15%',
      confidence: 0.79,
      reasoning: 'Using Q-Learning policy during peak hours',
    },
    {
      metric: 'System Efficiency Potential',
      value: '78-82%',
      confidence: 0.82,
      reasoning: 'With recommended control optimizations',
    },
  ],
  system_health_forecast: {
    next_30_days: 'Good - No critical risks identified',
    next_90_days: 'Excellent - All metrics trending positively',
    maintenance_alert: 'Scheduled compressor maintenance due in 35 days',
  },
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/insights`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
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
