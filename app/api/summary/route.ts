import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock summary data - matches Summary interface from page.tsx
  const mockSummaryData = {
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
  }

  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/summary`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Backend summary data used')
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
