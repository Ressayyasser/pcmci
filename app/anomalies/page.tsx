'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

interface AnomalyData {
  total_anomalies: number
  anomaly_rate: number
  anomaly_indices: number[]
  isolation_forest_count: number
  cusum_count: number
  detection_methods: string[]
  description: string
}

export default function AnomaliesPage() {
  const [data, setData] = useState<AnomalyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/anomalies')
        if (!res.ok) throw new Error('Failed to fetch anomaly data')
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
        title="Anomaly Detection Results"
        description="Ensemble-based anomaly detection analysis"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading anomaly analysis...</p>
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
                  <CardTitle className="text-lg text-orange-400">Total Anomalies</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.total_anomalies}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-orange-400">Detection Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{(data.anomaly_rate * 100).toFixed(2)}%</p>
                  <p className="text-sm text-slate-400 mt-2">of all timestamps</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-orange-400">Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm space-y-1">
                    {data.detection_methods.map((method, idx) => (
                      <li key={idx}>{method}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Method Details */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Detection Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-600 p-4 rounded">
                    <h3 className="font-semibold text-blue-400 mb-2">Isolation Forest</h3>
                    <p className="text-2xl font-bold">{data.isolation_forest_count}</p>
                    <p className="text-sm text-slate-400 mt-2">Anomalies detected</p>
                    <p className="text-xs text-slate-500 mt-3">
                      Isolation Forest isolates anomalies by randomly selecting features and split values, identifying points that are easier to isolate.
                    </p>
                  </div>
                  <div className="bg-slate-600 p-4 rounded">
                    <h3 className="font-semibold text-blue-400 mb-2">CUSUM-like Algorithm</h3>
                    <p className="text-2xl font-bold">{data.cusum_count}</p>
                    <p className="text-sm text-slate-400 mt-2">Anomalies detected</p>
                    <p className="text-xs text-slate-500 mt-3">
                      CUSUM (Cumulative Sum Control Chart) detects changes in process mean by analyzing cumulative deviations from baseline.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ensemble Results */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Ensemble Anomalies</CardTitle>
                <CardDescription>Combined detection results from all methods</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">{data.description}</p>
                <div className="bg-slate-600 p-4 rounded space-y-3">
                  <p className="text-sm"><strong>Total detected:</strong> {data.total_anomalies}</p>
                  <p className="text-sm"><strong>Detection rate:</strong> {(data.anomaly_rate * 100).toFixed(3)}% of dataset</p>
                  <p className="text-sm"><strong>Confidence:</strong> Ensemble voting from multiple algorithms</p>
                </div>
              </CardContent>
            </Card>

            {/* Anomaly Timeline Sample */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>First 50 Anomaly Events</CardTitle>
                <CardDescription>Timestamp indices of detected anomalies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {data.anomaly_indices.slice(0, 50).map((idx, i) => (
                    <div key={i} className="bg-slate-600 p-2 rounded text-center text-xs">
                      <p className="text-orange-400 font-semibold">{idx}</p>
                    </div>
                  ))}
                </div>
                {data.anomaly_indices.length > 50 && (
                  <p className="text-sm text-slate-400 mt-4">
                    ... and {data.anomaly_indices.length - 50} more anomalies
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">1.</span>
                    <span>Investigate detected anomalies for root cause analysis</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">2.</span>
                    <span>Cross-reference with maintenance logs and operational events</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">3.</span>
                    <span>Implement real-time alerting for future anomalies</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-green-400 font-bold">4.</span>
                    <span>Use anomaly patterns to train predictive maintenance models</span>
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
