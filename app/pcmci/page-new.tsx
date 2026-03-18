'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PCMCIData {
  num_links: number
  significant_links: number
  links: Array<{
    source: string
    target: string
    p_value: number
  }>
}

export default function PCMCIPage() {
  const [pcmciData, setPcmciData] = useState<PCMCIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPCMCI = async () => {
      try {
        const res = await fetch('/api/pcmci')
        if (!res.ok) throw new Error('Failed to fetch PCMCI data')
        const data = await res.json()
        setPcmciData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchPCMCI()
  }, [])

  return (
    <PageLayout
      title="PCMCI Causal Analysis"
      description="Momentary Conditional Independence Test Results"
      subtitle="Identifying causal relationships in energy systems"
    >
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading PCMCI analysis...</p>
          </div>
        </div>
      ) : error ? (
        <Card className="bg-red-900/20 border-red-500">
          <CardContent className="pt-6">
            <p className="text-red-400">Error: {error}</p>
          </CardContent>
        </Card>
      ) : pcmciData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-400">Total Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{pcmciData.num_links}</p>
                <p className="text-sm text-slate-400 mt-2">Causal relationships detected</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-400">Significant Links</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">{pcmciData.significant_links}</p>
                <p className="text-sm text-slate-400 mt-2">p-value &lt; 0.05</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Links */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle>Detected Causal Links</CardTitle>
              <CardDescription>Top causal relationships identified by PCMCI test</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pcmciData.links.slice(0, 10).map((link, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-slate-600 rounded-lg hover:bg-slate-500 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-blue-400 font-semibold">{link.source}</span>
                      <span className="text-slate-400">→</span>
                      <span className="text-green-400 font-semibold">{link.target}</span>
                    </div>
                    <div className="text-sm text-slate-400">
                      p={link.p_value.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Back Link */}
          <div className="flex justify-between">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              ← Back to Dashboard
            </Link>
            <Link href="/anomalies" className="text-blue-400 hover:text-blue-300">
              Next: Anomaly Detection →
            </Link>
          </div>
        </div>
      ) : null}
    </PageLayout>
  )
}
