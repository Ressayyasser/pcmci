import { NextRequest, NextResponse } from 'next/server'

// Mock PPO Agent state (in production, this would use a persistent backend with Python)
let ppoAgentState = {
  isTraining: false,
  episodeCount: 0,
  trainingSteps: 0,
  recentReward: 0,
  improvementTrend: 0,
  accuracy: 0,
  convergenceStatus: 'initializing',
  lastUpdate: new Date().toISOString(),
}

export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get('action')

  if (action === 'metrics') {
    // Return current training metrics
    return NextResponse.json({
      status: 'success',
      metrics: {
        totalEpisodes: ppoAgentState.episodeCount,
        trainingSteps: ppoAgentState.trainingSteps,
        recentMeanReward: ppoAgentState.recentReward,
        improvementTrend: ppoAgentState.improvementTrend,
        policyAccuracy: ppoAgentState.accuracy,
        convergenceStatus: ppoAgentState.convergenceStatus,
        isTraining: ppoAgentState.isTraining,
        lastUpdate: ppoAgentState.lastUpdate,
      },
    })
  }

  if (action === 'select-action') {
    // PPO agent selects best action based on current state
    const currentState = {
      vapor_hp: 59.3,
      gta1_power: 145.6,
      gta2_power: 144.8,
      gta3_power: 145.2,
      bilan_net: 435.6,
      system_efficiency: 87.2,
      anomaly_score: 0.12,
      condenser_temp: 42.5,
      vibration: 2.3,
    }

    const actions = [
      'INCREASE_GTA1',
      'INCREASE_GTA2',
      'INCREASE_GTA3',
      'OPTIMIZE_STEAM_ROUTING',
      'ACTIVATE_AUXILIARY_BOILER',
      'MAINTENANCE_CONDENSER',
      'DO_NOTHING',
    ]

    // Simulate PPO action selection with confidence based on training
    const baseConfidence = Math.min(0.95, 0.65 + ppoAgentState.accuracy * 0.3)
    const selectedActionIdx = Math.floor(Math.random() * actions.length)
    const selectedAction = actions[selectedActionIdx]

    // Confidence increases as agent trains
    const confidence = baseConfidence + Math.random() * 0.05

    return NextResponse.json({
      status: 'success',
      action: {
        name: selectedAction,
        confidence: confidence,
        reasoning: `PPO policy selected ${selectedAction} with ${(confidence * 100).toFixed(1)}% confidence after ${ppoAgentState.trainingSteps} training steps`,
        expectedReward: (5.2 + Math.random() * 2).toFixed(2),
      },
    })
  }

  return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const action = body.action

  if (action === 'start-training') {
    // Simulate PPO training loop
    ppoAgentState.isTraining = true

    // Simulate training progress
    const trainingInterval = setInterval(() => {
      ppoAgentState.episodeCount += 1
      ppoAgentState.trainingSteps += 4 // 4 gradient steps per episode

      // Simulated reward improvement over time (convergence curve)
      const convergenceProgress = Math.min(ppoAgentState.episodeCount / 1000, 1.0)
      ppoAgentState.recentReward = 5.0 + convergenceProgress * 3.5 + Math.random() * 0.5
      ppoAgentState.accuracy = Math.min(0.95, 0.65 + convergenceProgress * 0.3)

      // Improvement trend (percentage improvement over last 100 episodes)
      if (ppoAgentState.episodeCount % 100 === 0) {
        ppoAgentState.improvementTrend = (Math.random() * 15 - 5 + convergenceProgress * 10).toFixed(2)
      }

      // Convergence status
      if (convergenceProgress > 0.8) {
        ppoAgentState.convergenceStatus = 'converged'
      } else if (convergenceProgress > 0.5) {
        ppoAgentState.convergenceStatus = 'improving'
      } else {
        ppoAgentState.convergenceStatus = 'training'
      }

      ppoAgentState.lastUpdate = new Date().toISOString()
    }, 500)

    // Stop training after 30 seconds for demo
    setTimeout(() => {
      clearInterval(trainingInterval)
      ppoAgentState.isTraining = false
    }, 30000)

    return NextResponse.json({
      status: 'success',
      message: 'PPO training started',
      trainingDuration: '30 seconds',
    })
  }

  if (action === 'stop-training') {
    ppoAgentState.isTraining = false
    return NextResponse.json({
      status: 'success',
      message: 'PPO training stopped',
      finalMetrics: {
        episodes: ppoAgentState.episodeCount,
        accuracy: ppoAgentState.accuracy,
      },
    })
  }

  if (action === 'reset-training') {
    ppoAgentState = {
      isTraining: false,
      episodeCount: 0,
      trainingSteps: 0,
      recentReward: 0,
      improvementTrend: 0,
      accuracy: 0,
      convergenceStatus: 'initializing',
      lastUpdate: new Date().toISOString(),
    }

    return NextResponse.json({
      status: 'success',
      message: 'Training state reset',
    })
  }

  return NextResponse.json({ status: 'error', message: 'Unknown action' }, { status: 400 })
}
