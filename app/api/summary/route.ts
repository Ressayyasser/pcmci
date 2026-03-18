import { NextRequest, NextResponse } from 'next/server'

// Mock summary data
const mockSummaryData = {
  system_status: 'healthy',
  last_update: new Date().toISOString(),
  data_statistics: {
    total_records: 8760,
    time_period: '2024-01-01 to 2024-12-31',
    variables_monitored: 14,
    anomalies_detected: 31,
    anomaly_rate: 0.354,
  },
  analysis_summary: {
    causal_relationships: 55,
    significant_links: 12,
    anomaly_methods: ['Isolation Forest', 'CUSUM'],
    optimization_algorithm: 'Q-Learning',
  },
  key_metrics: {
    system_efficiency: 0.762,
    cost_per_kwh: 0.145,
    grid_stability: 0.891,
    thermal_efficiency: 0.834,
    anomaly_detection_rate: 0.945,
  },
  health_indicators: [
    { name: 'Generator Load Stability', value: 0.88, status: 'good' },
    { name: 'Compressor Performance', value: 0.82, status: 'good' },
    { name: 'Thermal System', value: 0.91, status: 'excellent' },
    { name: 'Grid Connection', value: 0.95, status: 'excellent' },
    { name: 'Cost Efficiency', value: 0.76, status: 'good' },
  ],
  alerts: [
    { severity: 'medium', message: 'Compressor power spike detected on 2024-01-15' },
    { severity: 'low', message: 'Scheduled maintenance due for heater_1 in 30 days' },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/summary`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (e) {
      console.log('[v0] Backend unavailable, using mock summary data')
    }

    // Return mock data as fallback
    return NextResponse.json(mockSummaryData)
  } catch (error) {
    console.error('[v0] Summary API error:', error)
    return NextResponse.json(mockSummaryData)
  }
}
