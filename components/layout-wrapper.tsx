'use client'

import { Sidebar } from '@/components/sidebar'
import { ReactNode } from 'react'

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
