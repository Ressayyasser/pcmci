import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock anomalies data - matches AnomalyData interface
  const mockAnomaliesData = {
    total_anomalies: 31,
    anomaly_rate: 0.354,
    anomaly_indices: [142, 287, 401, 556, 687, 812, 945, 1023, 1156, 1289, 1412, 1534, 1687, 1823, 1945, 2087, 2201, 2356, 2478, 2634, 2756, 2891, 3012, 3145, 3267, 3401, 3523, 3687, 3801, 3934, 4056],
    isolation_forest_count: 176,
    cusum_count: 465,
    detection_methods: ['Isolation Forest', 'CUSUM'],
    description: 'Ensemble-based anomaly detection using Isolation Forest and CUSUM algorithms',
  }

  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/anomalies`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Backend anomalies data used')
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
