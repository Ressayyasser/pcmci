'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

interface RLData {
  strategy_name: string
  training_episodes: number
  final_reward: number
  backtest_reward: number
  backtest_samples: number
  state_space_size: number
  action_space_size: number
  learning_rate: number
  discount_factor: number
  description: string
  convergence: string
}

export default function RLStrategyPage() {
  const [data, setData] = useState<RLData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/rl_strategy')
        if (!res.ok) throw new Error('Failed to fetch RL data')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="text-white">
      <PageHeader 
        title="Q-Learning Optimization Strategy"
        description="Reinforcement learning for energy system control"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading Q-Learning analysis...</p>
          </div>
        ) : error ? (
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Error: {error}</p>
            </CardContent>
          </Card>
        ) : data ? (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-400">Training Episodes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.training_episodes}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-400">Final Reward</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.final_reward.toFixed(2)}</p>
                  <p className="text-sm text-slate-400 mt-2">Training convergence</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-purple-400">Backtest Reward</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.backtest_reward.toFixed(3)}</p>
                  <p className="text-sm text-slate-400 mt-2">Out-of-sample validation</p>
                </CardContent>
              </Card>
            </div>

            {/* Strategy Overview */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Strategy Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300">{data.description}</p>
                <div className="bg-slate-600 p-4 rounded space-y-2 text-sm">
                  <p><strong>Convergence Status:</strong> {data.convergence}</p>
                  <p><strong>Method:</strong> Q-Learning (Tabular Temporal Difference)</p>
                  <p><strong>Application:</strong> Energy generation scheduling and load balancing</p>
                </div>
              </CardContent>
            </Card>

            {/* Hyperparameters */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Hyperparameters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-600 p-4 rounded">
                    <p className="text-sm text-slate-400">Learning Rate (α)</p>
                    <p className="text-xl font-semibold">{data.learning_rate}</p>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <p className="text-sm text-slate-400">Discount Factor (γ)</p>
                    <p className="text-xl font-semibold">{data.discount_factor}</p>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <p className="text-sm text-slate-400">State Space Size</p>
                    <p className="text-xl font-semibold">{data.state_space_size}</p>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <p className="text-sm text-slate-400">Action Space Size</p>
                    <p className="text-xl font-semibold">{data.action_space_size}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Q-Learning Details */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Training Results</CardTitle>
                <CardDescription>Performance metrics from training and validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                    <span className="text-slate-300">Training Episodes</span>
                    <span className="font-semibold">{data.training_episodes}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                    <span className="text-slate-300">Final Reward</span>
                    <span className="font-semibold text-purple-400">{data.final_reward.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                    <span className="text-slate-300">Backtest Samples</span>
                    <span className="font-semibold">{data.backtest_samples}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                    <span className="text-slate-300">Backtest Reward (Mean)</span>
                    <span className="font-semibold text-green-400">{data.backtest_reward.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-600 rounded">
                    <span className="text-slate-300">Convergence</span>
                    <span className="font-semibold text-green-400">{data.convergence}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Algorithm Details */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Q-Learning Algorithm</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-600 p-4 rounded space-y-3">
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Update Rule</h4>
                    <code className="text-xs font-mono bg-slate-700 p-2 rounded block overflow-x-auto">
                      Q(s,a) ← Q(s,a) + α[r + γ·max(Q(s',a')) - Q(s,a)]
                    </code>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-400 mb-2">Where:</h4>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>s = current state</li>
                      <li>a = action taken</li>
                      <li>r = reward received</li>
                      <li>s' = next state</li>
                      <li>α = learning rate</li>
                      <li>γ = discount factor</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Space */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Action Space</CardTitle>
                <CardDescription>Control actions available to the agent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { action: 'Increase Generation', desc: 'Boost turbine/generator output' },
                    { action: 'Maintain Current', desc: 'Keep existing output level' },
                    { action: 'Decrease Generation', desc: 'Reduce turbine/generator output' },
                    { action: 'Load Shift', desc: 'Move load to different time period' },
                    { action: 'Emergency Stop', desc: 'Emergency shutdown procedure' },
                  ].map((item, idx) => (
                    <div key={idx} className="bg-slate-600 p-3 rounded">
                      <p className="font-semibold text-blue-400">{item.action}</p>
                      <p className="text-sm text-slate-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Expected Impact */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Expected Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>20-30% improvement in energy efficiency</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Reduced operational costs through optimal scheduling</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Better load balancing and grid stability</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">✓</span>
                    <span>Early anomaly detection through learned patterns</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  )
}
