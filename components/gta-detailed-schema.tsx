'use client'

import React, { useState, useEffect } from 'react'
import { Activity, AlertCircle } from 'lucide-react'

interface GTASchemaData {
  gta: number
  // Source HP
  sourceHP: { debit: number; pression: number; temp: number }
  // Source MP
  sourceMP: { debit: number; pression: number; temp: number }
  // Turbine stages
  turbineStages: { hp: number; mp: number; bp: number }
  turbineMain: { speed: number; power: number; efficiency: number; vibration: number }
  // Alternator
  alternateur: { puissance: number; tension: number; freq: number; cosFi: number }
  // Redreseur
  redreseur: { tension: number; excitation: number; thd: number }
  // Condenser
  condenseur: { pression: number; temp: number; debit: number }
  // Network
  reseauNT: { tension: number; courant: number; puissance: number; freq: number }
  // Status
  status: 'NORMAL' | 'WARNING' | 'CRITICAL'
  lastUpdate: number
}

const generateRealtimeValue = (base: number, variance: number): number => {
  const randomChange = (Math.random() - 0.5) * variance
  const trendChange = Math.sin(Date.now() / 5000) * variance * 0.3
  return Math.max(0, base + randomChange + trendChange)
}

export function GTADetailedSchema() {
  const [selectedGTA, setSelectedGTA] = useState<number>(1)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [gtaData, setGtaData] = useState<GTASchemaData | null>(null)

  // Initialize with synthetic data
  useEffect(() => {
    const baselines: Record<number, Partial<GTASchemaData>> = {
      1: {
        sourceHP: { debit: 58.5, pression: 82.3, temp: 553.2 },
        sourceMP: { debit: 8.3, pression: 13.5, temp: 310.2 },
        turbineStages: { hp: 15.2, mp: 8.1, bp: 3.5 },
        turbineMain: { speed: 2998, power: 142.5, efficiency: 86.8, vibration: 2.1 },
        alternateur: { puissance: 163.2, tension: 15.68, freq: 50.02, cosFi: 0.94 },
        redreseur: { tension: 15.2, excitation: 4.1, thd: 2.1 },
        condenseur: { pression: 0.085, temp: 43.2, debit: 287.3 },
        reseauNT: { tension: 23.05, courant: 12.3, puissance: 24.5, freq: 50.0 },
        status: 'NORMAL' as const,
      },
      2: {
        sourceHP: { debit: 59.2, pression: 83.5, temp: 556.1 },
        sourceMP: { debit: 8.7, pression: 14.2, temp: 312.5 },
        turbineStages: { hp: 15.5, mp: 8.3, bp: 3.8 },
        turbineMain: { speed: 3001, power: 145.8, efficiency: 87.5, vibration: 2.4 },
        alternateur: { puissance: 166.5, tension: 15.82, freq: 49.98, cosFi: 0.96 },
        redreseur: { tension: 15.4, excitation: 4.3, thd: 2.0 },
        condenseur: { pression: 0.082, temp: 41.5, debit: 291.2 },
        reseauNT: { tension: 23.15, courant: 12.6, puissance: 25.2, freq: 50.0 },
        status: 'NORMAL' as const,
      },
      3: {
        sourceHP: { debit: 59.8, pression: 84.1, temp: 555.4 },
        sourceMP: { debit: 8.5, pression: 13.8, temp: 311.8 },
        turbineStages: { hp: 15.4, mp: 8.2, bp: 3.6 },
        turbineMain: { speed: 3000, power: 144.2, efficiency: 87.2, vibration: 2.2 },
        alternateur: { puissance: 165.3, tension: 15.75, freq: 50.01, cosFi: 0.95 },
        redreseur: { tension: 15.3, excitation: 4.2, thd: 2.05 },
        condenseur: { pression: 0.084, temp: 42.5, debit: 289.5 },
        reseauNT: { tension: 23.1, courant: 12.5, puissance: 24.8, freq: 50.0 },
        status: 'NORMAL' as const,
      },
    }

    const updateData = () => {
      const baseline = baselines[selectedGTA]
      if (!baseline) return

      const updated: GTASchemaData = {
        gta: selectedGTA,
        sourceHP: {
          debit: generateRealtimeValue(baseline.sourceHP!.debit, 1.5),
          pression: generateRealtimeValue(baseline.sourceHP!.pression, 1.2),
          temp: generateRealtimeValue(baseline.sourceHP!.temp, 2),
        },
        sourceMP: {
          debit: generateRealtimeValue(baseline.sourceMP!.debit, 0.5),
          pression: generateRealtimeValue(baseline.sourceMP!.pression, 0.8),
          temp: generateRealtimeValue(baseline.sourceMP!.temp, 1.5),
        },
        turbineStages: {
          hp: generateRealtimeValue(baseline.turbineStages!.hp, 0.8),
          mp: generateRealtimeValue(baseline.turbineStages!.mp, 0.5),
          bp: generateRealtimeValue(baseline.turbineStages!.bp, 0.3),
        },
        turbineMain: {
          speed: generateRealtimeValue(baseline.turbineMain!.speed, 4),
          power: generateRealtimeValue(baseline.turbineMain!.power, 3),
          efficiency: generateRealtimeValue(baseline.turbineMain!.efficiency, 0.8),
          vibration: generateRealtimeValue(baseline.turbineMain!.vibration, 0.3),
        },
        alternateur: {
          puissance: generateRealtimeValue(baseline.alternateur!.puissance, 2),
          tension: generateRealtimeValue(baseline.alternateur!.tension, 0.1),
          freq: generateRealtimeValue(baseline.alternateur!.freq, 0.05),
          cosFi: generateRealtimeValue(baseline.alternateur!.cosFi, 0.02),
        },
        redreseur: {
          tension: generateRealtimeValue(baseline.redreseur!.tension, 0.15),
          excitation: generateRealtimeValue(baseline.redreseur!.excitation, 0.2),
          thd: generateRealtimeValue(baseline.redreseur!.thd, 0.15),
        },
        condenseur: {
          pression: generateRealtimeValue(baseline.condenseur!.pression, 0.005),
          temp: generateRealtimeValue(baseline.condenseur!.temp, 1.5),
          debit: generateRealtimeValue(baseline.condenseur!.debit, 2),
        },
        reseauNT: {
          tension: generateRealtimeValue(baseline.reseauNT!.tension, 0.5),
          courant: generateRealtimeValue(baseline.reseauNT!.courant, 0.5),
          puissance: generateRealtimeValue(baseline.reseauNT!.puissance, 0.5),
          freq: generateRealtimeValue(baseline.reseauNT!.freq, 0.02),
        },
        status: 'NORMAL' as const,
        lastUpdate: Date.now(),
      }

      setGtaData(updated)
    }

    updateData()
    const interval = setInterval(updateData, 1500)
    return () => clearInterval(interval)
  }, [selectedGTA])

  if (!gtaData) return null

  const ParameterBox = ({ label, value, unit, status = 'normal' }: any) => {
    const statusColor =
      status === 'critical' ? '#ff4444' : status === 'warning' ? '#ffaa00' : '#00e5cc'
    return (
      <div className="text-center text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p style={{ color: statusColor }} className="font-bold text-sm">
          {typeof value === 'number' ? value.toFixed(1) : value}
        </p>
        <p className="text-gray-500 text-xs">{unit}</p>
      </div>
    )
  }

  return (
    <div className="w-full bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-slate-800 space-y-6">
      {/* Header with GTA Selection */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">GTA Platform</h2>
          <p className="text-gray-400 text-sm">Contrôle Industriel - Détail Complet</p>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((gta) => (
            <button
              key={gta}
              onClick={() => setSelectedGTA(gta)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedGTA === gta
                  ? 'bg-cyan-500/20 border-cyan-500 border-2 text-cyan-400'
                  : 'bg-slate-800 border border-slate-700 text-gray-300 hover:border-slate-600'
              }`}
            >
              GTA{gta}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-400 font-semibold text-sm">{gtaData.status}</span>
        </div>
      </div>

      {/* Main Detailed SVG Schema */}
      <svg width="100%" height="700" viewBox="0 0 1600 700" className="bg-slate-950/50 rounded-lg border border-slate-800">
        {/* Connection lines */}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#00d9ff" />
          </marker>
        </defs>

        {/* SOURCE HP - Orange Left */}
        <g onClick={() => setSelectedComponent('sourceHP')} className="cursor-pointer">
          <rect
            x="30"
            y="80"
            width="160"
            height="200"
            fill="#92400e"
            fillOpacity="0.2"
            stroke="#fb923c"
            strokeWidth="2"
            rx="8"
          />
          <text x="50" y="110" fill="#fb923c" fontSize="14" fontWeight="bold">
            SOURCE HP
          </text>
          <circle cx="110" cy="170" r="28" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="110" y="175" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="bold">
            {gtaData.sourceHP.debit.toFixed(1)}
          </text>
          <text x="110" y="190" textAnchor="middle" fill="#a3a3a3" fontSize="9">
            t/h
          </text>

          <rect x="40" y="210" width="140" height="60" fill="none" stroke="#fb923c" strokeWidth="1" rx="4" />
          <text x="50" y="228" fill="#a3a3a3" fontSize="9">
            P: {gtaData.sourceHP.pression.toFixed(1)} bar
          </text>
          <text x="50" y="243" fill="#a3a3a3" fontSize="9">
            T: {gtaData.sourceHP.temp.toFixed(1)} °C
          </text>
          <text x="50" y="258" fill="#a3a3a3" fontSize="9">
            Qualité: 87%
          </text>
        </g>

        {/* Connection SOURCE HP -> TURBINE */}
        <path d="M 190 180 L 260 180" stroke="#fb923c" strokeWidth="2.5" markerEnd="url(#arrow)" />

        {/* TURBINE À VAPEUR - Blue Center - Detailed with 3 stages */}
        <g onClick={() => setSelectedComponent('turbine')} className="cursor-pointer">
          <rect
            x="260"
            y="40"
            width="380"
            height="320"
            fill="#001f3f"
            fillOpacity="0.2"
            stroke="#3b82f6"
            strokeWidth="3"
            rx="10"
          />
          <text x="280" y="70" fill="#3b82f6" fontSize="16" fontWeight="bold">
            TURBINE À VAPEUR
          </text>

          {/* HP Stage */}
          <g>
            <text x="300" y="100" fill="#a3a3a3" fontSize="11" fontWeight="bold">
              Étage HP
            </text>
            <circle cx="300" cy="150" r="35" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="300" cy="150" r="20" fill="#3b82f6" fillOpacity="0.15" />
            <line x1="300" y1="115" x2="300" y2="185" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="265" y1="150" x2="335" y2="150" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <text x="300" y="215" textAnchor="middle" fill="#00d9ff" fontSize="11" fontWeight="bold">
              {gtaData.turbineStages.hp.toFixed(1)} bar
            </text>
          </g>

          {/* MP Stage */}
          <g>
            <text x="420" y="100" fill="#a3a3a3" fontSize="11" fontWeight="bold">
              Étage MP
            </text>
            <circle cx="420" cy="150" r="35" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="420" cy="150" r="20" fill="#3b82f6" fillOpacity="0.15" />
            <line x1="420" y1="115" x2="420" y2="185" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="385" y1="150" x2="455" y2="150" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <text x="420" y="215" textAnchor="middle" fill="#00d9ff" fontSize="11" fontWeight="bold">
              {gtaData.turbineStages.mp.toFixed(1)} bar
            </text>
          </g>

          {/* BP Stage */}
          <g>
            <text x="540" y="100" fill="#a3a3a3" fontSize="11" fontWeight="bold">
              Étage BP
            </text>
            <circle cx="540" cy="150" r="35" fill="none" stroke="#3b82f6" strokeWidth="2" />
            <circle cx="540" cy="150" r="20" fill="#3b82f6" fillOpacity="0.15" />
            <line x1="540" y1="115" x2="540" y2="185" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <line x1="505" y1="150" x2="575" y2="150" stroke="#3b82f6" strokeWidth="1" opacity="0.5" />
            <text x="540" y="215" textAnchor="middle" fill="#00d9ff" fontSize="11" fontWeight="bold">
              {gtaData.turbineStages.bp.toFixed(1)} bar
            </text>
          </g>

          {/* Main Parameters */}
          <rect x="280" y="250" width="340" height="100" fill="none" stroke="#3b82f6" strokeWidth="1" rx="4" />
          <text x="295" y="268" fill="#a3a3a3" fontSize="10">
            Vitesse: {gtaData.turbineMain.speed.toFixed(0)} rpm
          </text>
          <text x="295" y="283" fill="#a3a3a3" fontSize="10">
            Puissance: {gtaData.turbineMain.power.toFixed(1)} MW
          </text>
          <text x="295" y="298" fill="#a3a3a3" fontSize="10">
            Rendement: {gtaData.turbineMain.efficiency.toFixed(1)}%
          </text>
          <text x="295" y="313" fill="#a3a3a3" fontSize="10">
            Vibration: {gtaData.turbineMain.vibration.toFixed(2)} mm/s
          </text>

          {/* Status indicator */}
          <circle
            cx="550"
            cy="275"
            r="8"
            fill={gtaData.turbineMain.vibration > 3.5 ? '#ff4444' : '#00e5cc'}
          />
        </g>

        {/* ALTERNATEUR - Green Right Top */}
        <g onClick={() => setSelectedComponent('alternateur')} className="cursor-pointer">
          <rect
            x="700"
            y="40"
            width="200"
            height="160"
            fill="#003d33"
            fillOpacity="0.2"
            stroke="#10b981"
            strokeWidth="2"
            rx="10"
          />
          <text x="720" y="70" fill="#10b981" fontSize="14" fontWeight="bold">
            ALTERNATEUR
          </text>

          <circle cx="800" cy="120" r="40" fill="none" stroke="#10b981" strokeWidth="2" />
          <circle cx="800" cy="120" r="25" fill="#10b981" fillOpacity="0.1" />
          <circle cx="800" cy="120" r="8" fill="#10b981" />

          <rect x="720" y="170" width="160" height="20" fill="none" stroke="#10b981" strokeWidth="1" rx="2" />
          <text x="730" y="182" fill="#a3a3a3" fontSize="9">
            {gtaData.alternateur.puissance.toFixed(1)} MW @ {gtaData.alternateur.tension.toFixed(2)} kV
          </text>
        </g>

        {/* REDRESEUR - Yellow/Gold Right Middle */}
        <g onClick={() => setSelectedComponent('redreseur')} className="cursor-pointer">
          <rect
            x="700"
            y="220"
            width="200"
            height="100"
            fill="#78350f"
            fillOpacity="0.15"
            stroke="#d97706"
            strokeWidth="2"
            rx="8"
          />
          <text x="720" y="245" fill="#d97706" fontSize="12" fontWeight="bold">
            REDRESEUR
          </text>
          <rect x="720" y="260" width="160" height="50" fill="none" stroke="#d97706" strokeWidth="1" rx="3" />
          <text x="730" y="275" fill="#a3a3a3" fontSize="9">
            U: {gtaData.redreseur.tension.toFixed(1)} kV
          </text>
          <text x="730" y="288" fill="#a3a3a3" fontSize="9">
            Excit: {gtaData.redreseur.excitation.toFixed(1)} A
          </text>
          <text x="730" y="301" fill="#a3a3a3" fontSize="9">
            THD: {gtaData.redreseur.thd.toFixed(2)}%
          </text>
        </g>

        {/* RESEAU NT - Teal Right Bottom */}
        <g onClick={() => setSelectedComponent('reseauNT')} className="cursor-pointer">
          <rect
            x="700"
            y="340"
            width="200"
            height="120"
            fill="#014737"
            fillOpacity="0.15"
            stroke="#14b8a6"
            strokeWidth="2"
            rx="8"
          />
          <text x="720" y="365" fill="#14b8a6" fontSize="12" fontWeight="bold">
            RESEAU NT
          </text>

          {/* Waveform */}
          <polyline
            points="730,385 738,385 742,375 751,395 755,380 765,390 775,370 785,390 793,385"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="1.5"
          />

          <rect x="720" y="410" width="160" height="50" fill="none" stroke="#14b8a6" strokeWidth="1" rx="3" />
          <text x="730" y="425" fill="#a3a3a3" fontSize="9">
            U: {gtaData.reseauNT.tension.toFixed(2)} kV
          </text>
          <text x="730" y="438" fill="#a3a3a3" fontSize="9">
            P: {gtaData.reseauNT.puissance.toFixed(1)} MW @ 50 Hz
          </text>
          <text x="730" y="451" fill="#a3a3a3" fontSize="9">
            I: {gtaData.reseauNT.courant.toFixed(1)} A
          </text>
        </g>

        {/* CONNECTION TURBINE -> ALTERNATEUR */}
        <path d="M 640 160 L 700 120" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrow)" />
        <text x="665" y="130" fill="#a3a3a3" fontSize="9">
          Arbre
        </text>

        {/* CONDENSEUR - Cyan Bottom Center */}
        <g onClick={() => setSelectedComponent('condenseur')} className="cursor-pointer">
          <rect
            x="340"
            y="420"
            width="200"
            height="120"
            fill="#164e63"
            fillOpacity="0.15"
            stroke="#06b6d4"
            strokeWidth="2"
            rx="8"
          />
          <text x="360" y="450" fill="#06b6d4" fontSize="12" fontWeight="bold">
            CONDENSEUR
          </text>

          {/* Condenser symbol */}
          <polygon points="400,470 430,470 430,510 400,510" fill="none" stroke="#06b6d4" strokeWidth="2" />
          <polygon points="400,475 430,475 430,505 400,505" fill="#06b6d4" fillOpacity="0.2" />

          <rect x="360" y="510" width="180" height="30" fill="none" stroke="#06b6d4" strokeWidth="1" rx="2" />
          <text x="370" y="525" fill="#a3a3a3" fontSize="9">
            {gtaData.condenseur.pression.toFixed(3)} bar | {gtaData.condenseur.temp.toFixed(1)}°C
          </text>
        </g>

        {/* CONNECTION TURBINE -> CONDENSEUR */}
        <path d="M 540 360 Q 440 390 440 420" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" />

        {/* SOURCE MP - Small Left Bottom */}
        <g onClick={() => setSelectedComponent('sourceMP')} className="cursor-pointer">
          <rect
            x="30"
            y="420"
            width="140"
            height="100"
            fill="#7c2d12"
            fillOpacity="0.15"
            stroke="#f97316"
            strokeWidth="2"
            rx="6"
          />
          <text x="45" y="445" fill="#f97316" fontSize="11" fontWeight="bold">
            SOURCE MP
          </text>
          <rect x="45" y="460" width="110" height="50" fill="none" stroke="#f97316" strokeWidth="1" rx="2" />
          <text x="55" y="475" fill="#a3a3a3" fontSize="8">
            Débit: {gtaData.sourceMP.debit.toFixed(1)} t/h
          </text>
          <text x="55" y="487" fill="#a3a3a3" fontSize="8">
            Press: {gtaData.sourceMP.pression.toFixed(1)} bar
          </text>
          <text x="55" y="499" fill="#a3a3a3" fontSize="8">
            Temp: {gtaData.sourceMP.temp.toFixed(1)}°C
          </text>
        </g>

        {/* CONNECTION SOURCEMP -> TURBINE */}
        <path d="M 170 250 Q 280 280 300 360" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* ETAT SYSTEME Panel - Right Bottom */}
        <g>
          <rect
            x="950"
            y="100"
            width="600"
            height="460"
            fill="none"
            stroke="#14b8a6"
            strokeWidth="2"
            rx="10"
          />
          <text x="970" y="135" fill="#14b8a6" fontSize="14" fontWeight="bold">
            ETAT SYSTEME
          </text>

          {/* Vibration Section */}
          <rect x="970" y="155" width="560" height="70" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.3" rx="4" />
          <text x="985" y="173" fill="#a3a3a3" fontSize="10">
            Vibrations (mm/s):
          </text>
          <text x="985" y="190" fill="#00e5cc" fontSize="11" fontWeight="bold">
            V1: {gtaData.turbineMain.vibration.toFixed(2)}mm/s
          </text>
          <text x="985" y="205" fill="#00e5cc" fontSize="11" fontWeight="bold">
            Pression Partielle: {gtaData.condenseur.pression.toFixed(3)} bar
          </text>
          <text x="985" y="220" fill="#00e5cc" fontSize="11" fontWeight="bold">
            Cos φ: {gtaData.alternateur.cosFi.toFixed(3)}
          </text>

          {/* Overall Status */}
          <rect x="970" y="240" width="560" height="75" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" rx="4" />
          <text x="985" y="260" fill="#10b981" fontSize="11" fontWeight="bold">
            Status: {gtaData.status}
          </text>

          {/* Efficiency Bar */}
          <text x="985" y="285" fill="#a3a3a3" fontSize="10">
            Rendement Global:
          </text>
          <rect x="985" y="290" width="520" height="10" fill="#334155" rx="5" />
          <rect
            x="985"
            y="290"
            width={520 * (gtaData.turbineMain.efficiency / 100)}
            height="10"
            fill="#10b981"
            rx="5"
          />
          <text x="1510" y="300" fill="#10b981" fontSize="10" fontWeight="bold">
            {gtaData.turbineMain.efficiency.toFixed(1)}%
          </text>

          {/* Temperature Status */}
          <text x="985" y="325" fill="#a3a3a3" fontSize="10">
            Température:
          </text>
          <text x="985" y="340" fill="#00e5cc" fontSize="10">
            Turbine: {gtaData.sourceHP.temp.toFixed(1)}°C
          </text>
          <text x="985" y="353" fill="#00e5cc" fontSize="10">
            Condenseur: {gtaData.condenseur.temp.toFixed(1)}°C
          </text>
          <text x="985" y="366" fill="#00e5cc" fontSize="10">
            Freq Réseau: {gtaData.reseauNT.freq.toFixed(2)} Hz
          </text>

          {/* Power Output */}
          <text x="985" y="390" fill="#a3a3a3" fontSize="10">
            Puissance:
          </text>
          <text x="985" y="405" fill="#00d9ff" fontSize="11" fontWeight="bold">
            Turbine: {gtaData.turbineMain.power.toFixed(1)} MW
          </text>
          <text x="985" y="420" fill="#10b981" fontSize="11" fontWeight="bold">
            Alternateur: {gtaData.alternateur.puissance.toFixed(1)} MW
          </text>
          <text x="985" y="435" fill="#14b8a6" fontSize="11" fontWeight="bold">
            Réseau: {gtaData.reseauNT.puissance.toFixed(1)} MW
          </text>

          {/* Last Update */}
          <text x="985" y="520" fill="#64748b" fontSize="8" fontStyle="italic">
            Mise à jour: {new Date(gtaData.lastUpdate).toLocaleTimeString()}
          </text>
        </g>
      </svg>

      {/* Legend */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
          <span className="text-xs text-gray-300">Vapeur HP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-xs text-gray-300">Turbine</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-xs text-gray-300">Alternateur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
          <span className="text-xs text-gray-300">Condenseur</span>
        </div>
      </div>

      {/* Selected Component Info */}
      {selectedComponent && (
        <div className="p-4 rounded-lg border border-accent bg-accent/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-accent">Composant Sélectionné</h3>
            <p className="text-xs text-gray-400 mt-1">
              Inspectez les détails opérationnels du composant {selectedComponent}
            </p>
          </div>
          <button
            onClick={() => setSelectedComponent(null)}
            className="text-xs text-gray-400 hover:text-white px-3 py-1 hover:bg-slate-700 rounded"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
