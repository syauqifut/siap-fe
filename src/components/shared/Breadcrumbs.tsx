import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRightIcon } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  title?: string
}

export function Breadcrumbs({ items, title }: BreadcrumbsProps) {
  const lastItem = items[items.length - 1]
  const lastItemIsCurrentPage = Boolean(lastItem && !lastItem.to)
  const showTitle =
    Boolean(title) &&
    !lastItemIsCurrentPage &&
    (!lastItem || lastItem.label !== title)

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 w-full flex-nowrap items-center gap-1.5 text-sm text-muted-foreground"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1 && !showTitle
        const isLastInItems = index === items.length - 1
        const showChevronAfter = !isLastInItems || (isLastInItems && showTitle)

        return (
          <Fragment key={`${item.label}-${index}`}>
            {item.to && !isLast ? (
              <Link
                to={item.to}
                className="shrink-0 transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ) : (
              <span
                aria-current={isLast ? 'page' : undefined}
                className={
                  isLast
                    ? 'min-w-0 truncate text-xl font-semibold tracking-tight text-foreground'
                    : 'shrink-0'
                }
              >
                {item.label}
              </span>
            )}
            {showChevronAfter && (
              <ChevronRightIcon className="size-3.5 shrink-0" aria-hidden />
            )}
          </Fragment>
        )
      })}
      {showTitle && title && (
        <span
          aria-current="page"
          className="min-w-0 truncate text-xl font-semibold tracking-tight text-foreground"
        >
          {title}
        </span>
      )}
    </nav>
  )
}
