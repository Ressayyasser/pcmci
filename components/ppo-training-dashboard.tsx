'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { AlertCircle, TrendingUp, Play, Square, RotateCcw, Zap } from 'lucide-react'

export function PPOTrainingDashboard() {
  const [isTraining, setIsTraining] = useState(false)
  const [metrics, setMetrics] = useState({
    totalEpisodes: 0,
    trainingSteps: 0,
    recentMeanReward: 0,
    improvementTrend: 0,
    policyAccuracy: 0,
    convergenceStatus: 'initializing',
  })
  const [actionHistory, setActionHistory] = useState<string[]>([])

  // Fetch metrics periodically
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/ppo-training?action=metrics')
      const data = await res.json()
      if (data.status === 'success') {
        setMetrics(data.metrics)
        setIsTraining(data.metrics.isTraining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleStartTraining = async () => {
    const res = await fetch('/api/ppo-training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start-training' }),
    })
    const data = await res.json()
    if (data.status === 'success') {
      setIsTraining(true)
    }
  }

  const handleStopTraining = async () => {
    const res = await fetch('/api/ppo-training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop-training' }),
    })
    const data = await res.json()
    if (data.status === 'success') {
      setIsTraining(false)
    }
  }

  const handleResetTraining = async () => {
    const res = await fetch('/api/ppo-training', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reset-training' }),
    })
    const data = await res.json()
    if (data.status === 'success') {
      setMetrics({
        totalEpisodes: 0,
        trainingSteps: 0,
        recentMeanReward: 0,
        improvementTrend: 0,
        policyAccuracy: 0,
        convergenceStatus: 'initializing',
      })
    }
  }

  const handleSelectAction = async () => {
    const res = await fetch('/api/ppo-training?action=select-action')
    const data = await res.json()
    if (data.status === 'success') {
      const action = data.action
      setActionHistory(prev => [
        `${action.name} (${(action.confidence * 100).toFixed(1)}% confidence)`,
        ...prev.slice(0, 9)
      ])
    }
  }

  const convergencePercentage = Math.min(metrics.totalEpisodes / 1000, 1) * 100

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-foreground">PPO Agent Training Dashboard</h2>
        <p className="text-muted-foreground">
          Proximal Policy Optimization - Learning to optimize GTA control in real-time
        </p>
      </div>

      {/* Training Controls */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Training Controls
          </CardTitle>
          <CardDescription>Start, stop, or reset the PPO training process</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Button
            onClick={handleStartTraining}
            disabled={isTraining}
            className="gap-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4" />
            Start Training
          </Button>
          <Button
            onClick={handleStopTraining}
            disabled={!isTraining}
            className="gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            <Square className="w-4 h-4" />
            Stop Training
          </Button>
          <Button
            onClick={handleResetTraining}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Training
          </Button>
          <Button
            onClick={handleSelectAction}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white ml-auto"
          >
            <Zap className="w-4 h-4" />
            Test Action Selection
          </Button>
        </CardContent>
      </Card>

      {/* Live Training Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`border-2 ${isTraining ? 'border-green-500 bg-green-500/5' : 'border-border'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Training Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isTraining ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <p className="text-2xl font-bold">{isTraining ? 'ACTIVE' : 'IDLE'}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Episodes Trained
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{metrics.totalEpisodes}</p>
            <p className="text-xs text-muted-foreground mt-1">+{Math.floor(metrics.totalEpisodes / 100)} batches</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gradient Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-accent">{metrics.trainingSteps}</p>
            <p className="text-xs text-muted-foreground mt-1">Policy updates</p>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Convergence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-cyan-400">{convergencePercentage.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1 capitalize">
              {metrics.convergenceStatus}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Mean Episode Reward</CardTitle>
            <CardDescription>Average reward per training episode</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-primary">{metrics.recentMeanReward.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground mt-1">Current average reward</p>
            </div>
            <Progress 
              value={Math.min(metrics.recentMeanReward / 9 * 100, 100)} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              Target: 8.5 | Current: {metrics.recentMeanReward.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Policy Accuracy</CardTitle>
            <CardDescription>Confidence in policy decisions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-3xl font-bold text-green-400">{(metrics.policyAccuracy * 100).toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Action selection confidence</p>
            </div>
            <Progress 
              value={metrics.policyAccuracy * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              Target: 95% | Current: {(metrics.policyAccuracy * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Trend */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-accent" />
            Learning Progress
          </CardTitle>
          <CardDescription>
            PPO improvement trend over training episodes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary border border-border">
              <p className="text-sm text-muted-foreground mb-2">Improvement This Epoch</p>
              <p className="text-2xl font-bold text-accent">
                {metrics.improvementTrend > 0 ? '+' : ''}{metrics.improvementTrend.toFixed(2)}%
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {metrics.improvementTrend > 0 ? '📈 Policy improving' : '➡️ Stable'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary border border-border">
              <p className="text-sm text-muted-foreground mb-2">Episodes Until Convergence</p>
              <p className="text-2xl font-bold text-primary">
                {Math.max(0, 1000 - metrics.totalEpisodes)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {((metrics.totalEpisodes / 1000) * 100).toFixed(1)}% complete
              </p>
            </div>

            <div className="p-4 rounded-lg bg-secondary border border-border">
              <p className="text-sm text-muted-foreground mb-2">Learning Rate</p>
              <p className="text-2xl font-bold text-cyan-400">0.001</p>
              <p className="text-xs text-muted-foreground mt-2">Adaptive optimization</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Actions */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle>Recent Policy Actions</CardTitle>
          <CardDescription>Last 10 actions selected by the trained policy</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            {actionHistory.length === 0 ? (
              <p className="text-muted-foreground">No actions yet. Click "Test Action Selection" to generate actions.</p>
            ) : (
              actionHistory.map((action, idx) => (
                <div key={idx} className="flex items-center gap-2 text-foreground">
                  <span className="text-muted-foreground">{idx + 1}.</span>
                  <span className="text-cyan-400">{action}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Info Box */}
      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-400">
            <AlertCircle className="w-5 h-5" />
            How PPO Training Works
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Proximal Policy Optimization (PPO)</strong> is a state-of-the-art reinforcement learning algorithm that:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Learns a policy (decision-making function) that maps states → actions</li>
            <li>Maximizes reward signal: efficiency, power balance, anomaly reduction</li>
            <li>Uses PPO clipping to ensure stable, reliable training</li>
            <li>Converges around episode 1000 with 95%+ action confidence</li>
            <li>Continues improving even after convergence through fine-tuning</li>
          </ul>
          <p className="pt-2">
            The agent learns to select actions (INCREASE_GTAx, OPTIMIZE_ROUTING, MAINTENANCE) that maximize system efficiency 
            while maintaining stability and reliability. Training typically takes 500-1000 episodes.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
