'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Network,
  AlertTriangle,
  Zap,
  Lightbulb,
  Home,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  description?: string
}

const mainNav: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: <Home className="w-5 h-5" />,
    description: 'Vue d\'ensemble du système',
  },
]

const analysisNav: NavItem[] = [
  {
    label: 'Analyse PCMCI',
    href: '/pcmci',
    icon: <Network className="w-5 h-5" />,
    description: 'Détection de causalité',
  },
  {
    label: 'Anomalies',
    href: '/anomalies',
    icon: <AlertTriangle className="w-5 h-5" />,
    description: 'Détection et analyse',
  },
  {
    label: 'Stratégie RL',
    href: '/rl-strategy',
    icon: <Zap className="w-5 h-5" />,
    description: 'Q-Learning optimization',
  },
  {
    label: 'Insights',
    href: '/insights',
    icon: <Lightbulb className="w-5 h-5" />,
    description: 'Recommandations',
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Mobile toggle button */}
      <div className="fixed top-0 left-0 z-50 md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="m-4"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-slate-950 border-r border-slate-800 transition-all duration-300',
          isCollapsed ? 'w-20' : 'w-64',
          !isOpen && 'md:translate-x-0 -translate-x-full md:static'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="border-b border-slate-800 p-4 flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm">
                  <p className="font-bold text-white">OCP Energy</p>
                  <p className="text-xs text-slate-400">Dashboard</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="hidden md:flex text-slate-400 hover:text-white transition-colors"
            >
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  isCollapsed ? 'rotate-90' : '-rotate-90'
                )}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Main section */}
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsOpen(false)
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
                  'hover:bg-slate-800 text-slate-300',
                  isActive(item.href) && 'bg-blue-600 text-white'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            ))}

            {/* Divider */}
            {!isCollapsed && <div className="h-px bg-slate-800 my-4" />}

            {/* Analysis section */}
            {!isCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Analyse & Insights
              </p>
            )}
            {analysisNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    setIsOpen(false)
                  }
                }}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                  'hover:bg-slate-800 text-slate-300',
                  isActive(item.href) && 'bg-blue-600 text-white'
                )}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.label}</p>
                    <p className="text-xs text-slate-500 truncate group-hover:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                )}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-slate-800 p-4">
            {!isCollapsed && (
              <div className="bg-slate-900 rounded-lg p-3 space-y-1">
                <p className="text-xs font-semibold text-slate-300">Version</p>
                <p className="text-xs text-slate-500">OCP Dashboard MVP</p>
                <p className="text-xs text-slate-600 mt-2">
                  Système avancé de détection d'anomalies énergétiques
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
