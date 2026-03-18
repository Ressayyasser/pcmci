'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href: string
}

const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  '/': [{ label: 'Dashboard', href: '/' }],
  '/pcmci': [
    { label: 'Dashboard', href: '/' },
    { label: 'PCMCI Analysis', href: '/pcmci' },
  ],
  '/anomalies': [
    { label: 'Dashboard', href: '/' },
    { label: 'Anomaly Detection', href: '/anomalies' },
  ],
  '/rl-strategy': [
    { label: 'Dashboard', href: '/' },
    { label: 'Q-Learning Strategy', href: '/rl-strategy' },
  ],
  '/insights': [
    { label: 'Dashboard', href: '/' },
    { label: 'Insights', href: '/insights' },
  ],
}

export function BreadcrumbNav() {
  const pathname = usePathname()
  const breadcrumbs = breadcrumbMap[pathname] || [{ label: 'Page', href: '/' }]

  return (
    <nav className="flex items-center gap-2 text-sm text-slate-400 mb-4">
      {breadcrumbs.map((item, idx) => (
        <div key={item.href} className="flex items-center gap-2">
          <Link
            href={item.href}
            className="hover:text-slate-200 transition-colors"
          >
            {item.label}
          </Link>
          {idx < breadcrumbs.length - 1 && (
            <ChevronRight size={16} className="text-slate-600" />
          )}
        </div>
      ))}
    </nav>
  )
}
