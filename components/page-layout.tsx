'use client'

import { Sidebar } from '@/components/sidebar'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
  subtitle?: string
}

export function PageLayout({ 
  children, 
  title, 
  description,
  subtitle 
}: PageLayoutProps) {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-6 w-full">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{title}</h1>
                {description && (
                  <p className="text-slate-400 mt-2">{description}</p>
                )}
              </div>
              {subtitle && (
                <div className="text-right text-sm text-slate-400">
                  <p>{subtitle}</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto max-w-7xl mx-auto w-full px-6 py-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-700 bg-slate-800/50 mt-auto">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center text-slate-400 text-sm w-full">
            <p>OCP Energy Anomaly Detection System | Powered by PCMCI, Anomaly Detection & Q-Learning</p>
          </div>
        </footer>
      </div>
    </div>
  )
}
