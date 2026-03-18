'use client'

import { Sidebar } from '@/components/sidebar'

export function AppWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
