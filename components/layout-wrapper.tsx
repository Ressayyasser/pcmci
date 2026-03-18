'use client'

import { Sidebar } from '@/components/sidebar'
import { ReactNode } from 'react'

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-0">
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          {children}
        </div>
      </main>
    </div>
  )
}
