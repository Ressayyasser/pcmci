'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AnomalyData {
  total_detected: number
  detection_rate: number
  anomalies: Array<{
    timestamp: string
    severity: 'low' | 'medium' | 'high'
    value: number
    variable: string
  }>
}

export default function AnomaliesPage() {
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnomalies = async () => {
      try {
        const res = await fetch('/api/anomalies')
        if (!res.ok) throw new Error('Failed to fetch anomaly data')
        const data = await res.json()
        setAnomalyData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchAnomalies()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-400 bg-red-500/10'
      case 'medium':
        return 'text-orange-400 bg-orange-500/10'
      case 'low':
        return 'text-yellow-400 bg-yellow-500/10'
      default:
        return 'text-slate-400'
    }
  }

  return (
    <PageLayout
      title="Anomaly Detection"
      description="Ensemble-based anomaly detection results"
      subtitle="Isolation Forest + CUSUM Algorithm"
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading anomaly data...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      ) : anomalyData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-400">Anomalies Detected</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{anomalyData.total_detected}</p>
                <p className="text-sm text-slate-400 mt-2">Total anomalous points</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-orange-400">Detection Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{(anomalyData.detection_rate * 100).toFixed(2)}%</p>
                <p className="text-sm text-slate-400 mt-2">Percentage of total data</p>
              </CardContent>
            </Card>
          </div>

          {/* Anomaly List */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle>Recent Anomalies</CardTitle>
              <CardDescription>Latest detected anomalies in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {anomalyData.anomalies.slice(0, 15).map((anomaly, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-lg ${getSeverityColor(
                      anomaly.severity
                    )}`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div>
                        <p className="font-semibold">{anomaly.variable}</p>
                        <p className="text-sm text-slate-300">{anomaly.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{anomaly.value.toFixed(2)}</p>
                      <p className="text-xs uppercase font-medium">{anomaly.severity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Link href="/pcmci" className="text-blue-400 hover:text-blue-300">
              ← Back to PCMCI
            </Link>
            <Link href="/rl-strategy" className="text-blue-400 hover:text-blue-300">
              Next: Q-Learning Strategy →
            </Link>
          </div>
        </div>
      ) : null}
    </PageLayout>
  )
}
