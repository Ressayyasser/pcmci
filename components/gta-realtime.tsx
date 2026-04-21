'use client'

import React, { useState, useEffect } from 'react'
import { Activity, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react'

interface GTARealtimeData {
  id: number
  name: string
  status: 'normal' | 'warning' | 'critical'
  // Source HP
  sourceHP_debit: number
  sourceHP_pression: number
  sourceHP_temperature: number
  // Turbine
  turbine_speed: number
  turbine_power: number
  turbine_efficiency: number
  turbine_vibration: number
  // Alternator
  alternator_output: number
  alternator_voltage: number
  alternator_frequency: number
  alternator_cosFi: number
  // Condenser
  condenser_pressure: number
  condenser_temperature: number
  condenser_flow: number
  // Network
  network_tension: number
  network_courant: number
  network_puissance: number
  // Timestamps
  lastUpdate: number
}

interface RealtimeUpdate {
  timestamp: number
  value: number
}

const generateRealtimeValue = (base: number, variance: number, trend: number): number => {
  const randomChange = (Math.random() - 0.5) * variance
  const trendChange = Math.sin(Date.now() / 5000) * trend
  return Math.max(0, base + randomChange + trendChange)
}

export function GTARealtimeComponent() {
  const [selectedGTA, setSelectedGTA] = useState<number>(1)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [gtaDataList, setGtaDataList] = useState<GTARealtimeData[]>([])
  const [componentHistory, setComponentHistory] = useState<Map<string, RealtimeUpdate[]>>(new Map())

  // Initialize and update real-time data
  useEffect(() => {
    const initializeData = (): GTARealtimeData[] => {
      return [
        {
          id: 1,
          name: 'GTA 1',
          status: 'normal',
          sourceHP_debit: 58.5,
          sourceHP_pression: 82.3,
          sourceHP_temperature: 553.2,
          turbine_speed: 2998,
          turbine_power: 142.5,
          turbine_efficiency: 86.8,
          turbine_vibration: 2.1,
          alternator_output: 163.2,
          alternator_voltage: 15.68,
          alternator_frequency: 50.02,
          alternator_cosFi: 0.94,
          condenser_pressure: 0.085,
          condenser_temperature: 43.2,
          condenser_flow: 287.3,
          network_tension: 23.05,
          network_courant: 12.3,
          network_puissance: 24.5,
          lastUpdate: Date.now(),
        },
        {
          id: 2,
          name: 'GTA 2',
          status: 'normal',
          sourceHP_debit: 59.2,
          sourceHP_pression: 83.5,
          sourceHP_temperature: 556.1,
          turbine_speed: 3001,
          turbine_power: 145.8,
          turbine_efficiency: 87.5,
          turbine_vibration: 2.4,
          alternator_output: 166.5,
          alternator_voltage: 15.82,
          alternator_frequency: 49.98,
          alternator_cosFi: 0.96,
          condenser_pressure: 0.082,
          condenser_temperature: 41.5,
          condenser_flow: 291.2,
          network_tension: 23.15,
          network_courant: 12.6,
          network_puissance: 25.2,
          lastUpdate: Date.now(),
        },
        {
          id: 3,
          name: 'GTA 3',
          status: 'normal',
          sourceHP_debit: 59.8,
          sourceHP_pression: 84.1,
          sourceHP_temperature: 557.5,
          turbine_speed: 3002,
          turbine_power: 146.2,
          turbine_efficiency: 87.9,
          turbine_vibration: 2.2,
          alternator_output: 167.3,
          alternator_voltage: 15.75,
          alternator_frequency: 50.0,
          alternator_cosFi: 0.95,
          condenser_pressure: 0.08,
          condenser_temperature: 42.5,
          condenser_flow: 289.5,
          network_tension: 23.1,
          network_courant: 12.5,
          network_puissance: 24.8,
          lastUpdate: Date.now(),
        },
      ]
    }

    setGtaDataList(initializeData())
  }, [])

  // Real-time data update simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setGtaDataList((prevData) =>
        prevData.map((gta) => ({
          ...gta,
          sourceHP_debit: generateRealtimeValue(gta.sourceHP_debit, 0.5, 0.2),
          sourceHP_pression: generateRealtimeValue(gta.sourceHP_pression, 0.3, 0.15),
          sourceHP_temperature: generateRealtimeValue(gta.sourceHP_temperature, 1.0, 0.5),
          turbine_speed: generateRealtimeValue(gta.turbine_speed, 2, 1),
          turbine_power: generateRealtimeValue(gta.turbine_power, 1.5, 0.8),
          turbine_efficiency: Math.min(100, generateRealtimeValue(gta.turbine_efficiency, 0.5, 0.2)),
          turbine_vibration: generateRealtimeValue(gta.turbine_vibration, 0.3, 0.1),
          alternator_output: generateRealtimeValue(gta.alternator_output, 1.2, 0.6),
          alternator_voltage: generateRealtimeValue(gta.alternator_voltage, 0.1, 0.05),
          alternator_frequency: generateRealtimeValue(gta.alternator_frequency, 0.05, 0.02),
          alternator_cosFi: Math.min(1, generateRealtimeValue(gta.alternator_cosFi, 0.01, 0.005)),
          condenser_pressure: generateRealtimeValue(gta.condenser_pressure, 0.01, 0.005),
          condenser_temperature: generateRealtimeValue(gta.condenser_temperature, 0.8, 0.3),
          condenser_flow: generateRealtimeValue(gta.condenser_flow, 2, 1),
          network_tension: generateRealtimeValue(gta.network_tension, 0.2, 0.1),
          network_courant: generateRealtimeValue(gta.network_courant, 0.3, 0.15),
          network_puissance: generateRealtimeValue(gta.network_puissance, 0.5, 0.2),
          lastUpdate: Date.now(),
        }))
      )
    }, 1500) // Update every 1.5 seconds

    return () => clearInterval(interval)
  }, [])

  const currentGTA = gtaDataList.find((gta) => gta.id === selectedGTA)
  if (!currentGTA) return null

  const ParameterBox = ({
    label,
    value,
    unit,
    min,
    max,
    isWarning,
  }: {
    label: string
    value: number
    unit: string
    min: number
    max: number
    isWarning?: boolean
  }) => {
    const percentage = ((value - min) / (max - min)) * 100
    const isHigh = value > (min + max) / 2
    const isLow = value < (min + max) / 2
    const isNormal = !isHigh && !isLow

    return (
      <div
        onClick={() => setSelectedComponent(label)}
        className="p-3 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground group-hover:text-primary transition-colors">
            {label}
          </p>
          {isHigh && <TrendingUp className="w-3 h-3 text-yellow-400" />}
          {isLow && <TrendingDown className="w-3 h-3 text-cyan-400" />}
        </div>
        <div className="flex items-baseline gap-1">
          <p className={`text-lg font-bold ${isWarning ? 'text-red-400' : 'text-cyan-400'}`}>
            {value.toFixed(1)}
          </p>
          <p className="text-xs text-muted-foreground">{unit}</p>
        </div>
        <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all rounded-full ${
              isWarning ? 'bg-red-500' : isHigh ? 'bg-yellow-500' : isLow ? 'bg-cyan-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
          />
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, unit, color }: { title: string; value: number; unit: string; color: string }) => (
    <div className="p-4 rounded-lg border border-border bg-secondary/50">
      <p className="text-xs text-muted-foreground mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className={`text-2xl font-bold ${color}`}>{value.toFixed(1)}</p>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </div>
    </div>
  )

  return (
    <div className="w-full space-y-6 bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-border">
      {/* Header with GTA Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">GTA Platform</h2>
          <p className="text-muted-foreground text-sm">Surveillance en Temps Réel</p>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((gta) => (
            <button
              key={gta}
              onClick={() => setSelectedGTA(gta)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedGTA === gta
                  ? 'bg-accent text-background border border-accent'
                  : 'border border-border bg-secondary hover:border-accent hover:text-accent'
              }`}
            >
              GTA {gta}
            </button>
          ))}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500 w-fit">
        <Activity className="w-5 h-5 text-green-400 animate-pulse" />
        <span className="font-semibold text-green-400">En ligne - Mis à jour il y a {Math.round((Date.now() - currentGTA.lastUpdate) / 1000)}s</span>
      </div>

      {/* Main Schematic SVG */}
      <div className="rounded-lg border border-border bg-slate-950/50 p-4 overflow-x-auto">
        <svg width="100%" height="400" viewBox="0 0 1200 400" className="min-w-full">
          {/* Background */}
          <rect width="1200" height="400" fill="none" />

          {/* Connection Lines */}
          <g stroke="#1e293b" strokeWidth="2" fill="none" strokeDasharray="5,5">
            <path d="M 150 150 L 280 150" />
            <path d="M 380 150 L 510 150" />
            <path d="M 610 150 L 740 150" />
            <path d="M 510 250 L 510 300" />
          </g>

          {/* SOURCE HP Box */}
          <g onClick={() => setSelectedComponent('Source HP')}>
            <rect
              x="30"
              y="80"
              width="120"
              height="140"
              fill="#fb923c"
              fillOpacity="0.1"
              stroke="#fb923c"
              strokeWidth="2"
              rx="8"
              className="cursor-pointer hover:fill-opacity-20 transition-all"
            />
            <text x="50" y="110" fill="#fb923c" fontSize="13" fontWeight="bold">
              SOURCE HP
            </text>
            <circle cx="90" cy="155" r="25" fill="none" stroke="#fb923c" strokeWidth="2" />
            <text x="90" y="160" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="bold">
              {currentGTA.sourceHP_debit.toFixed(1)}
            </text>
            <text x="90" y="175" textAnchor="middle" fill="#a3a3a3" fontSize="9">
              t/h
            </text>
          </g>

          {/* TURBINE Box */}
          <g onClick={() => setSelectedComponent('Turbine')}>
            <rect
              x="280"
              y="80"
              width="230"
              height="140"
              fill="#3b82f6"
              fillOpacity="0.1"
              stroke="#3b82f6"
              strokeWidth="2"
              rx="8"
              className="cursor-pointer hover:fill-opacity-20 transition-all"
            />
            <text x="300" y="110" fill="#3b82f6" fontSize="13" fontWeight="bold">
              TURBINE À VAPEUR
            </text>
            {/* Three stages */}
            <circle cx="330" cy="155" r="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx="395" cy="155" r="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <circle cx="460" cy="155" r="20" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
            <text x="395" y="190" textAnchor="middle" fill="#00d9ff" fontSize="10" fontWeight="bold">
              {currentGTA.turbine_power.toFixed(1)} MW
            </text>
            <text x="395" y="205" textAnchor="middle" fill="#a3a3a3" fontSize="9">
              {currentGTA.turbine_speed.toFixed(0)} rpm
            </text>
          </g>

          {/* ALTERNATEUR Box */}
          <g onClick={() => setSelectedComponent('Alternateur')}>
            <rect
              x="610"
              y="80"
              width="130"
              height="140"
              fill="#10b981"
              fillOpacity="0.1"
              stroke="#10b981"
              strokeWidth="2"
              rx="8"
              className="cursor-pointer hover:fill-opacity-20 transition-all"
            />
            <text x="630" y="110" fill="#10b981" fontSize="13" fontWeight="bold">
              ALTERNATEUR
            </text>
            <circle cx="675" cy="155" r="30" fill="none" stroke="#10b981" strokeWidth="2" />
            <circle cx="675" cy="155" r="15" fill="#10b981" fillOpacity="0.3" />
            <text x="675" y="190" textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
              {currentGTA.alternator_output.toFixed(1)} MW
            </text>
            <text x="675" y="205" textAnchor="middle" fill="#a3a3a3" fontSize="9">
              {currentGTA.alternator_voltage.toFixed(2)} kV
            </text>
          </g>

          {/* CONDENSEUR Box */}
          <g onClick={() => setSelectedComponent('Condenseur')}>
            <rect
              x="440"
              y="300"
              width="140"
              height="80"
              fill="#06b6d4"
              fillOpacity="0.1"
              stroke="#06b6d4"
              strokeWidth="2"
              rx="8"
              className="cursor-pointer hover:fill-opacity-20 transition-all"
            />
            <text x="460" y="325" fill="#06b6d4" fontSize="12" fontWeight="bold">
              CONDENSEUR
            </text>
            <text x="460" y="345" fill="#a3a3a3" fontSize="9">
              {currentGTA.condenser_temperature.toFixed(1)}°C
            </text>
            <text x="460" y="360" fill="#a3a3a3" fontSize="9">
              {currentGTA.condenser_flow.toFixed(0)} t/h
            </text>
          </g>

          {/* NETWORK Box */}
          <g onClick={() => setSelectedComponent('Network')}>
            <rect
              x="800"
              y="80"
              width="140"
              height="140"
              fill="#14b8a6"
              fillOpacity="0.1"
              stroke="#14b8a6"
              strokeWidth="2"
              rx="8"
              className="cursor-pointer hover:fill-opacity-20 transition-all"
            />
            <text x="820" y="110" fill="#14b8a6" fontSize="13" fontWeight="bold">
              RÉSEAU NT
            </text>
            <text x="820" y="135" fill="#a3a3a3" fontSize="9">
              Tension: {currentGTA.network_tension.toFixed(1)} kV
            </text>
            <text x="820" y="150" fill="#a3a3a3" fontSize="9">
              Courant: {currentGTA.network_courant.toFixed(1)} A
            </text>
            <text x="820" y="165" fill="#a3a3a3" fontSize="9">
              Puissance: {currentGTA.network_puissance.toFixed(1)} MW
            </text>
            <text x="820" y="180" fill="#a3a3a3" fontSize="9">
              Fréq: {currentGTA.alternator_frequency.toFixed(2)} Hz
            </text>
            <text x="820" y="195" fill="#a3a3a3" fontSize="9">
              Cos φ: {currentGTA.alternator_cosFi.toFixed(3)}
            </text>
          </g>

          {/* Power Flow Arrow */}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="#00d9ff" />
            </marker>
          </defs>
          <path d="M 510 150 L 610 150" stroke="#00d9ff" strokeWidth="2.5" markerEnd="url(#arrowhead)" />
          <path d="M 740 150 L 800 150" stroke="#00d9ff" strokeWidth="2.5" markerEnd="url(#arrowhead)" />
        </svg>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Puissance Turbine"
          value={currentGTA.turbine_power}
          unit="MW"
          color="text-blue-400"
        />
        <StatCard
          title="Puissance Alternateur"
          value={currentGTA.alternator_output}
          unit="MW"
          color="text-green-400"
        />
        <StatCard
          title="Rendement"
          value={currentGTA.turbine_efficiency}
          unit="%"
          color="text-cyan-400"
        />
        <StatCard
          title="Vibration"
          value={currentGTA.turbine_vibration}
          unit="mm/s"
          color={currentGTA.turbine_vibration > 3 ? 'text-red-400' : 'text-green-400'}
        />
      </div>

      {/* Detailed Parameters Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground">Paramètres Détaillés</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <ParameterBox
            label="Débit HP"
            value={currentGTA.sourceHP_debit}
            unit="t/h"
            min={57}
            max={61}
          />
          <ParameterBox
            label="Pression HP"
            value={currentGTA.sourceHP_pression}
            unit="bar"
            min={80}
            max={86}
          />
          <ParameterBox
            label="Température HP"
            value={currentGTA.sourceHP_temperature}
            unit="°C"
            min={550}
            max={560}
          />
          <ParameterBox
            label="Vitesse Turbine"
            value={currentGTA.turbine_speed}
            unit="rpm"
            min={2995}
            max={3005}
          />
          <ParameterBox
            label="Temp Condenseur"
            value={currentGTA.condenser_temperature}
            unit="°C"
            min={38}
            max={45}
          />
          <ParameterBox
            label="Pression Condenseur"
            value={currentGTA.condenser_pressure * 1000}
            unit="mbar"
            min={75}
            max={95}
          />
          <ParameterBox
            label="Tension Alternateur"
            value={currentGTA.alternator_voltage}
            unit="kV"
            min={15.5}
            max={15.9}
          />
          <ParameterBox
            label="Fréquence"
            value={currentGTA.alternator_frequency}
            unit="Hz"
            min={49.9}
            max={50.1}
          />
        </div>
      </div>

      {/* Selected Component Info */}
      {selectedComponent && (
        <div className="p-4 rounded-lg border border-accent bg-accent/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-accent">Composant sélectionné</h3>
            <button
              onClick={() => setSelectedComponent(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fermer
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            {selectedComponent} - Cliquez sur d'autres composants pour voir leurs détails
          </p>
        </div>
      )}
    </div>
  )
}
