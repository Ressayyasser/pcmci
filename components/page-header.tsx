import { Breadcrumb } from './breadcrumb'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <header className="border-b border-border bg-card/40 backdrop-blur sticky top-0 z-20 w-full">
      <div className="max-w-7xl mx-auto px-8 py-10 w-full">
        <Breadcrumb />
        <div className="flex items-center justify-between mt-6">
          <div className="flex-1">
            <h1 className="text-5xl font-bold text-foreground">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-4 text-lg">{description}</p>
            )}
          </div>
          {children && <div>{children}</div>}
        </div>
      </div>
    </header>
  )
}
