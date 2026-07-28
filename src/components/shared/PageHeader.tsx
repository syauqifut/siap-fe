import { useLayoutEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftIcon } from 'lucide-react'

import type { BreadcrumbItem } from '@/components/shared/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { usePageHeaderContext } from '@/context/PageHeaderContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  breadcrumbs?: BreadcrumbItem[]
  backTo?: string
  backLabel?: string
}

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
  backTo,
  backLabel = 'Kembali',
}: PageHeaderProps) {
  const { setPageHeader, clearPageHeader } = usePageHeaderContext()

  useDocumentTitle(title)

  useLayoutEffect(() => {
    setPageHeader({ breadcrumbs: breadcrumbs ?? [], title })
    return () => clearPageHeader()
  }, [breadcrumbs, title, setPageHeader, clearPageHeader])

  return (
    <div className="mb-6 space-y-3">
      {(backTo || action) && (
        <div
          className={cn(
            'flex items-center gap-4',
            backTo && action && 'justify-between',
          )}
        >
          {backTo && (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 w-fit text-muted-foreground"
              render={<Link to={backTo} />}
            >
              <ArrowLeftIcon data-icon="inline-start" />
              {backLabel}
            </Button>
          )}

          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
