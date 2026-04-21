'use client'

import { PageHeader } from '@/components/page-header'
import { GTARealtimeComponent } from '@/components/gta-realtime'

export default function GTAVisualizationPage() {
  return (
    <div>
      <PageHeader
        title="Visualisation GTA Interactive"
        description="Schémas techniques temps-réel des Groupes Turbo-Alternateurs 1, 2, 3"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        <GTARealtimeComponent />
      </main>
    </div>
  )
}
