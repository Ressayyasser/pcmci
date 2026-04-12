'use client'

import React, { useState } from 'react'
import { Activity } from 'lucide-react'

export interface GTADiagramProps {
  gtaNumber?: number
}

export function GTADiagram({ gtaNumber = 3 }: GTADiagramProps) {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  // Real-time mock data for GTA
  const gtaData = {
    sourceHP: { debit: 59.3, pression: 83.1, temperature: 555.4 },
    sourceMP: { debit: 8.7, pression: 14.2, temperature: 312.5 },
    turbine: { speed: 3000, power: 145.6, efficiency: 87.2, vibration: 2.3 },
    alternateur: { output: 165.3, voltage: 15.75, frequency: 50.0, cosFi: 0.95 },
    condenseur: { pressure: 0.08, temperature: 42.5, flow: 289.5 },
    reseauNT: { tension: 23.1, courant: 12.5, puissance: 24.8, freq: 50.0 },
  }

  return (
    <div className="w-full min-h-[750px] bg-gradient-to-b from-slate-900 to-slate-950 p-6 rounded-xl border border-border space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">GTA Platform</h2>
          <p className="text-muted-foreground text-sm">Contrôle Industriel</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-green-400 font-semibold text-sm">NORMAL</span>
        </div>
      </div>

      {/* Main Schematic - Professional Industrial Style */}
      <svg width="100%" height="550" viewBox="0 0 1400 550" className="bg-slate-950/50 rounded-lg border border-slate-800">
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <polygon points="0 0, 10 3, 0 6" fill="#00d9ff" />
          </marker>
        </defs>

        {/* SOURCE HP - Orange Box (Left) */}
        <g onClick={() => setSelectedComponent('sourceHP')} className="cursor-pointer">
          <rect x="20" y="80" width="160" height="200" fill="#92400e" fillOpacity="0.15" stroke="#fb923c" strokeWidth="2" rx="8" />
          <text x="40" y="110" fill="#fb923c" fontSize="14" fontWeight="bold">SOURCE HP</text>
          <text x="40" y="128" fill="#a3a3a3" fontSize="11">Vapeur Haute</text>

          <circle cx="100" cy="170" r="30" fill="none" stroke="#fb923c" strokeWidth="2" />
          <text x="100" y="175" textAnchor="middle" fill="#fb923c" fontSize="12" fontWeight="bold">59.3</text>

          <rect x="30" y="210" width="140" height="60" fill="none" stroke="#fb923c" strokeWidth="1" rx="4" />
          <text x="40" y="228" fill="#a3a3a3" fontSize="9">P: 83.1 bar</text>
          <text x="40" y="242" fill="#a3a3a3" fontSize="9">T: 555.4 °C</text>
          <text x="40" y="256" fill="#a3a3a3" fontSize="9">Qualité: 87%</text>
        </g>

        {/* CONNECTION LINE SOURCE HP TO TURBINE */}
        <path d="M 180 180 L 260 180" stroke="#fb923c" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* TURBINE À VAPEUR - Blue Box (Center) */}
        <g onClick={() => setSelectedComponent('turbine')} className="cursor-pointer">
          <rect x="260" y="80" width="320" height="200" fill="#001f3f" fillOpacity="0.2" stroke="#3b82f6" strokeWidth="2" rx="10" />
          <text x="280" y="110" fill="#3b82f6" fontSize="16" fontWeight="bold">TURBINE À VAPEUR</text>

          {/* Three turbine stages */}
          <circle cx="310" cy="170" r="28" fill="none" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="310" cy="170" r="16" fill="#3b82f6" fillOpacity="0.2" />
          <text x="310" y="175" textAnchor="middle" fill="#00d9ff" fontSize="10" fontWeight="bold">HP</text>

          <circle cx="410" cy="170" r="28" fill="none" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="410" cy="170" r="16" fill="#3b82f6" fillOpacity="0.2" />
          <text x="410" y="175" textAnchor="middle" fill="#00d9ff" fontSize="10" fontWeight="bold">MP</text>

          <circle cx="510" cy="170" r="28" fill="none" stroke="#3b82f6" strokeWidth="2" />
          <circle cx="510" cy="170" r="16" fill="#3b82f6" fillOpacity="0.2" />
          <text x="510" y="175" textAnchor="middle" fill="#00d9ff" fontSize="10" fontWeight="bold">BP</text>

          {/* Parameters */}
          <rect x="280" y="210" width="300" height="60" fill="none" stroke="#3b82f6" strokeWidth="1" rx="4" />
          <text x="290" y="228" fill="#a3a3a3" fontSize="9">Vitesse: 3000 rpm</text>
          <text x="290" y="242" fill="#a3a3a3" fontSize="9">Puissance: 145.6 MW</text>
          <text x="290" y="256" fill="#a3a3a3" fontSize="9">Rendement: 87.2% | Vibration: 2.3 mm/s</text>
        </g>

        {/* CONNECTION TURBINE TO ALTERNATOR */}
        <path d="M 580 180 L 640 180" stroke="#3b82f6" strokeWidth="2.5" markerEnd="url(#arrowhead)" />
        <text x="605" y="165" fill="#a3a3a3" fontSize="10" textAnchor="middle">Arbre</text>

        {/* ALTERNATEUR - Green Box (Right) */}
        <g onClick={() => setSelectedComponent('alternateur')} className="cursor-pointer">
          <rect x="640" y="80" width="220" height="200" fill="#003d33" fillOpacity="0.2" stroke="#10b981" strokeWidth="2" rx="10" />
          <text x="660" y="110" fill="#10b981" fontSize="16" fontWeight="bold">ALTERNATEUR</text>

          {/* Circular representation */}
          <circle cx="750" cy="165" r="45" fill="none" stroke="#10b981" strokeWidth="2" />
          <circle cx="750" cy="165" r="28" fill="#10b981" fillOpacity="0.1" />
          <circle cx="750" cy="165" r="10" fill="#10b981" />

          {/* Parameters */}
          <rect x="660" y="220" width="200" height="60" fill="none" stroke="#10b981" strokeWidth="1" rx="4" />
          <text x="670" y="238" fill="#a3a3a3" fontSize="9">Puissance: 165.3 MW</text>
          <text x="670" y="252" fill="#a3a3a3" fontSize="9">Tension: 15.75 kV | Fréq: 50 Hz</text>
          <text x="670" y="266" fill="#a3a3a3" fontSize="9">Cos φ: 0.95</text>
        </g>

        {/* CONNECTION ALTERNATOR TO NETWORK */}
        <path d="M 860 180 L 920 180" stroke="#10b981" strokeWidth="2" markerEnd="url(#arrowhead)" />

        {/* REDRESEUR - Yellow/Gold (Right) */}
        <g onClick={() => setSelectedComponent('redreseur')} className="cursor-pointer">
          <rect x="920" y="80" width="160" height="90" fill="#78350f" fillOpacity="0.15" stroke="#d97706" strokeWidth="2" rx="8" />
          <text x="940" y="108" fill="#d97706" fontSize="12" fontWeight="bold">REDRESEUR</text>
          <text x="940" y="125" fill="#a3a3a3" fontSize="9">Tension: 15.2 kV</text>
          <text x="940" y="138" fill="#a3a3a3" fontSize="9">Excitation: 4.3 A</text>
          <text x="940" y="151" fill="#a3a3a3" fontSize="9">THD: 2.1%</text>
        </g>

        {/* RESEAU NT - Teal/Green (Right Bottom) */}
        <g onClick={() => setSelectedComponent('reseauNT')} className="cursor-pointer">
          <rect x="920" y="190" width="160" height="90" fill="#014737" fillOpacity="0.15" stroke="#14b8a6" strokeWidth="2" rx="8" />
          <text x="940" y="218" fill="#14b8a6" fontSize="12" fontWeight="bold">RESEAU NT</text>
          <text x="940" y="235" fill="#a3a3a3" fontSize="9">Tension: 23.1 kV</text>
          <text x="940" y="248" fill="#a3a3a3" fontSize="9">Courant: 12.5 A</text>
          <text x="940" y="261" fill="#a3a3a3" fontSize="9">Puissance: 24.8 MW</text>
        </g>

        {/* CONDENSEUR - Cyan (Bottom Center) */}
        <g onClick={() => setSelectedComponent('condenseur')} className="cursor-pointer">
          <rect x="340" y="340" width="180" height="100" fill="#164e63" fillOpacity="0.15" stroke="#06b6d4" strokeWidth="2" rx="8" />
          <text x="360" y="368" fill="#06b6d4" fontSize="12" fontWeight="bold">CONDENSEUR</text>
          <text x="360" y="385" fill="#a3a3a3" fontSize="9">Pression: 0.08 bar</text>
          <text x="360" y="398" fill="#a3a3a3" fontSize="9">Temp: 42.5 °C</text>
          <text x="360" y="411" fill="#a3a3a3" fontSize="9">Débit: 289.5 t/h</text>
        </g>

        {/* EXHAUST CONNECTION */}
        <path d="M 520 280 Q 430 310 430 340" stroke="#06b6d4" strokeWidth="2" strokeDasharray="4,4" />

        {/* SOURCE MP - Small (Left Bottom) */}
        <g onClick={() => setSelectedComponent('sourceMP')} className="cursor-pointer">
          <rect x="20" y="340" width="130" height="100" fill="#7c2d12" fillOpacity="0.15" stroke="#f97316" strokeWidth="2" rx="6" />
          <text x="35" y="365" fill="#f97316" fontSize="11" fontWeight="bold">SOURCE MP</text>
          <text x="35" y="382" fill="#a3a3a3" fontSize="8">Débit: 8.7 t/h</text>
          <text x="35" y="394" fill="#a3a3a3" fontSize="8">Press: 14.2 bar</text>
          <text x="35" y="406" fill="#a3a3a3" fontSize="8">Temp: 312.5°C</text>
          <text x="35" y="418" fill="#a3a3a3" fontSize="8">Qualité: 94%</text>
        </g>

        {/* CONNECTION SOURCEMP TO TURBINE */}
        <path d="M 150 240 Q 270 270 310 280" stroke="#f97316" strokeWidth="1.5" strokeDasharray="3,3" />

        {/* STATUS INDICATOR - Right Side */}
        <g>
          <rect x="1100" y="80" width="280" height="410" fill="none" stroke="#14b8a6" strokeWidth="2" rx="10" />
          <text x="1120" y="110" fill="#14b8a6" fontSize="14" fontWeight="bold">ETAT SYSTEME</text>

          {/* Vibration Monitoring */}
          <rect x="1110" y="130" width="260" height="70" fill="none" stroke="#14b8a6" strokeWidth="1" opacity="0.3" rx="4" />
          <text x="1120" y="148" fill="#a3a3a3" fontSize="10">Vibrations (mm/s):</text>
          <text x="1120" y="165" fill="#00e5cc" fontSize="12" fontWeight="bold">V1: 1.08% | V2: 1.08%</text>
          <text x="1120" y="180" fill="#00e5cc" fontSize="12" fontWeight="bold">V3: 0.98% | Partiel: 3.48bar</text>
          <text x="1120" y="195" fill="#00e5cc" fontSize="12" fontWeight="bold">Cos φ: 0.855</text>

          {/* Overall Status */}
          <rect x="1110" y="215" width="260" height="85" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1" rx="4" />
          <text x="1120" y="235" fill="#10b981" fontSize="11" fontWeight="bold">Status: NORMAL</text>
          <activity cx="1340" cy="235" r="4" fill="#10b981" className="animate-pulse" />

          {/* Efficiency Bar */}
          <text x="1120" y="260" fill="#a3a3a3" fontSize="10">Rendement Global:</text>
          <rect x="1120" y="265" width="240" height="8" fill="#334155" rx="4" />
          <rect x="1120" y="265" width="209" height="8" fill="#10b981" rx="4" />
          <text x="1365" y="275" fill="#10b981" fontSize="10" fontWeight="bold">87.2%</text>

          {/* Temperature Status */}
          <text x="1120" y="300" fill="#a3a3a3" fontSize="10">Température:</text>
          <text x="1120" y="315" fill="#00e5cc" fontSize="10">Turbine: 55.7°C</text>
          <text x="1120" y="328" fill="#00e5cc" fontSize="10">Condenser: 42.5°C</text>
          <text x="1120" y="341" fill="#00e5cc" fontSize="10">Alternateur: 35.6°C</text>

          {/* Power Output */}
          <text x="1120" y="366" fill="#a3a3a3" fontSize="10">Puissance:</text>
          <text x="1120" y="381" fill="#00d9ff" fontSize="12" fontWeight="bold">Turbine: 145.6 MW</text>
          <text x="1120" y="396" fill="#10b981" fontSize="12" fontWeight="bold">Alternateur: 165.3 MW</text>
          <text x="1120" y="411" fill="#14b8a6" fontSize="12" fontWeight="bold">Réseau: 24.8 MW</text>

          {/* Last Update */}
          <text x="1120" y="450" fill="#64748b" fontSize="8" fontStyle="italic">Mise à jour en temps réel</text>
        </g>
      </svg>

      {/* Legend and Component Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-secondary space-y-2">
          <h3 className="text-sm font-bold text-foreground">Composants Interactifs</h3>
          <p className="text-xs text-muted-foreground">Cliquez sur les éléments du schéma pour voir les détails</p>
          {selectedComponent && (
            <div className="text-xs text-accent font-semibold mt-2">
              Composant sélectionné: <span className="text-primary">{selectedComponent}</span>
            </div>
          )}
        </div>

        <div className="p-4 rounded-lg border border-green-500/50 bg-green-500/5">
          <h3 className="text-sm font-bold text-green-400">Code Couleurs</h3>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-muted-foreground">Vapeur HP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-muted-foreground">Turbine</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-muted-foreground">Alternateur</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
              <span className="text-muted-foreground">Condenseur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
