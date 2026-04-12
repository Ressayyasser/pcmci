'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, Zap } from 'lucide-react'

interface GTAState {
  turbineTemp: number
  turbinePressure: number
  steamFlow: number
  condenserTemp: number
  excitationVoltage: number
  reactiveVoltage: number
  cosinusValue: number
  alternatorPower: number
  vibrationType3: number
  usureB3: number
}

interface ComponentData {
  id: string
  label: string
  value: string | number
  unit: string
  normal: [number, number]
  warning: [number, number]
  critical: [number, number]
  type: 'temp' | 'pressure' | 'flow' | 'voltage' | 'power'
}

interface GTADiagramProps {
  gtaNumber: number
  state?: Partial<GTAState>
  onComponentClick?: (componentId: string) => void
}

export function GTADiagram({ gtaNumber = 3, state = {}, onComponentClick }: GTADiagramProps) {
  const defaultState: GTAState = {
    turbineTemp: 55.7,
    turbinePressure: 55.7,
    steamFlow: 16.3,
    condenserTemp: 20.6,
    excitationVoltage: 0.1,
    reactiveVoltage: 0.1,
    cosinusValue: 0.72,
    alternatorPower: 0.1,
    vibrationType3: 0.4,
    usureB3: 0.0,
  }

  const currentState = { ...defaultState, ...state }

  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  const getStatusColor = (value: number, normal: [number, number], warning: [number, number], critical: [number, number]) => {
    if (value >= critical[0] && value <= critical[1]) return '#ff4444'
    if (value >= warning[0] && value <= warning[1]) return '#ffaa00'
    if (value >= normal[0] && value <= normal[1]) return '#00e5cc'
    return '#7c5cff'
  }

  const components: ComponentData[] = [
    {
      id: '20TE171C',
      label: 'Entrée HP',
      value: currentState.turbineTemp,
      unit: '°C',
      normal: [50, 60],
      warning: [45, 65],
      critical: [40, 70],
      type: 'temp',
    },
    {
      id: '20FT402C',
      label: 'Débit Vapeur',
      value: currentState.steamFlow,
      unit: 't/h',
      normal: [15, 17],
      warning: [14, 18],
      critical: [13, 19],
      type: 'flow',
    },
    {
      id: '20ET172C',
      label: 'Turbine Désarmée',
      value: 39.4,
      unit: '°C',
      normal: [35, 45],
      warning: [30, 50],
      critical: [25, 55],
      type: 'temp',
    },
    {
      id: '20PS107C',
      label: 'Pression Vapeur',
      value: 55.7,
      unit: 'bar',
      normal: [50, 60],
      warning: [45, 65],
      critical: [40, 70],
      type: 'pressure',
    },
    {
      id: 'Alternateur3',
      label: 'Alternateur 3',
      value: currentState.alternatorPower,
      unit: 'MW',
      normal: [0.08, 0.12],
      warning: [0.05, 0.15],
      critical: [0, 0.2],
      type: 'power',
    },
    {
      id: 'VIB1-TV3',
      label: 'Vibration TV3',
      value: currentState.vibrationType3,
      unit: 'μm',
      normal: [0.2, 0.5],
      warning: [0.15, 0.6],
      critical: [0.1, 0.8],
      type: 'flow',
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-primary">GTA{gtaNumber} - Schéma Technique Interactive</CardTitle>
            <CardDescription>Cliquez sur les composants pour voir les détails en temps réel</CardDescription>
          </div>
          <div className="text-right text-sm">
            <p className="text-muted-foreground">Alternateur {gtaNumber}</p>
            <p className="text-accent font-bold">
              {currentState.alternatorPower.toFixed(2)} MW
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* SVG Diagram */}
        <div className="w-full bg-secondary rounded-lg p-4 overflow-x-auto border border-border">
          <svg viewBox="0 0 1200 700" className="w-full min-w-full" preserveAspectRatio="xMidYMid meet">
            {/* Background */}
            <rect width="1200" height="700" fill="rgb(26, 31, 58)" />

            {/* HP Steam Inlet (Left) */}
            <rect x="50" y="150" width="80" height="150" fill="none" stroke="#00d9ff" strokeWidth="2" rx="5" />
            <text x="90" y="240" textAnchor="middle" fill="#00d9ff" fontSize="14" fontWeight="bold">
              Vapeur HP
            </text>
            <circle
              cx="90"
              cy="150"
              r="20"
              fill={getStatusColor(currentState.turbineTemp, [50, 60], [45, 65], [40, 70])}
              stroke="#fff"
              strokeWidth="2"
              opacity="0.8"
              className="cursor-pointer hover:opacity-100"
              onClick={() => {
                setSelectedComponent('20TE171C')
                onComponentClick?.('20TE171C')
              }}
            />
            <text x="90" y="155" textAnchor="middle" fill="#000" fontSize="12" fontWeight="bold">
              {currentState.turbineTemp.toFixed(1)}°C
            </text>

            {/* Main Turbine (Center) */}
            <ellipse cx="600" cy="350" rx="180" ry="120" fill="rgb(100, 100, 150)" stroke="#7c5cff" strokeWidth="3" />
            <text x="600" y="330" textAnchor="middle" fill="#fff" fontSize="16" fontWeight="bold">
              TURBINE DÉSARMÉE
            </text>
            <text x="600" y="360" textAnchor="middle" fill="#fff" fontSize="14">
              GTA{gtaNumber}
            </text>
            <text
              x="600"
              y="390"
              textAnchor="middle"
              fill={getStatusColor(currentState.turbinePressure, [50, 60], [45, 65], [40, 70])}
              fontSize="12"
              fontWeight="bold"
            >
              {currentState.turbinePressure.toFixed(1)} bar
            </text>

            {/* Condenser (Bottom Center) */}
            <rect x="520" y="520" width="160" height="100" fill="none" stroke="#00e5cc" strokeWidth="2" rx="5" />
            <text x="600" y="545" textAnchor="middle" fill="#00e5cc" fontSize="13" fontWeight="bold">
              CONDENSEUR PRINCIPAL
            </text>
            <text x="600" y="565" textAnchor="middle" fill="#00e5cc" fontSize="11">
              1004,0 mbar
            </text>
            <circle
              cx="600"
              cy="600"
              r="18"
              fill={getStatusColor(currentState.condenserTemp, [15, 25], [10, 30], [5, 35])}
              stroke="#fff"
              strokeWidth="2"
              opacity="0.8"
              className="cursor-pointer hover:opacity-100"
              onClick={() => {
                setSelectedComponent('Condenseur')
                onComponentClick?.('Condenseur')
              }}
            />
            <text x="600" y="605" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
              {currentState.condenserTemp.toFixed(1)}°C
            </text>

            {/* Alternator (Right) */}
            <rect x="850" y="200" width="200" height="250" fill="rgb(25, 35, 80)" stroke="#00d9ff" strokeWidth="3" rx="10" />
            <text x="950" y="250" textAnchor="middle" fill="#00d9ff" fontSize="16" fontWeight="bold">
              ALTERNATEUR 3
            </text>

            {/* Excitation System */}
            <rect x="880" y="280" width="140" height="80" fill="rgb(0, 50, 100)" stroke="#ffaa00" strokeWidth="2" rx="5" />
            <text x="950" y="305" textAnchor="middle" fill="#ffaa00" fontSize="12" fontWeight="bold">
              EXCITATION
            </text>
            <circle cx="920" cy="330" r="12" fill="rgb(255, 200, 0)" />
            <circle cx="950" cy="330" r="12" fill="rgb(255, 200, 0)" />
            <circle cx="980" cy="330" r="12" fill="rgb(255, 200, 0)" />

            {/* Power Output */}
            <circle
              cx="950"
              cy="400"
              r="30"
              fill={getStatusColor(currentState.alternatorPower, [0.08, 0.12], [0.05, 0.15], [0, 0.2])}
              stroke="#fff"
              strokeWidth="3"
              opacity="0.9"
              className="cursor-pointer hover:opacity-100"
              onClick={() => {
                setSelectedComponent('Alternateur3')
                onComponentClick?.('Alternateur3')
              }}
            />
            <text x="950" y="395" textAnchor="middle" fill="#000" fontSize="11" fontWeight="bold">
              {currentState.alternatorPower.toFixed(2)}
            </text>
            <text x="950" y="410" textAnchor="middle" fill="#000" fontSize="10">
              MW
            </text>

            {/* Steam flow arrow */}
            <path
              d="M 130 225 Q 300 250 420 300"
              fill="none"
              stroke="#00d9ff"
              strokeWidth="3"
              markerEnd="url(#arrowhead)"
            />
            <circle
              cx="270"
              cy="235"
              r="16"
              fill={getStatusColor(currentState.steamFlow, [15, 17], [14, 18], [13, 19])}
              stroke="#fff"
              strokeWidth="2"
              opacity="0.8"
              className="cursor-pointer hover:opacity-100"
              onClick={() => {
                setSelectedComponent('20FT402C')
                onComponentClick?.('20FT402C')
              }}
            />
            <text x="270" y="239" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">
              {currentState.steamFlow.toFixed(1)}t/h
            </text>

            {/* Exhaust steam */}
            <path d="M 780 350 L 850 350" stroke="#ff6666" strokeWidth="3" />
            <text x="815" y="335" textAnchor="middle" fill="#ff6666" fontSize="11" fontWeight="bold">
              Vapeur MP
            </text>

            {/* Condenser cooling */}
            <path d="M 600 620 L 600 680" stroke="#00e5cc" strokeWidth="2" />
            <text x="630" y="650" fill="#00e5cc" fontSize="11">
              Refroidissement
            </text>

            {/* Vibration indicator */}
            <circle
              cx="300"
              cy="500"
              r="20"
              fill={getStatusColor(currentState.vibrationType3, [0.2, 0.5], [0.15, 0.6], [0.1, 0.8])}
              stroke="#fff"
              strokeWidth="2"
              opacity="0.8"
              className="cursor-pointer hover:opacity-100"
              onClick={() => {
                setSelectedComponent('VIB1-TV3')
                onComponentClick?.('VIB1-TV3')
              }}
            />
            <text x="300" y="505" textAnchor="middle" fill="#000" fontSize="10" fontWeight="bold">
              VIB: {currentState.vibrationType3.toFixed(1)}
            </text>

            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#00d9ff" />
              </marker>
            </defs>
          </svg>
        </div>

        {/* Component Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {components.map((comp) => {
            const statusColor = getStatusColor(
              typeof comp.value === 'number' ? comp.value : 0,
              comp.normal,
              comp.warning,
              comp.critical
            )
            const isSelected = selectedComponent === comp.id

            return (
              <div
                key={comp.id}
                onClick={() => {
                  setSelectedComponent(comp.id)
                  onComponentClick?.(comp.id)
                }}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  isSelected ? 'border-accent bg-accent/10' : 'border-border bg-secondary hover:border-primary'
                }`}
              >
                <p className="text-xs text-muted-foreground font-mono mb-1">{comp.id}</p>
                <p className="text-sm font-semibold text-foreground mb-2">{comp.label}</p>
                <div className="flex items-baseline gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor }}
                  ></div>
                  <p className="text-lg font-bold" style={{ color: statusColor }}>
                    {typeof comp.value === 'number' ? comp.value.toFixed(2) : comp.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{comp.unit}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-4 gap-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-cyan-500"></div>
            <span className="text-xs text-muted-foreground">Normal</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-muted-foreground">Attention</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-xs text-muted-foreground">Critique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-purple-500"></div>
            <span className="text-xs text-muted-foreground">Hors limites</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
