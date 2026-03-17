'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Summary {
  data: {
    total_records: number
    num_variables: number
    time_range: string
    date_range: { start: string; end: string }
  }
  pcmci: {
    num_links: number
    significant_links: number
  }
  anomalies: {
    total_detected: number
    detection_rate: number
  }
  rl_agent: {
    final_reward: number
    backtest_reward: number
    training_episodes: number
  }
}

export default function Home() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/summary')
        if (!res.ok) throw new Error('Failed to fetch summary')
        const data = await res.json()
        setSummary(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">OCP Energy Dashboard</h1>
              <p className="text-slate-400 mt-2">Advanced anomaly detection with causal analysis</p>
            </div>
            <div className="text-right text-sm text-slate-400">
              <p>PCMCI | Anomaly Detection | Q-Learning</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading dashboard data...</p>
            </div>
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-400">Error: {error}</p>
            </CardContent>
          </Card>
        ) : summary ? (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-slate-700 border border-slate-600">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="pcmci">PCMCI Analysis</TabsTrigger>
              <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
              <TabsTrigger value="rl">Q-Learning</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Data Card */}
                <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-400">Dataset</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-400">Total Records</p>
                      <p className="text-2xl font-bold">{summary.data.total_records.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Variables</p>
                      <p className="text-2xl font-bold">{summary.data.num_variables}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* PCMCI Card */}
                <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-400">Causal Links</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-400">Total Links</p>
                      <p className="text-2xl font-bold">{summary.pcmci.num_links}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Significant (p&lt;0.05)</p>
                      <p className="text-2xl font-bold">{summary.pcmci.significant_links}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Anomalies Card */}
                <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-orange-400">Anomalies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-400">Detected</p>
                      <p className="text-2xl font-bold">{summary.anomalies.total_detected}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Detection Rate</p>
                      <p className="text-2xl font-bold">{(summary.anomalies.detection_rate * 100).toFixed(2)}%</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Q-Learning Card */}
                <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-400">Q-Learning</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-400">Backtest Reward</p>
                      <p className="text-2xl font-bold">{summary.rl_agent.backtest_reward.toFixed(3)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Episodes</p>
                      <p className="text-2xl font-bold">{summary.rl_agent.training_episodes}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Summary */}
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle>Data Summary</CardTitle>
                  <CardDescription>Overview of the dataset used for analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Time Range</p>
                      <p className="font-semibold">{summary.data.time_range}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Date Range</p>
                      <p className="font-semibold">{summary.data.date_range.start} to {summary.data.date_range.end}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* PCMCI Tab */}
            <TabsContent value="pcmci" className="space-y-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle>PCMCI Causal Analysis</CardTitle>
                  <CardDescription>Momentary Conditional Independence test results</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Total Links</p>
                      <p className="text-3xl font-bold text-green-400">{summary.pcmci.num_links}</p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Significant Links</p>
                      <p className="text-3xl font-bold text-green-400">{summary.pcmci.significant_links}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    PCMCI (Momentary Conditional Independence) test identifies causal relationships in multivariate time series by testing conditional independence between variables.
                  </p>
                  <Link href="/pcmci" className="inline-block text-blue-400 hover:text-blue-300 mt-4">
                    View detailed PCMCI analysis →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Anomalies Tab */}
            <TabsContent value="anomalies" className="space-y-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle>Anomaly Detection Results</CardTitle>
                  <CardDescription>Ensemble-based anomaly detection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Anomalies Detected</p>
                      <p className="text-3xl font-bold text-orange-400">{summary.anomalies.total_detected}</p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Detection Rate</p>
                      <p className="text-3xl font-bold text-orange-400">{(summary.anomalies.detection_rate * 100).toFixed(2)}%</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    Detection methods: Isolation Forest + CUSUM-like algorithm for robust anomaly identification.
                  </p>
                  <Link href="/anomalies" className="inline-block text-blue-400 hover:text-blue-300 mt-4">
                    View detailed anomaly analysis →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Q-Learning Tab */}
            <TabsContent value="rl" className="space-y-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle>Q-Learning Optimization Strategy</CardTitle>
                  <CardDescription>Reinforcement learning for energy control</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Training Episodes</p>
                      <p className="text-3xl font-bold text-purple-400">{summary.rl_agent.training_episodes}</p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Final Reward</p>
                      <p className="text-2xl font-bold text-purple-400">{summary.rl_agent.final_reward.toFixed(2)}</p>
                    </div>
                    <div className="bg-slate-600 p-4 rounded">
                      <p className="text-sm text-slate-400">Backtest Reward</p>
                      <p className="text-2xl font-bold text-purple-400">{summary.rl_agent.backtest_reward.toFixed(3)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-4">
                    Q-Learning agent trained on synthetic OCP data to optimize energy control actions.
                  </p>
                  <Link href="/rl-strategy" className="inline-block text-blue-400 hover:text-blue-300 mt-4">
                    View Q-Learning strategy details →
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documentation Tab */}
            <TabsContent value="documentation" className="space-y-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle>System Documentation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-blue-400 mb-2">Architecture</h3>
                      <p className="text-sm text-slate-300">Next.js 16 frontend + FastAPI backend + Dash visualization + Python ML pipeline</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-400 mb-2">Technologies</h3>
                      <p className="text-sm text-slate-300">PCMCI (tigramite) | Isolation Forest | CUSUM | Q-Learning | Plotly | Dash | FastAPI</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-purple-400 mb-2">API Endpoints</h3>
                      <ul className="text-sm text-slate-300 space-y-1 ml-4">
                        <li>GET /api/summary - System overview</li>
                        <li>GET /api/pcmci - Causal links</li>
                        <li>GET /api/anomalies - Anomaly results</li>
                        <li>GET /api/rl_strategy - Q-Learning metrics</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-800/50 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 text-sm">
          <p>OCP Energy Anomaly Detection System | Powered by PCMCI, Anomaly Detection & Q-Learning</p>
        </div>
      </footer>
    </div>
  )
}
