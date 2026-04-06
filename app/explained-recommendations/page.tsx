'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Zap, AlertTriangle, TrendingUp, CheckCircle2, AlertCircle, 
  ArrowRight, Calendar, DollarSign, Gauge, Lock, Search 
} from 'lucide-react'

const DETAILED_RECOMMENDATIONS = [
  {
    id: 1,
    action: 'Activate Condenser Maintenance',
    confidence: 95,
    expectedReward: 15.5,
    trigger: 'Condenser outlet temperature >38°C + system efficiency <75%',
    causalChain: [
      'High ambient temperature or cooling water issues',
      '↓ Reduced heat rejection capability (Q = ṁ·cp·ΔT)',
      '↓ Condenser outlet temperature rises above 32°C baseline',
      '↓ Saturation pressure at condenser exit increases (steam tables)',
      '↓ Back-pressure on turbine increases',
      '↓ Isentropic efficiency drops (ηis = (h1-h2s)/(h1-h2actual))',
      '↓ System thermal efficiency degrades by ~5% per 1°C rise',
      '↓ Net energy balance becomes negative without intervention'
    ],
    why: [
      'Root Cause Analysis: Thermal degradation in condenser fouling causes cascading efficiency loss across the entire turbine cycle',
      'Causal Link Evidence: PCMCI shows condenser_temp(t-1) → system_efficiency(t) with strength 0.71 and p-value 0.003',
      'Temporal Lag Significance: 1-month lag indicates slow thermal accumulation before system-wide impact',
      'Robustness: E-value of 8.5 means confounders would need 8.5× strength to invalidate this causal link',
    ],
    implementation: [
      '1. Schedule during off-peak period (lowest production demand)',
      '2. Close cooling water inlet valve to isolate condenser circuit',
      '3. Drain condensate system and open access panels',
      '4. Use mechanical cleaning (rotating brush) to remove scale and fouling',
      '5. Inspect for tube erosion/corrosion; perform hydrostatic pressure test',
      '6. Reopen system, monitor temperature drop (should decrease 6-8°C within 1 hour)',
      '7. Verify pressure drop across condenser returns to <0.15 bar baseline'
    ],
    impact: {
      'System Efficiency': '+5.2%',
      'Condenser Temperature': '-8°C',
      'Net Balance': '+6.5 MWh',
      'Anomaly Score': '-0.40',
      'Annual Savings (estimated)': '+2.4M DH'
    },
    risks: [
      {
        severity: 'high',
        description: 'Production loss during 4-6 hour maintenance window (~€15k revenue impact)',
        mitigation: 'Schedule during planned maintenance periods; coordinate with electrical grid operator'
      },
      {
        severity: 'medium',
        description: 'Temporary grid frequency deviation while system is offline',
        mitigation: 'Notify grid operations 48h in advance; stage auxiliary boiler activation'
      },
      {
        severity: 'medium',
        description: 'Risk of tube damage if pressure test is too aggressive',
        mitigation: 'Perform test at 2.5 bar max (design is 3.0 bar); use certified pressure gauge'
      },
      {
        severity: 'low',
        description: 'Incomplete fouling removal if scale is too thick',
        mitigation: 'If brush fails, schedule chemical cleaning with citric acid solution'
      }
    ],
    economics: {
      maintenanceCost: 45000,
      productionLossHours: 5,
      productionLossMWh: 570,
      revenueImpact: -15000,
      efficiencyGainMonthly: 250,
      efficiencyGainAnnual: 3000,
      paybackMonths: 1.8
    },
    monitoringMetrics: [
      'Condenser outlet temperature (target: ≤32°C)',
      'Pressure drop across condenser tubes (target: <0.15 bar)',
      'System thermal efficiency (target: ≥78%)',
      'Anomaly detection score (should decrease from current value)',
      'Daily net balance trend (should recover within 2 weeks)'
    ]
  },
  {
    id: 2,
    action: 'Increase GTA1 Load by 5MW',
    confidence: 85,
    expectedReward: 8.2,
    trigger: 'Net balance <35 MWh AND total production <115 MW AND steam availability >180 t/h',
    causalChain: [
      'Operational demand signals low net balance',
      '↓ Operator sets GTA1 load setpoint higher in SCADA',
      '↓ Turbine control valve opens gradually (ramp rate ~1 MW/min for stability)',
      '↓ Higher steam mass flow through GTA1 turbine',
      '↓ Isentropic enthalpy drop increases (Δh = cp·ΔT·(ln(P1/P2)))',
      '↓ Mechanical power output from turbine increases (P = ṁ·Δh·ηmech)',
      '↓ Electrical generator output increases (coupled 1:1 after step-up transformer)',
      '↓ Total production increases, improving net balance'
    ],
    why: [
      'Causal Relationship: PCMCI analysis shows vapeur_HP_admission(t) → GTA1_load(t) → prod_total(t) → bilan_net(t)',
      'Strong Direct Link: GTA1_load → prod_total strength 0.85, p<0.001 (highly significant)',
      'No Time Lag: Same-time causality (τ=0) indicates immediate mechanical response',
      'Efficiency Safe: Increasing GTA1 improves overall system efficiency (reduces steam throttling losses)',
      'Constraint Check: HP steam at 190 t/h > required 150 t/h, so no supply-side limitation'
    ],
    implementation: [
      '1. Access SCADA system; navigate to GTA1 load control page',
      '2. Verify current load (e.g., 38.0 MW) and target load (43.0 MW)',
      '3. Increase load setpoint by 0.5 MW every 30 seconds (gradual ramp to prevent pressure spikes)',
      '4. Monitor real-time trends: steam pressure, bearing temperature, vibration levels',
      '5. Once at target, hold for 5 minutes and verify stable operation (no oscillations)',
      '6. Log configuration change in operations logbook with timestamp'
    ],
    impact: {
      'GTA1 Production': '+5.0 MW',
      'Total Production': '+5.0 MW',
      'Net Balance': '+8.2 MWh',
      'System Efficiency': '+1.2%',
      'Anomaly Score': 'No change'
    },
    risks: [
      {
        severity: 'medium',
        description: 'Pressure spike if load increase is too rapid (>2 MW/min)',
        mitigation: 'Use soft ramp profile; max rate 1 MW/min for GTA units'
      },
      {
        severity: 'medium',
        description: 'Bearing temperature may increase due to friction; could exceed alarm if ambient is hot',
        mitigation: 'Pre-check bearing temps; if >80°C, abort and investigate cooling water flow'
      },
      {
        severity: 'low',
        description: 'Electrical grid frequency may shift if production increase is not coordinated',
        mitigation: 'Notify grid operator (RTE/ONE) 15min before; ensure load is evenly distributed'
      }
    ],
    economics: {
      maintenanceCost: 0,
      productionGainMWh: 120,
      revenueGainMonthly: 9600,
      depreciationCost: 1200,
      netBenefit: 8400,
      roi: '700%'
    },
    monitoringMetrics: [
      'GTA1 electrical power output (every 1 min)',
      'Turbine inlet steam pressure (target: 55-58 bar)',
      'Bearing temperature (target: <80°C)',
      'Vibration levels at turbine casing (target: <15 mm/s)',
      'Net energy balance trend (5-min moving average)'
    ]
  },
  {
    id: 3,
    action: 'Optimize Steam Routing (MP/BP Split)',
    confidence: 82,
    expectedReward: 6.4,
    trigger: 'System efficiency 70-75% AND steam extraction pressure ratio suboptimal',
    causalChain: [
      'Turbine extraction pressures at MP and BP stages become imbalanced',
      '↓ Some MP consumers face pressure drop; others are throttled',
      '↓ Throttling losses occur at pressure control valves (throttling = isenthalpic, no work extraction)',
      '↓ Steam at extraction points expands irreversibly (entropy increases)',
      '↓ Available work (exergy) is wasted as heat in control valves',
      '↓ System IPE (vapor/MWh) increases - more steam needed for same power',
      '↓ Overall thermal efficiency decreases (η = Wnet / Qin)',
      '↓ Either net balance drops or costs increase significantly'
    ],
    why: [
      'Thermodynamic Root Cause: Uncontrolled throttling wastes exergy and increases irreversibilities',
      'Causal Evidence: PCMCI shows vapor_MP_soutir → system_efficiency (strength 0.68, p<0.02)',
      'Optimization Opportunity: Current MP/BP split is 65/35; optimal is ~60/40 for current demand',
      'IPE Metric: Current 1.92 t/MWh vs target 1.85 t/MWh indicates 3.8% efficiency margin available'
    ],
    implementation: [
      '1. Review current extraction pressures: MP~8.2 bar, BP~5.8 bar (from DCS)',
      '2. Consult steam demand schedule: MP ~50 t/h for phosphorique, BP ~30 t/h for engrais',
      '3. Adjust main extraction valve positions: increase MP valve opening 3%, decrease BP valve 3%',
      '4. Rebalance steam headers within tolerance: MP 8.5±0.3 bar, BP 5.5±0.2 bar',
      '5. Monitor IPE metric for 30 minutes; should drop to <1.88 t/MWh',
      '6. If consumer pressure alarms occur, micro-adjust valve positions by ±1%'
    ],
    impact: {
      'System Efficiency': '+3.5%',
      'IPE (vapor/MWh)': '-0.07 t/MWh',
      'Net Balance': '+4.8 MWh',
      'Steam Consumption': '-4.5%',
      'Anomaly Score': '-0.1'
    },
    risks: [
      {
        severity: 'medium',
        description: 'If MP pressure drops below 8.0 bar, phosphorique unit may trip (requires 8.2 min)',
        mitigation: 'Coordinate with phosphorique operators; have them monitor pressure during adjustment'
      },
      {
        severity: 'low',
        description: 'Transient oscillations in extracted pressures during valve movements',
        mitigation: 'Perform adjustments gradually; wait 2 min between each 1% move'
      }
    ],
    economics: {
      maintenanceCost: 0,
      monthlyGasSavings: 8500,
      operatorTimeHours: 0.5,
      laborCost: 250,
      netMonthlyBenefit: 8250,
      annualRoi: '99600 DH'
    },
    monitoringMetrics: [
      'MP extraction pressure (target: 8.4±0.2 bar)',
      'BP extraction pressure (target: 5.5±0.2 bar)',
      'IPE metric - actual vapor/MWh (target: <1.88)',
      'MP/BP consumer feedback (process parameter violations)',
      'System efficiency 4-hour moving average'
    ]
  }
]

export default function ExplainedRecommendationsPage() {
  const [selectedRecId, setSelectedRecId] = useState<number | null>(DETAILED_RECOMMENDATIONS[0].id)
  const [expandedRisk, setExpandedRisk] = useState<number | null>(null)

  const selectedRec = DETAILED_RECOMMENDATIONS.find(r => r.id === selectedRecId) || DETAILED_RECOMMENDATIONS[0]

  return (
    <div>
      <PageHeader 
        title="Explained Recommendations"
        description="Detailed causal reasoning for each RL agent action with thermodynamic foundations"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        {/* Recommendation Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {DETAILED_RECOMMENDATIONS.map(rec => (
            <button
              key={rec.id}
              onClick={() => setSelectedRecId(rec.id)}
              className={`p-4 rounded-lg text-left transition-all border-2 ${
                selectedRecId === rec.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-semibold text-foreground pr-2">{rec.action}</p>
                <span className={`px-2 py-1 rounded text-xs font-bold flex-shrink-0 ${
                  rec.confidence > 90 ? 'bg-accent/30 text-accent' :
                  rec.confidence > 80 ? 'bg-chart-1/30 text-chart-1' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {rec.confidence}%
                </span>
              </div>
              <p className="text-muted-foreground text-xs">{rec.trigger}</p>
            </button>
          ))}
        </div>

        <Tabs defaultValue="reasoning" className="space-y-6">
          <TabsList className="bg-secondary border border-border">
            <TabsTrigger value="reasoning">Causal Reasoning</TabsTrigger>
            <TabsTrigger value="implementation">Implementation</TabsTrigger>
            <TabsTrigger value="impact">Impact & Economics</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          </TabsList>

          {/* Causal Reasoning Tab */}
          <TabsContent value="reasoning" className="space-y-6">
            <Card className="bg-card border-border border-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-primary">{selectedRec.action}</CardTitle>
                    <CardDescription className="mt-2">{selectedRec.trigger}</CardDescription>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Confidence</p>
                    <p className="text-3xl font-bold text-accent">{selectedRec.confidence}%</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Causal Chain */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <ArrowRight className="w-5 h-5" />
                  Causal Chain: Root Cause → Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedRec.causalChain.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">
                          {idx + 1}
                        </div>
                        {idx < selectedRec.causalChain.length - 1 && (
                          <div className="w-0.5 h-8 bg-primary/30 mt-2" />
                        )}
                      </div>
                      <div className="pt-2">
                        <p className="text-foreground">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Why This Works */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  Why This Works (Evidence)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedRec.why.map((reason, idx) => (
                  <div key={idx} className="p-4 bg-secondary rounded-lg border border-border">
                    <p className="text-foreground text-sm">{reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Implementation Tab */}
          <TabsContent value="implementation" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <CheckCircle2 className="w-5 h-5" />
                  Step-by-Step Implementation Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedRec.implementation.map((step, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-semibold text-sm">
                          {idx + 1}
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Gauge className="w-5 h-5" />
                  Key Monitoring Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {selectedRec.monitoringMetrics.map((metric, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Gauge className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-foreground text-sm">{metric}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Impact Tab */}
          <TabsContent value="impact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Operational Impact */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-accent">
                    <TrendingUp className="w-5 h-5" />
                    Operational Impact
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(selectedRec.impact).map(([metric, value]) => (
                    <div key={metric} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                      <span className="text-muted-foreground text-sm">{metric}</span>
                      <span className={`font-bold text-lg ${value.startsWith('-') ? 'text-destructive' : 'text-accent'}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Economic Impact */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-primary">
                    <DollarSign className="w-5 h-5" />
                    Economic Impact (DH)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.entries(selectedRec.economics).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border">
                      <span className="text-muted-foreground text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</span>
                      <span className={`font-bold ${
                        String(value).includes('-') ? 'text-destructive' :
                        String(value).includes('+') ? 'text-accent' :
                        'text-foreground'
                      }`}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Risks Tab */}
          <TabsContent value="risks" className="space-y-4">
            {selectedRec.risks.length > 0 ? (
              selectedRec.risks.map((risk, idx) => (
                <Card 
                  key={idx}
                  className={`border-2 cursor-pointer transition-all ${
                    expandedRisk === idx
                      ? risk.severity === 'high' ? 'border-destructive/50 bg-destructive/5' :
                        risk.severity === 'medium' ? 'border-chart-1/50 bg-chart-1/5' :
                        'border-accent/50 bg-accent/5'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                  onClick={() => setExpandedRisk(expandedRisk === idx ? null : idx)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`w-5 h-5 ${
                          risk.severity === 'high' ? 'text-destructive' :
                          risk.severity === 'medium' ? 'text-chart-1' :
                          'text-accent'
                        }`} />
                        <p className="font-semibold text-foreground">{risk.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        risk.severity === 'high' ? 'bg-destructive/20 text-destructive' :
                        risk.severity === 'medium' ? 'bg-chart-1/20 text-chart-1' :
                        'bg-accent/20 text-accent'
                      }`}>
                        {risk.severity}
                      </span>
                    </div>
                  </CardHeader>
                  {expandedRisk === idx && (
                    <CardContent>
                      <div className="p-4 bg-secondary rounded-lg border border-border">
                        <p className="text-sm text-muted-foreground mb-2">
                          <strong className="text-foreground">Mitigation Strategy:</strong>
                        </p>
                        <p className="text-sm text-foreground">{risk.mitigation}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">No significant risks identified for this recommendation.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
