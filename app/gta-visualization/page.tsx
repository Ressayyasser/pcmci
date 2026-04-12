'use client'

import { useState, useEffect } from 'react'
import { PageHeader } from '@/components/page-header'
import { GTADiagram } from '@/components/gta-diagram'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, TrendingUp, Activity } from 'lucide-react'

interface GTAData {
  [key: number]: {
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
}

export default function GTAVisualizationPage() {
  const [loading, setLoading] = useState(true)
  const [gtaData, setGtaData] = useState<GTAData>({})
  const [selectedGTA, setSelectedGTA] = useState<number>(3)
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/pcmci-full')
        const data = await res.json()
        
        // Simulate GTA data from signal controller
        const mockGTAData: GTAData = {
          1: {
            turbineTemp: 54.2,
            turbinePressure: 54.8,
            steamFlow: 15.8,
            condenserTemp: 21.2,
            excitationVoltage: 0.095,
            reactiveVoltage: 0.098,
            cosinusValue: 0.71,
            alternatorPower: 0.095,
            vibrationType3: 0.35,
            usureB3: 0.05,
          },
          2: {
            turbineTemp: 56.1,
            turbinePressure: 56.3,
            steamFlow: 16.5,
            condenserTemp: 20.8,
            excitationVoltage: 0.102,
            reactiveVoltage: 0.105,
            cosinusValue: 0.73,
            alternatorPower: 0.105,
            vibrationType3: 0.38,
            usureB3: 0.08,
          },
          3: {
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
          },
        }

        setGtaData(mockGTAData)
      } catch (err) {
        console.error('[v0] GTA data fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const currentData = gtaData[selectedGTA] || {}
  const totalPower = Object.values(gtaData).reduce((sum, gta) => sum + (gta.alternatorPower || 0), 0)

  return (
    <div>
      <PageHeader
        title="Visualisation GTA Interactive"
        description="Schémas techniques temps-réel des Groupes Turbo-Alternateurs 1, 2, 3"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full space-y-8">
        {/* GTA Selection Tabs */}
        <Tabs value={selectedGTA.toString()} onValueChange={(v) => setSelectedGTA(parseInt(v))} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-secondary border border-border">
            {[1, 2, 3].map((gta) => (
              <TabsTrigger
                key={gta}
                value={gta.toString()}
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                GTA{gta}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* GTA Diagrams */}
          {[1, 2, 3].map((gta) => (
            <TabsContent key={gta} value={gta.toString()} className="space-y-6">
              <GTADiagram
                gtaNumber={gta}
                state={gtaData[gta]}
                onComponentClick={setSelectedComponent}
              />

              {/* Detailed Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-primary">Puissance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{(gtaData[gta]?.alternatorPower || 0).toFixed(3)}</p>
                    <p className="text-xs text-muted-foreground mt-1">MW</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-accent">Température Turbine</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{(gtaData[gta]?.turbineTemp || 0).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground mt-1">°C</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-cyan-400">Débit Vapeur</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{(gtaData[gta]?.steamFlow || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">t/h</p>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-yellow-500">Vibration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{(gtaData[gta]?.vibrationType3 || 0).toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground mt-1">μm</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* System Overview */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Vue d'ensemble du système
            </CardTitle>
            <CardDescription>Performance globale des trois groupes turbo-alternateurs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((gta) => (
                <div key={gta} className="p-4 rounded-lg bg-secondary border border-border space-y-2">
                  <p className="text-sm font-semibold text-foreground">GTA{gta}</p>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Puissance:</span>
                      <span className="text-primary font-bold">
                        {(gtaData[gta]?.alternatorPower || 0).toFixed(3)} MW
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Temp turbine:</span>
                      <span className="text-accent">{(gtaData[gta]?.turbineTemp || 0).toFixed(1)}°C</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Vibration:</span>
                      <span
                        className={gtaData[gta]?.vibrationType3 || 0 > 0.5 ? 'text-yellow-500' : 'text-green-500'}
                      >
                        {(gtaData[gta]?.vibrationType3 || 0).toFixed(2)} μm
                      </span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">Puissance totale du système:</span>
                <p className="text-2xl font-bold text-primary">{totalPower.toFixed(3)} MW</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Component Details */}
        {selectedComponent && (
          <Card className="bg-accent/10 border-2 border-accent">
            <CardHeader>
              <CardTitle className="text-accent flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Détails du composant sélectionné
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Composant ID:</p>
                <p className="text-lg font-mono font-bold text-foreground">{selectedComponent}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">État:</p>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">Opérationnel</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic">
                Cliquez sur un autre composant dans le schéma pour voir ses détails
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
