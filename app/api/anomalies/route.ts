import { NextRequest, NextResponse } from 'next/server'

// Mock anomalies data
const mockAnomaliesData = {
  total_anomalies: 31,
  isolation_forest_count: 176,
  cusum_count: 465,
  overlap_count: 31,
  anomaly_rate: 0.354,
  methods: ['Isolation Forest', 'CUSUM'],
  description: 'Ensemble-based anomaly detection using Isolation Forest and CUSUM algorithms',
  recent_anomalies: [
    { timestamp: '2024-01-15 14:32', variable: 'generator_load_1', value: 892.5, zscore: 3.2, method: 'CUSUM', severity: 'high' },
    { timestamp: '2024-01-15 13:45', variable: 'compressor_temp_1', value: 87.3, zscore: 2.8, method: 'Isolation Forest', severity: 'medium' },
    { timestamp: '2024-01-15 12:18', variable: 'system_efficiency', value: 0.38, zscore: -3.1, method: 'CUSUM', severity: 'high' },
    { timestamp: '2024-01-15 11:22', variable: 'grid_voltage', value: 242.5, zscore: 2.5, method: 'Isolation Forest', severity: 'medium' },
    { timestamp: '2024-01-15 10:15', variable: 'heater_temp_1', value: 125.8, zscore: 3.5, method: 'CUSUM', severity: 'critical' },
  ],
  anomaly_distribution: {
    'generator_load_1': 5,
    'compressor_power_1': 4,
    'system_efficiency': 3,
    'heater_temp_1': 2,
    'grid_frequency': 2,
    'thermal_loss': 2,
    'ambient_temp': 2,
    'generator_speed': 1,
    'grid_voltage': 1,
    'cost_per_kwh': 2,
  },
  top_anomalies: [
    { timestamp: '2024-01-15 14:32', variable: 'generator_load_1', zscore: 3.2, confidence: 0.95 },
    { timestamp: '2024-01-15 12:18', variable: 'system_efficiency', zscore: 3.1, confidence: 0.92 },
    { timestamp: '2024-01-15 10:15', variable: 'heater_temp_1', zscore: 3.5, confidence: 0.97 },
    { timestamp: '2024-01-14 09:42', variable: 'compressor_temp_1', zscore: 3.0, confidence: 0.90 },
    { timestamp: '2024-01-14 08:30', variable: 'compressor_power_1', zscore: 2.9, confidence: 0.88 },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/anomalies`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }
    } catch (e) {
      console.log('[v0] Backend unavailable, using mock anomalies data')
    }

    // Return mock data as fallback
    return NextResponse.json(mockAnomaliesData)
  } catch (error) {
    console.error('[v0] Anomalies API error:', error)
    return NextResponse.json(mockAnomaliesData)
  }
}
