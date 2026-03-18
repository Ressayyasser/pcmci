import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Sidebar } from '@/components/sidebar'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'OCP Energy Anomaly Detection Dashboard',
  description: 'Advanced energy system monitoring with PCMCI causal analysis, anomaly detection, and Q-Learning optimization',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-slate-900 text-slate-50">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1 overflow-auto md:ml-0">
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
              {children}
            </div>
          </main>
        </div>
        <Analytics />
      </body>
    </html>
  )
}
