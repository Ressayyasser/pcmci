import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Mock Q-Learning strategy data - matches RLData interface
  const mockRLStrategyData = {
    strategy_name: 'Q-Learning Control Strategy',
    training_episodes: 50,
    final_reward: -1.34,
    backtest_reward: -58.9,
    backtest_samples: 1000,
    state_space_size: 5,
    action_space_size: 27,
    learning_rate: 0.1,
    discount_factor: 0.95,
    description: 'Q-Learning agent trained for energy system control optimization',
    convergence: 'Converged at episode 38 with stable reward trajectory',
  }

  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/rl_strategy`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000),
      })
      if (response.ok) {
        const data = await response.json()
        console.log('[v0] Backend RL data used')
        return NextResponse.json(data)
      }
    } catch (e) {
      console.log('[v0] Backend unavailable, using mock RL data')
    }

    // Return mock data as fallback
    return NextResponse.json(mockRLStrategyData)
  } catch (error) {
    console.error('[v0] RL Strategy API error:', error)
    return NextResponse.json(mockRLStrategyData)
  }
}
