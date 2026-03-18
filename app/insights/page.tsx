'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

interface Insight {
  key_findings: string[]
  recommendations: string[]
  next_steps: string[]
}

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('/api/insights')
        if (!res.ok) throw new Error('Failed to fetch insights')
        const json = await res.json()
        setInsights(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [])

  return (
    <div className="text-white">
      <PageHeader 
        title="System Insights & Recommendations"
        description="Key findings and actionable recommendations from analysis"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-slate-400">Loading insights...</p>
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-500">
            <CardContent className="pt-6">
              <p className="text-red-400">Error: {error}</p>
            </CardContent>
          </Card>
        ) : insights ? (
          <div className="space-y-6">
            {/* Key Findings */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-blue-400">Key Findings</CardTitle>
                <CardDescription>Important discoveries from the analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.key_findings.map((finding, idx) => (
                    <li key={idx} className="flex gap-3 p-3 bg-slate-600 rounded">
                      <span className="text-blue-400 font-bold flex-shrink-0">•</span>
                      <span className="text-slate-200">{finding}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-green-400">Recommendations</CardTitle>
                <CardDescription>Action items for operational improvement</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex gap-3 p-3 bg-slate-600 rounded">
                      <span className="text-green-400 font-bold text-lg flex-shrink-0">{idx + 1}</span>
                      <span className="text-slate-200">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle className="text-purple-400">Next Steps</CardTitle>
                <CardDescription>Path forward for system evolution</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {insights.next_steps.map((step, idx) => (
                    <li key={idx} className="flex gap-3 p-3 bg-slate-600 rounded">
                      <span className="text-purple-400 font-bold flex-shrink-0">→</span>
                      <span className="text-slate-200">{step}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30">
              <CardHeader>
                <CardTitle>Implementation Roadmap</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-slate-600/50 rounded">
                    <p className="text-2xl font-bold text-blue-400">Phase 1</p>
                    <p className="text-sm text-slate-400 mt-2">Immediate Actions (1-2 weeks)</p>
                    <p className="text-xs text-slate-500 mt-3">Deploy real-time monitoring</p>
                  </div>
                  <div className="text-center p-4 bg-slate-600/50 rounded">
                    <p className="text-2xl font-bold text-green-400">Phase 2</p>
                    <p className="text-sm text-slate-400 mt-2">Short-term (1-3 months)</p>
                    <p className="text-xs text-slate-500 mt-3">Implement Q-Learning optimization</p>
                  </div>
                  <div className="text-center p-4 bg-slate-600/50 rounded">
                    <p className="text-2xl font-bold text-purple-400">Phase 3</p>
                    <p className="text-sm text-slate-400 mt-2">Long-term (3-6 months)</p>
                    <p className="text-xs text-slate-500 mt-3">Full system integration & scaling</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Resources */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Related Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link href="/pcmci" className="p-4 bg-slate-600 hover:bg-slate-500 rounded transition">
                    <h4 className="font-semibold text-blue-400 mb-2">PCMCI Analysis</h4>
                    <p className="text-sm text-slate-400">Explore causal relationships in energy system</p>
                  </Link>
                  <Link href="/anomalies" className="p-4 bg-slate-600 hover:bg-slate-500 rounded transition">
                    <h4 className="font-semibold text-orange-400 mb-2">Anomaly Detection</h4>
                    <p className="text-sm text-slate-400">Review detected anomalies and patterns</p>
                  </Link>
                  <Link href="/rl-strategy" className="p-4 bg-slate-600 hover:bg-slate-500 rounded transition">
                    <h4 className="font-semibold text-purple-400 mb-2">Q-Learning Strategy</h4>
                    <p className="text-sm text-slate-400">Understand optimization approach</p>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  )
}
