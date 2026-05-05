'use client'

import { PageHeader } from '@/components/page-header'
import { GTADetailedSchema } from '@/components/gta-detailed-schema'

export default function GTAVisualizationPage() {
  return (
    <div>
      <PageHeader
        title="Visualisation GTA Interactive Détaillée"
        description="Schémas techniques complets avec mesures temps-réel des Groupes Turbo-Alternateurs 1, 2, 3"
      />

      <main className="max-w-7xl mx-auto px-8 py-16 w-full">
        <GTADetailedSchema />
      </main>
    </div>
  )
}
