'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, Activity, TrendingUp, TrendingDown, Zap, RefreshCw } from 'lucide-react'

interface SystemSignals {
  vapeur_HP_admission: number
  GTA1_load: number
  GTA2_load: number
  GTA3_load: number
  prod_total: number
  bilan_net: number
  system_efficiency: number
  condenser_temp: number
  anomaly_score: number
}

interface Signal {
  name: string
  key: keyof SystemSignals
  unit: string
  min: number
  max: number
  current: number
  baseline: number
  description: string
}

export default function RealtimeControlPage() {
  const [signals, setSignals] = useState<Signal[]>([
    {
      name: 'HP Steam Inlet',
      key: 'vapeur_HP_admission',
      unit: 't/h',
      min: 100,
      max: 200,
      current: 190,
      baseline: 190,
      description: 'High-pressure steam input from upstream'
    },
    {
      name: 'GTA1 Load',
      key: 'GTA1_load',
      unit: 'MW',
      min: 20,
      max: 50,
      current: 38,
      baseline: 38,
      description: 'Generator turbine unit 1 load'
    },
    {
      name: 'GTA2 Load',
      key: 'GTA2_load',
      unit: 'MW',
      min: 20,
      max: 50,
      current: 39,
      baseline: 39,
      description: 'Generator turbine unit 2 load'
    },
    {
      name: 'GTA3 Load',
      key: 'GTA3_load',
      unit: 'MW',
      min: 20,
      max: 50,
      current: 37,
      baseline: 37,
      description: 'Generator turbine unit 3 load'
    },
    {
      name: 'Condenser Temperature',
      key: 'condenser_temp',
      unit: '°C',
      min: 25,
      max: 50,
      current: 32,
      baseline: 32,
      description: 'Condenser outlet temperature - critical for efficiency'
    },
  ])

  const [derived, setDerived] = useState({
    prod_total: 114.0,
    bilan_net: 42.5,
    system_efficiency: 78.5,
    anomaly_score: 0.05,
  })

  const [alerts, setAlerts] = useState<string[]>([])
  const [history, setHistory] = useState<any[]>([])

  // Update derived metrics when signals change
  useEffect(() => {
    const totalProduction = signals
      .filter(s => s.key.includes('load') && s.key !== 'GTA3_load')
      .reduce((sum, s) => sum + s.current, 0) + signals.find(s => s.key === 'GTA3_load')?.current || 0

    const hpSteam = signals.find(s => s.key === 'vapeur_HP_admission')?.current || 190
    const condTemp = signals.find(s => s.key === 'condenser_temp')?.current || 32

    // Calculate efficiency based on condenser temp
    const baseEfficiency = 78.5
    const tempDegradation = (condTemp - 32) * 0.5 // 0.5% per degree above baseline
    const efficiency = Math.max(50, baseEfficiency - tempDegradation)

    // Calculate net balance based on steam and efficiency
    const steamFactor = hpSteam / 190
    const baseBalance = 42.5
    const balance = baseBalance * steamFactor * (efficiency / 78.5)

    // Calculate anomaly score
    const tempAnomaly = Math.abs((condTemp - 32) / 8) * 0.3
    const steamAnomaly = Math.abs((hpSteam - 190) / 20) * 0.3
    const efficiencyAnomaly = Math.max(0, (78.5 - efficiency) / 10) * 0.4
    const anomalyScore = Math.min(1, tempAnomaly + steamAnomaly + efficiencyAnomaly)

    setDerived({
      prod_total: totalProduction,
      bilan_net: balance,
      system_efficiency: efficiency,
      anomaly_score: anomalyScore,
    })

    // Generate alerts
    const newAlerts = []
    if (condTemp > 40) newAlerts.push('⚠️ Condenser temperature critical - risk of thermal failure')
    if (hpSteam < 160) newAlerts.push('🔴 Steam pressure low - production capacity threatened')
    if (efficiency < 70) newAlerts.push('⚠️ System efficiency degraded below 70% threshold')
    if (anomalyScore > 0.6) newAlerts.push('🔥 Multiple anomalies detected - intervention required')
    if (balance < 20) newAlerts.push('📉 Net balance critically low - revenue impact')

    setAlerts(newAlerts)

    // Record in history
    setHistory(prev => [...prev.slice(-19), {
      timestamp: new Date().toLocaleTimeString(),
      signals: Object.fromEntries(signals.map(s => [s.key, s.current])),
      derived
    }])
  }, [signals])

  const handleSignalChange = (key: string, value: number) => {
    setSignals(prev => prev.map(s => 
      s.key === key ? { ...s, current: value } : s
    ))
  }

  const getSignalStatus = (signal: Signal) => {
    const percent = (signal.current - signal.baseline) / (signal.baseline - signal.min)
    if (Math.abs(percent) < 0.05) return 'stable'
    if (percent > 0) return 'increasing'
    return 'decreasing'
  }

  const getMetricColor = (metric: string, value: number) => {
    if (metric === 'anomaly_score') {
      if (value > 0.6) return 'text-destructive'
      if (value > 0.3) return 'text-chart-1'
      return 'text-accent'
    }
    if (metric === 'system_efficiency') {
      if (value > 75) return 'text-accent'
      if (value > 70) return 'text-chart-1'
      return 'text-destructive'
    }
    if (metric === 'bilan_net') {
      if (value > 40) return 'text-accent'
      if (value > 20) return 'text-chart-1'
      return 'text-destructive'
    }
    return 'text-foreground'
  }

  return (
    <div>
      <PageHeader 
        title="Real-time Control Dashboard"
        description="Modify system signals and observe RL agent reactions in quasi-real-time"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="mb-8 space-y-3">
            {alerts.map((alert, idx) => (
              <div key={idx} className="p-4 bg-destructive/10 border border-destructive/50 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-foreground text-sm">{alert}</p>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="controls" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="controls">Signal Controls</TabsTrigger>
            <TabsTrigger value="derived">Derived Metrics</TabsTrigger>
            <TabsTrigger value="history">Real-time History</TabsTrigger>
          </TabsList>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-6">
            <div className="grid gap-6">
              {signals.map(signal => {
                const status = getSignalStatus(signal)
                const change = signal.current - signal.baseline
                const changePercent = (change / signal.baseline) * 100
                
                return (
                  <Card key={signal.key} className="bg-card border-border">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{signal.name}</CardTitle>
                          <CardDescription>{signal.description}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span className="text-3xl font-bold text-foreground">{signal.current.toFixed(1)}</span>
                            <span className="text-muted-foreground">{signal.unit}</span>
                          </div>
                          {Math.abs(change) > 0 && (
                            <p className={`text-xs mt-1 ${change > 0 ? 'text-accent' : 'text-destructive'}`}>
                              {change > 0 ? '+' : ''}{changePercent.toFixed(1)}% from baseline
                            </p>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Value</span>
                          <span className="font-mono text-foreground">{signal.min.toFixed(0)} ← → {signal.max.toFixed(0)}</span>
                        </div>
                        <input
                          type="range"
                          min={signal.min}
                          max={signal.max}
                          step="0.1"
                          value={signal.current}
                          onChange={(e) => handleSignalChange(signal.key, parseFloat(e.target.value))}
                          className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-muted-foreground">Current</p>
                          <p className="font-semibold text-foreground">{signal.current.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-muted-foreground">Baseline</p>
                          <p className="font-semibold text-foreground">{signal.baseline.toFixed(2)}</p>
                        </div>
                        <div className="p-3 bg-secondary rounded-lg">
                          <p className="text-muted-foreground">Status</p>
                          <div className="flex items-center gap-1 mt-1">
                            {status === 'increasing' && (
                              <>
                                <TrendingUp className="w-4 h-4 text-accent" />
                                <span className="text-accent">↑</span>
                              </>
                            )}
                            {status === 'decreasing' && (
                              <>
                                <TrendingDown className="w-4 h-4 text-destructive" />
                                <span className="text-destructive">↓</span>
                              </>
                            )}
                            {status === 'stable' && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <button
              onClick={() => {
                setSignals(prev => prev.map(s => ({ ...s, current: s.baseline })))
              }}
              className="w-full p-3 bg-secondary border border-border rounded-lg hover:border-primary transition-colors text-foreground font-semibold flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to Baseline
            </button>
          </TabsContent>

          {/* Derived Metrics Tab */}
          <TabsContent value="derived" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Total Production</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${getMetricColor('prod_total', derived.prod_total)}`}>
                    {derived.prod_total.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">MW</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Net Balance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${getMetricColor('bilan_net', derived.bilan_net)}`}>
                    {derived.bilan_net.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">MWh</p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">System Efficiency</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${getMetricColor('system_efficiency', derived.system_efficiency)}`}>
                    {derived.system_efficiency.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">%</p>
                </CardContent>
              </Card>

              <Card className={`border-2 ${derived.anomaly_score > 0.6 ? 'bg-destructive/10 border-destructive/50' : 'bg-card border-border'}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-muted-foreground">Anomaly Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-3xl font-bold ${getMetricColor('anomaly_score', derived.anomaly_score)}`}>
                    {derived.anomaly_score.toFixed(3)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">Detection score</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System State Explanation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>
                  <strong className="text-foreground">Current Operating Point:</strong> The system is operating at {derived.prod_total.toFixed(0)} MW production with {derived.system_efficiency.toFixed(1)}% thermal efficiency.
                </p>
                {derived.bilan_net > 40 && (
                  <p>
                    <strong className="text-foreground">✓ Positive Balance:</strong> Net energy balance is {derived.bilan_net.toFixed(1)} MWh, indicating healthy system operation with surplus capacity.
                  </p>
                )}
                {derived.bilan_net <= 40 && derived.bilan_net > 20 && (
                  <p>
                    <strong className="text-chart-1">⚠️ Warning:</strong> Net balance declining to {derived.bilan_net.toFixed(1)} MWh. Monitor steam availability and turbine efficiency.
                  </p>
                )}
                {derived.bilan_net <= 20 && (
                  <p>
                    <strong className="text-destructive">🔴 Critical:</strong> Net balance critically low at {derived.bilan_net.toFixed(1)} MWh. Intervention required to restore operational capacity.
                  </p>
                )}
                {derived.system_efficiency < 75 && (
                  <p>
                    <strong className="text-chart-1">⚠️ Efficiency Degradation:</strong> System efficiency is {derived.system_efficiency.toFixed(1)}%, below the 78% target. Condenser temperature and steam routing should be optimized.
                  </p>
                )}
                {derived.anomaly_score > 0.5 && (
                  <p>
                    <strong className="text-destructive">🔴 Multiple Anomalies Detected:</strong> Anomaly score {derived.anomaly_score.toFixed(3)} indicates causal degradation in system. RL agent will recommend maintenance actions.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">Real-time Signal History (Last 20 updates)</CardTitle>
                <CardDescription>Track how derived metrics change as you adjust control signals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-muted-foreground font-semibold">Time</th>
                        <th className="text-right p-3 text-muted-foreground font-semibold">Prod (MW)</th>
                        <th className="text-right p-3 text-muted-foreground font-semibold">Balance (MWh)</th>
                        <th className="text-right p-3 text-muted-foreground font-semibold">Efficiency (%)</th>
                        <th className="text-right p-3 text-muted-foreground font-semibold">Anomaly</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((entry, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-secondary/50 transition-colors">
                          <td className="p-3 text-foreground">{entry.timestamp}</td>
                          <td className="text-right p-3 text-foreground">{entry.derived.prod_total.toFixed(1)}</td>
                          <td className="text-right p-3 text-foreground">{entry.derived.bilan_net.toFixed(1)}</td>
                          <td className="text-right p-3 text-foreground">{entry.derived.system_efficiency.toFixed(1)}</td>
                          <td className={`text-right p-3 font-mono ${getMetricColor('anomaly_score', entry.derived.anomaly_score)}`}>
                            {entry.derived.anomaly_score.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
