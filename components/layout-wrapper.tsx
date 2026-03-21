'use client'

import { Sidebar } from '@/components/sidebar'
import { ReactNode } from 'react'

export function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-full h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full">
        <div className="w-full min-h-screen bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}
