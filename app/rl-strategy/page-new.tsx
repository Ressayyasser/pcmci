'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface RLData {
  training_episodes: number
  final_reward: number
  backtest_reward: number
  actions: Array<{
    state: string
    action: string
    reward: number
    count: number
  }>
}

export default function RLStrategyPage() {
  const [rlData, setRlData] = useState<RLData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRLStrategy = async () => {
      try {
        const res = await fetch('/api/rl_strategy')
        if (!res.ok) throw new Error('Failed to fetch RL strategy')
        const data = await res.json()
        setRlData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchRLStrategy()
  }, [])

  return (
    <PageLayout
      title="Q-Learning Strategy"
      description="Reinforcement learning optimization for energy control"
      subtitle="Energy management through learned policies"
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading Q-Learning strategy...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      ) : rlData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-400">Training Episodes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{rlData.training_episodes}</p>
                <p className="text-sm text-slate-400 mt-2">Episodes completed</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-400">Final Reward</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{rlData.final_reward.toFixed(2)}</p>
                <p className="text-sm text-slate-400 mt-2">Training performance</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-purple-400">Backtest Reward</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{rlData.backtest_reward.toFixed(3)}</p>
                <p className="text-sm text-slate-400 mt-2">Out-of-sample validation</p>
              </CardContent>
            </Card>
          </div>

          {/* Learned Policy */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle>Learned Policy</CardTitle>
              <CardDescription>Top actions learned by the Q-Learning agent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {rlData.actions.slice(0, 10).map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="font-semibold text-purple-400">State: {item.state}</p>
                        <p className="text-sm text-slate-400">Action: {item.action}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.reward.toFixed(3)}</p>
                      <p className="text-sm text-slate-400">{item.count} times</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Information */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle>Algorithm Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-blue-400">Method</p>
                <p className="text-slate-300">Q-Learning with tabular representation</p>
              </div>
              <div>
                <p className="font-semibold text-blue-400">State Space</p>
                <p className="text-slate-300">Discretized energy system state variables</p>
              </div>
              <div>
                <p className="font-semibold text-blue-400">Action Space</p>
                <p className="text-slate-300">Control commands for generators, heaters, compressors</p>
              </div>
              <div>
                <p className="font-semibold text-blue-400">Reward Signal</p>
                <p className="text-slate-300">Energy efficiency optimization with cost minimization</p>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/anomalies" className="text-blue-400 hover:text-blue-300">
              ← Back to Anomalies
            </Link>
            <Link href="/insights" className="text-blue-400 hover:text-blue-300">
              Next: Insights →
            </Link>
          </div>
        </div>
      ) : null}
    </PageLayout>
  )
}
