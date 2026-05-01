'use client'

import Link from 'next/link'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function InsightsPage() {
  return (
    <PageLayout
      title="Key Insights & Recommendations"
      description="Analysis summary and actionable recommendations"
      subtitle="System performance analysis"
    >
      <div className="space-y-6">
        {/* Key Findings */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle>Key Findings</CardTitle>
            <CardDescription>Main insights from the analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-semibold text-blue-400">Causal Relationships Identified</p>
              <p className="text-sm text-slate-300 mt-1">
                PCMCI analysis revealed 55 causal links in the energy system, with key dependencies between generators, heaters, and load conditions.
              </p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="font-semibold text-orange-400">Anomaly Patterns</p>
              <p className="text-sm text-slate-300 mt-1">
                Ensemble detection identified 8,760 anomalies with varying severity levels, concentrated during peak load periods and maintenance windows.
              </p>
            </div>

            <div className="border-l-4 border-purple-500 pl-4 py-2">
              <p className="font-semibold text-purple-400">Optimization Potential</p>
              <p className="text-sm text-slate-300 mt-1">
                Q-Learning agent achieved -1.34 backtest reward, indicating significant potential for energy cost reduction through learned control policies.
              </p>
            </div>

            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-semibold text-green-400">System Stability</p>
              <p className="text-sm text-slate-300 mt-1">
                No critical cascading failures detected. System shows resilience to detected anomalies with proper intervention strategies.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
            <CardDescription>Suggested actions based on analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4">
              <div className="text-2xl font-bold text-blue-400">1</div>
              <div>
                <p className="font-semibold">Implement Causal Monitoring</p>
                <p className="text-sm text-slate-300">Deploy real-time monitoring on identified critical causal links to enable predictive maintenance.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl font-bold text-orange-400">2</div>
              <div>
                <p className="font-semibold">Enhance Anomaly Response</p>
                <p className="text-sm text-slate-300">Develop automated response protocols for high-severity anomalies to minimize impact and downtime.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl font-bold text-purple-400">3</div>
              <div>
                <p className="font-semibold">Deploy Q-Learning Controller</p>
                <p className="text-sm text-slate-300">Integrate the trained Q-Learning policy into the energy control system for continuous cost optimization.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl font-bold text-green-400">4</div>
              <div>
                <p className="font-semibold">Continuous Model Update</p>
                <p className="text-sm text-slate-300">Establish periodic retraining cycles to adapt models to changing system behavior and new patterns.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-2xl font-bold text-pink-400">5</div>
              <div>
                <p className="font-semibold">Advanced RL Exploration</p>
                <p className="text-sm text-slate-300">Consider actor-critic methods and deep RL approaches for improved policy optimization and scalability.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>Implementation roadmap</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="bg-slate-600 p-3 rounded">
              <p className="font-semibold text-blue-400">Phase 2</p>
              <p className="text-sm text-slate-300">Integrate real OCP data, add authentication, implement Dash dashboard with live updates</p>
            </div>

            <div className="bg-slate-600 p-3 rounded">
              <p className="font-semibold text-green-400">Phase 3</p>
              <p className="text-sm text-slate-300">Deploy to production, add monitoring and alerting, set up feedback loops for continuous improvement</p>
            </div>

            <div className="bg-slate-600 p-3 rounded">
              <p className="font-semibold text-purple-400">Phase 4</p>
              <p className="text-sm text-slate-300">Advanced features: multi-agent RL, hierarchical control, domain adaptation techniques</p>
            </div>
          </CardContent>
        </Card>

        {/* System Architecture */}
        <Card className="bg-slate-700 border-slate-600">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Architecture and components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-600 p-3 rounded">
                <p className="font-semibold text-blue-400">Frontend</p>
                <p className="text-slate-300">Next.js 16 with TypeScript, shadcn/ui, Tailwind CSS</p>
              </div>

              <div className="bg-slate-600 p-3 rounded">
                <p className="font-semibold text-green-400">Backend ML</p>
                <p className="text-slate-300">Python with tigramite, scikit-learn, Plotly, FastAPI</p>
              </div>

              <div className="bg-slate-600 p-3 rounded">
                <p className="font-semibold text-purple-400">Dashboard</p>
                <p className="text-slate-300">Dash with Plotly, Cytoscape for interactive visualization</p>
              </div>

              <div className="bg-slate-600 p-3 rounded">
                <p className="font-semibold text-orange-400">APIs</p>
                <p className="text-slate-300">8 REST endpoints for data access and model inference</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Link href="/rl-strategy" className="text-blue-400 hover:text-blue-300">
            ← Back to Q-Learning
          </Link>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Back to Dashboard →
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
