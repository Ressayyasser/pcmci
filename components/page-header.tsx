import { Breadcrumb } from './breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Breadcrumb />
        <div className="flex items-center justify-between mt-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-3">{description}</p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </header>
  )
}
