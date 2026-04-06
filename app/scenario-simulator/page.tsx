'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, TrendingDown, TrendingUp, Zap, CheckCircle2, AlertTriangle } from 'lucide-react'

interface SystemState {
  timestamp: string
  vapeur_HP_admission: number
  GTA1_load: number
  GTA2_load: number
  GTA3_load: number
  prod_total: number
  vapeur_MP_soutir: number
  vapeur_BP_soutir: number
  bilan_net: number
  system_efficiency: number
  condenser_temp: number
  anomaly_score: number
  maintenance_flag: boolean
}

interface Recommendation {
  action: string
  confidence: number
  expected_reward: number
  estimated_impact: Record<string, number>
  detailed_reasoning: string[]
  affected_variables: string[]
  implementation_steps: string[]
  risks: string[]
  monitoring_metrics: string[]
  shap_values: Record<string, number>
}

const SCENARIOS = [
  { id: 'normal', name: 'Normal Operation', description: 'System operating at baseline capacity' },
  { id: 'steam_loss', name: '🔴 Steam Loss', description: 'HP steam inlet drops 20% - cascading production loss' },
  { id: 'condenser_fouling', name: '⚠️ Condenser Fouling', description: 'Thermal degradation reducing heat rejection' },
  { id: 'load_spike', name: '📈 Load Spike', description: 'Electrical demand increases 25%' },
  { id: 'cascading_failure', name: '🔥 Cascading Failure', description: 'Multiple system failures - critical situation' },
]

export default function ScenarioSimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState('normal')
  const [systemState, setSystemState] = useState<SystemState | null>(null)
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadScenario(selectedScenario)
  }, [selectedScenario])

  const loadScenario = async (scenario: string) => {
    setLoading(true)
    try {
      const [stateRes, recRes] = await Promise.all([
        fetch(`/api/advanced?endpoint=scenario&scenario=${scenario}`),
        fetch(`/api/advanced?endpoint=recommendation&scenario=${scenario}`)
      ])
      
      const state = await stateRes.json()
      const rec = await recRes.json()
      
      setSystemState(state)
      setRecommendation(rec)
    } catch (err) {
      console.error('[v0] Scenario load error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!systemState || !recommendation) {
    return (
      <div>
        <PageHeader title="Scenario Simulator" description="Test anomaly scenarios and observe RL agent reactions" />
        <main className="max-w-7xl mx-auto px-8 py-16 w-full">
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading scenario...</p>
          </div>
        </main>
      </div>
    )
  }

  const getMetricStatus = (metric: string, value: number) => {
    const thresholds: Record<string, [number, number]> = {
      prod_total: [100, 120],
      bilan_net: [35, 50],
      system_efficiency: [75, 85],
      condenser_temp: [30, 35],
      anomaly_score: [0.1, 0.3],
    }

    const [warning, good] = thresholds[metric] || [0, 100]
    if (value >= good) return 'good'
    if (value >= warning) return 'warning'
    return 'critical'
  }

  const confidenceColor = 
    recommendation.confidence > 0.9 ? 'text-primary' :
    recommendation.confidence > 0.8 ? 'text-accent' :
    'text-destructive'

  return (
    <div>
      <PageHeader 
        title="Scenario Simulator"
        description="Test anomaly scenarios and observe RL agent reactions in real-time"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        <Tabs defaultValue="scenarios" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="scenarios">Anomaly Scenarios</TabsTrigger>
            <TabsTrigger value="state">System State</TabsTrigger>
            <TabsTrigger value="recommendation">RL Recommendation</TabsTrigger>
          </TabsList>

          {/* Scenarios Tab */}
          <TabsContent value="scenarios" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SCENARIOS.map(scenario => (
                <button
                  key={scenario.id}
                  onClick={() => setSelectedScenario(scenario.id)}
                  className={`p-6 rounded-lg text-left transition-all border-2 ${
                    selectedScenario === scenario.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary'
                  }`}
                >
                  <p className="font-semibold text-foreground text-lg">{scenario.name}</p>
                  <p className="text-muted-foreground text-sm mt-2">{scenario.description}</p>
                </button>
              ))}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-primary">About This Scenario</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm space-y-3">
                {selectedScenario === 'steam_loss' && (
                  <>
                    <p>This scenario simulates a <strong>20% reduction in high-pressure steam inlet</strong>, representing potential upstream production issues or supply problems.</p>
                    <p><strong className="text-foreground">Cascading effects:</strong> Lower steam → reduced turbine output → decreased electricity production → negative net balance.</p>
                    <p><strong className="text-foreground">Expected RL response:</strong> The agent should recommend activating auxiliary boiler or optimizing other generating units to compensate.</p>
                  </>
                )}
                {selectedScenario === 'condenser_fouling' && (
                  <>
                    <p>The condenser outlet temperature increases from 32°C to 40°C due to heat exchanger fouling or cooling water problems.</p>
                    <p><strong className="text-foreground">Root cause:</strong> Reduced heat rejection capability → thermal feedback loop → system efficiency drops significantly.</p>
                    <p><strong className="text-foreground">Expected RL response:</strong> Recommend emergency condenser maintenance to restore thermal performance.</p>
                  </>
                )}
                {selectedScenario === 'cascading_failure' && (
                  <>
                    <p>This critical scenario combines multiple failures: steam loss + condenser fouling + high ambient temperature.</p>
                    <p><strong className="text-foreground">System impact:</strong> All production metrics degrade simultaneously, anomaly score reaches 0.75 (critical alert threshold).</p>
                    <p><strong className="text-foreground">Expected RL response:</strong> Multi-part strategy - emergency maintenance + load shifting + fuel-based backup activation.</p>
                  </>
                )}
                {selectedScenario === 'load_spike' && (
                  <>
                    <p>Sudden 25% increase in electrical demand from industrial consumers.</p>
                    <p><strong className="text-foreground">Challenge:</strong> System must increase production while maintaining efficiency and thermal balance.</p>
                    <p><strong className="text-foreground">Expected RL response:</strong> Progressive increase of all GTA units while monitoring steam availability and condenser temperature.</p>
                  </>
                )}
                {selectedScenario === 'normal' && (
                  <>
                    <p>Baseline operational scenario with all systems operating within normal parameters.</p>
                    <p><strong className="text-foreground">KPIs stable:</strong> Production stable, efficiency good, no anomalies detected.</p>
                    <p><strong className="text-foreground">Expected RL response:</strong> "Do nothing" - continue monitoring; no intervention required.</p>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System State Tab */}
          <TabsContent value="state" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'HP Steam Inlet', value: systemState.vapeur_HP_admission, unit: 't/h', key: 'vapeur_HP_admission' },
                { label: 'GTA1 Load', value: systemState.GTA1_load, unit: 'MW', key: 'GTA1_load' },
                { label: 'GTA2 Load', value: systemState.GTA2_load, unit: 'MW', key: 'GTA2_load' },
                { label: 'GTA3 Load', value: systemState.GTA3_load, unit: 'MW', key: 'GTA3_load' },
                { label: 'Total Production', value: systemState.prod_total, unit: 'MW', key: 'prod_total' },
                { label: 'Net Balance', value: systemState.bilan_net, unit: 'MWh', key: 'bilan_net' },
                { label: 'System Efficiency', value: systemState.system_efficiency, unit: '%', key: 'system_efficiency' },
                { label: 'Condenser Temp', value: systemState.condenser_temp, unit: '°C', key: 'condenser_temp' },
                { label: 'Anomaly Score', value: systemState.anomaly_score, unit: 'score', key: 'anomaly_score' },
              ].map(metric => {
                const status = getMetricStatus(metric.key, metric.value)
                return (
                  <Card key={metric.key} className={`border-2 ${
                    status === 'good' ? 'bg-card border-accent/50' :
                    status === 'warning' ? 'bg-card border-chart-1/50' :
                    'bg-destructive/10 border-destructive/50'
                  }`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold text-foreground">{metric.value.toFixed(1)}</p>
                          <p className="text-xs text-muted-foreground mt-1">{metric.unit}</p>
                        </div>
                        <div>
                          {status === 'good' && <CheckCircle2 className="w-5 h-5 text-accent" />}
                          {status === 'warning' && <AlertTriangle className="w-5 h-5 text-chart-1" />}
                          {status === 'critical' && <AlertCircle className="w-5 h-5 text-destructive" />}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* RL Recommendation Tab */}
          <TabsContent value="recommendation" className="space-y-4">
            <Card className="bg-card border-border border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-primary capitalize">
                      {recommendation.action.replace(/_/g, ' ')}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      RL Agent Recommendation based on Causal MDP
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className={`text-3xl font-bold ${confidenceColor}`}>
                      {(recommendation.confidence * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reasoning */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Detailed Reasoning (SHAP-based)
                  </h4>
                  <ul className="space-y-2 ml-7">
                    {recommendation.detailed_reasoning.map((reason, idx) => (
                      <li key={idx} className="text-muted-foreground text-sm list-disc">
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact Estimate */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Estimated Impact on Variables
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(recommendation.estimated_impact).map(([variable, impact]) => (
                      <div key={variable} className="p-3 bg-secondary rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground capitalize">{variable.replace(/_/g, ' ')}</p>
                        <div className="flex items-center justify-between mt-2">
                          <p className={`text-xl font-bold ${impact > 0 ? 'text-accent' : 'text-destructive'}`}>
                            {impact > 0 ? '+' : ''}{impact.toFixed(2)}
                          </p>
                          {impact > 0 ? <TrendingUp className="w-4 h-4 text-accent" /> : <TrendingDown className="w-4 h-4 text-destructive" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expected Reward */}
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">Expected Reward (Q-value)</p>
                  <p className="text-2xl font-bold text-primary">{recommendation.expected_reward.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground mt-2">Cumulative benefit after action implementation</p>
                </div>

                {/* Implementation Steps */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    Implementation Steps
                  </h4>
                  <ol className="space-y-2 ml-7">
                    {recommendation.implementation_steps.map((step, idx) => (
                      <li key={idx} className="text-muted-foreground text-sm list-decimal">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Risks */}
                {recommendation.risks.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      Risk Assessment
                    </h4>
                    <ul className="space-y-2 ml-7">
                      {recommendation.risks.map((risk, idx) => (
                        <li key={idx} className="text-muted-foreground text-sm list-disc">
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Monitoring Metrics */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Metrics to Monitor</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recommendation.monitoring_metrics.map((metric, idx) => (
                      <div key={idx} className="p-3 bg-secondary rounded-lg border border-border text-sm text-foreground">
                        ✓ {metric}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SHAP Values */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Feature Importance (SHAP)</h4>
                  <div className="space-y-3">
                    {Object.entries(recommendation.shap_values).map(([feature, importance]) => (
                      <div key={feature}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground capitalize">{feature.replace(/_/g, ' ')}</span>
                          <span className="text-foreground font-semibold">{(importance * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden border border-border">
                          <div 
                            className="bg-primary h-full transition-all"
                            style={{ width: `${importance * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
