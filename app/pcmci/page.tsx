'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/page-header'

interface CausalLink {
  source: string
  target: string
  strength: number
  lag?: number
}

interface PCMCIData {
  total_links: number
  significant_links: number
  links: CausalLink[]
  top_10_links: CausalLink[]
  method: string
  description: string
}

export default function PCMCIPage() {
  const [data, setData] = useState<PCMCIData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pcmci')
        if (!res.ok) throw new Error('Failed to fetch PCMCI data')
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
        title="PCMCI Causal Analysis"
        description="Momentary Conditional Independence test for causal relationships"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading PCMCI analysis...</p>
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
                  <CardTitle className="text-lg text-green-400">Total Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.total_links}</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-400">Significant Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.significant_links}</p>
                  <p className="text-sm text-slate-400 mt-2">(p-value &lt; 0.05)</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-green-400">Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold">{data.method}</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>About PCMCI</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-slate-300">{data.description}</p>
                <div className="bg-slate-600 p-4 rounded space-y-2 text-sm">
                  <p><strong>What it measures:</strong> Conditional independence relationships between variables at different time lags</p>
                  <p><strong>Output:</strong> Directed acyclic graph (DAG) showing causal relationships</p>
                  <p><strong>Strength:</strong> Values between 0-1 indicating relationship strength (p-value)</p>
                </div>
              </CardContent>
            </Card>

            {/* Top 10 Links */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>Top 10 Strongest Causal Links</CardTitle>
                <CardDescription>Ranked by statistical strength</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.top_10_links.map((link, idx) => (
                    <div key={idx} className="bg-slate-600 p-3 rounded flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">
                          {link.source} → {link.target}
                        </p>
                        <p className="text-sm text-slate-400">
                          {link.lag !== undefined && link.lag !== 0 && `Lag: ${link.lag} | `}
                          Strength: {(link.strength * 100).toFixed(2)}%
                        </p>
                      </div>
                      <div className="w-32 bg-slate-500 rounded-full h-2 ml-4">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${Math.min(link.strength * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Links Table */}
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader>
                <CardTitle>All Causal Links</CardTitle>
                <CardDescription>Complete list of {data.links.length} detected relationships</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b border-slate-600">
                      <tr>
                        <th className="text-left py-2 px-2">Source</th>
                        <th className="text-left py-2 px-2">Target</th>
                        <th className="text-right py-2 px-2">Strength</th>
                        <th className="text-right py-2 px-2">Lag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.links.slice(0, 20).map((link, idx) => (
                        <tr key={idx} className="border-b border-slate-600 hover:bg-slate-600/50">
                          <td className="py-2 px-2 font-mono text-blue-400">{link.source}</td>
                          <td className="py-2 px-2 font-mono text-blue-400">{link.target}</td>
                          <td className="text-right py-2 px-2">{(link.strength * 100).toFixed(2)}%</td>
                          <td className="text-right py-2 px-2">{link.lag ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {data.links.length > 20 && (
                    <p className="text-sm text-slate-400 mt-4">
                      Showing 20 of {data.links.length} links. Download data for complete list.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  )
}
