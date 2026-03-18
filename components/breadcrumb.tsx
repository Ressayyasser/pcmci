'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

const breadcrumbLabels: Record<string, string> = {
  pcmci: 'Analyse PCMCI',
  anomalies: 'Anomalies',
  'rl-strategy': 'Stratégie Q-Learning',
  insights: 'Insights',
}

export function Breadcrumb() {
  const pathname = usePathname()

  if (pathname === '/') {
    return null
  }

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => {
      const href = '/' + arr.slice(0, index + 1).join('/')
      const label = breadcrumbLabels[segment] || segment
      return { href, label }
    })

  return (
    <nav className="flex items-center gap-1 text-sm text-slate-400 mb-4">
      <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
        <Home className="w-4 h-4" />
        Accueil
      </Link>
      {segments.map((segment, index) => (
        <div key={segment.href} className="flex items-center gap-1">
          <ChevronRight className="w-4 h-4" />
          {index === segments.length - 1 ? (
            <span className="text-white font-medium">{segment.label}</span>
          ) : (
            <Link
              href={segment.href}
              className="hover:text-white transition-colors"
            >
              {segment.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
