import { NextRequest, NextResponse } from 'next/server'

// Mock Q-Learning strategy data
const mockRLStrategyData = {
  algorithm: 'Q-Learning (Reinforcement Learning)',
  episodes_trained: 50,
  learning_rate: 0.1,
  discount_factor: 0.95,
  epsilon: 0.1,
  description: 'Q-Learning agent trained for energy system control optimization',
  performance_metrics: {
    mean_reward: -1.34,
    cumulative_reward_training: -67.2,
    cumulative_reward_backtest: -58.9,
    convergence_episodes: 38,
    success_rate: 0.76,
  },
  state_space: {
    generator_load: 'Continuous [0-1000 kW]',
    compressor_power: 'Continuous [0-500 kW]',
    heater_temp: 'Continuous [20-150°C]',
    system_efficiency: 'Continuous [0-1]',
    grid_frequency: 'Continuous [49-51 Hz]',
  },
  action_space: {
    generator_action: 'Increase/Decrease/Maintain load',
    compressor_action: 'Increase/Decrease/Maintain power',
    heater_action: 'Increase/Decrease/Maintain temperature',
  },
  rewards: {
    efficiency_bonus: 0.5,
    cost_reduction: -0.3,
    stability_bonus: 0.2,
    anomaly_penalty: -1.0,
  },
  training_history: [
    { episode: 1, reward: -3.2, avg_reward: -3.2 },
    { episode: 5, reward: -2.1, avg_reward: -2.7 },
    { episode: 10, reward: -1.8, avg_reward: -2.4 },
    { episode: 20, reward: -1.5, avg_reward: -1.9 },
    { episode: 30, reward: -1.2, avg_reward: -1.6 },
    { episode: 40, reward: -1.1, avg_reward: -1.4 },
    { episode: 50, reward: -1.0, avg_reward: -1.34 },
  ],
  backtest_results: {
    total_timesteps: 1000,
    control_actions: 345,
    anomalies_detected_and_handled: 12,
    cost_savings: 0.18,
    efficiency_gain: 0.12,
  },
  learned_policy_sample: [
    { state: 'High load, Low efficiency', action: 'Reduce generator, Increase compressor' },
    { state: 'Low load, High efficiency', action: 'Maintain all' },
    { state: 'Anomaly detected', action: 'Reduce load, Alert monitoring' },
  ],
}

export async function GET(request: NextRequest) {
  try {
    // Try to fetch from backend if available
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    try {
      const response = await fetch(`${backendUrl}/api/rl_strategy`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const data = await response.json()
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
