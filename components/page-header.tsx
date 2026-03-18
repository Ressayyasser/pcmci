import { Breadcrumb } from './breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Breadcrumb />
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{title}</h1>
            {description && (
              <p className="text-slate-400 mt-2">{description}</p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </header>
  )
}
