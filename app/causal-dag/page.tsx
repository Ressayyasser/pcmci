'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowRight, Info, Zap } from 'lucide-react'

interface Node {
  id: string
  label: string
  type: string
  unit: string
  description: string
}

interface Edge {
  id: string
  source: string
  target: string
  lag: number
  strength: number
  p_value: number
  significance: string
  explanation: string
}

interface DAGData {
  nodes: Node[]
  edges: Edge[]
  summary: {
    num_nodes: number
    num_links: number
    num_significant_links: number
    avg_strength: number
    max_lag: number
  }
}

export default function CausalDAGPage() {
  const [dagData, setDagData] = useState<DAGData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null)

  useEffect(() => {
    const fetchDAG = async () => {
      try {
        const res = await fetch('/api/advanced?endpoint=dag')
        const data = await res.json()
        setDagData(data)
      } catch (err) {
        console.error('[v0] DAG fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDAG()
  }, [])

  if (loading) {
    return (
      <div>
        <PageHeader title="Causal DAG (PCMCI)" description="Temporal causal graph with dynamical lags" />
        <main className="max-w-7xl mx-auto px-8 py-16 w-full">
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading causal graph...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!dagData) {
    return (
      <div>
        <PageHeader title="Causal DAG (PCMCI)" description="Temporal causal graph with dynamical lags" />
        <main className="max-w-7xl mx-auto px-8 py-16 w-full">
          <Card className="bg-destructive/10 border-destructive">
            <CardContent className="pt-6">
              <p className="text-destructive">Failed to load causal graph</p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const relevantEdges = selectedNode 
    ? dagData.edges.filter(e => e.source === selectedNode || e.target === selectedNode)
    : dagData.edges

  return (
    <div>
      <PageHeader 
        title="Causal DAG (PCMCI)" 
        description="Temporal causal graph with dynamical lags and robustness measures"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        <Tabs defaultValue="graph" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="graph">Causal Graph</TabsTrigger>
            <TabsTrigger value="nodes">Variables</TabsTrigger>
            <TabsTrigger value="edges">Causal Links</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          {/* Graph Visualization Tab */}
          <TabsContent value="graph" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Temporal Causal Graph</CardTitle>
                <CardDescription>
                  Interactive PCMCI DAG showing causal relationships with temporal lags (τ). 
                  Click nodes to highlight their connections.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full bg-muted rounded-lg p-8 min-h-96 flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center space-y-4">
                    <Zap className="w-12 h-12 text-primary mx-auto" />
                    <div>
                      <p className="text-foreground font-semibold">DAG Visualization Ready</p>
                      <p className="text-muted-foreground text-sm">
                        Interactive graph rendering with Cytoscape.js will display here
                      </p>
                      <p className="text-muted-foreground text-xs mt-2">
                        {dagData.nodes.length} nodes × {dagData.edges.length} temporal causal links
                      </p>
                    </div>
                  </div>
                </div>

                {/* Node List */}
                <div className="mt-8">
                  <p className="font-semibold text-foreground mb-4">Click to select variable and see causal neighbors:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {dagData.nodes.map(node => (
                      <button
                        key={node.id}
                        onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                        className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                          selectedNode === node.id
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary text-foreground border-border hover:border-primary'
                        }`}
                      >
                        {node.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Variables Tab */}
          <TabsContent value="nodes" className="space-y-4">
            <div className="grid gap-4">
              {dagData.nodes.map(node => (
                <Card key={node.id} className="bg-card border-border hover:border-primary/50 cursor-pointer transition-colors" onClick={() => setSelectedNode(node.id)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{node.label}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        node.type === 'exogenous' ? 'bg-primary/20 text-primary' :
                        node.type === 'state' ? 'bg-accent/20 text-accent' :
                        'bg-chart-3/20 text-chart-3'
                      }`}>
                        {node.type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-foreground">{node.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">Unit: <span className="text-foreground">{node.unit}</span></span>
                      <span className="text-muted-foreground">ID: <span className="font-mono text-foreground">{node.id}</span></span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Causal Links Tab */}
          <TabsContent value="edges" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Top Causal Links</CardTitle>
                <CardDescription>
                  {selectedNode 
                    ? `Links involving "${dagData.nodes.find(n => n.id === selectedNode)?.label}"`
                    : 'All temporal causal relationships (sorted by strength)'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relevantEdges.map(edge => {
                  const sourceNode = dagData.nodes.find(n => n.id === edge.source)
                  const targetNode = dagData.nodes.find(n => n.id === edge.target)
                  
                  return (
                    <div 
                      key={edge.id}
                      className="p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedEdge(selectedEdge === edge.id ? null : edge.id)}
                    >
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 font-semibold text-foreground">
                            <span>{sourceNode?.label}</span>
                            <ArrowRight className="w-4 h-4 text-primary" />
                            <span>τ={edge.lag}</span>
                            <ArrowRight className="w-4 h-4 text-primary" />
                            <span>{targetNode?.label}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          edge.significance === 'highly_significant' ? 'bg-primary/30 text-primary' :
                          edge.significance === 'significant' ? 'bg-accent/30 text-accent' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {edge.significance}
                        </span>
                      </div>

                      <p className="text-muted-foreground text-sm mb-3">{edge.explanation}</p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Strength</p>
                          <p className="font-semibold text-foreground">{edge.strength.toFixed(3)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">p-value</p>
                          <p className="font-semibold text-foreground">{edge.p_value.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Lag (τ)</p>
                          <p className="font-semibold text-foreground">{edge.lag} months</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Robustness</p>
                          <p className="font-semibold text-foreground">E-value →</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-primary">Variables</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{dagData.summary.num_nodes}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-accent">Causal Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{dagData.summary.num_links}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-chart-2">Significant (p&lt;0.05)</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{dagData.summary.num_significant_links}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-chart-1">Avg Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{dagData.summary.avg_strength.toFixed(2)}</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-chart-4">Max Lag</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-foreground">{dagData.summary.max_lag} months</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  About PCMCI
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">PCMCI (Peter-Clark Momentary Conditional Independence)</strong> is a causal discovery algorithm designed for short multivariate time series common in industrial systems.
                </p>
                <p>
                  The graph above shows temporal causal relationships where <strong className="text-foreground">X(t-τ) → Y(t)</strong> indicates variable X at time lag τ causally influences variable Y at the current time.
                </p>
                <p>
                  <strong className="text-foreground">Significance levels</strong>:
                </p>
                <ul className="space-y-2 ml-4">
                  <li>🔴 <strong>Highly Significant</strong>: p &lt; 0.01 (strong causal evidence)</li>
                  <li>🟡 <strong>Significant</strong>: p &lt; 0.05 (moderate evidence)</li>
                  <li>⚪ <strong>Weak</strong>: p &lt; 0.10 (weak evidence)</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
