import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { BreadcrumbItem } from '@/components/shared/Breadcrumbs'

interface PageHeaderState {
  breadcrumbs: BreadcrumbItem[]
  title: string
}

interface PageHeaderContextValue {
  state: PageHeaderState | null
  setPageHeader: (state: PageHeaderState) => void
  clearPageHeader: () => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PageHeaderState | null>(null)

  const setPageHeader = useCallback((next: PageHeaderState) => {
    setState(next)
  }, [])

  const clearPageHeader = useCallback(() => {
    setState(null)
  }, [])

  const value = useMemo(
    () => ({ state, setPageHeader, clearPageHeader }),
    [state, setPageHeader, clearPageHeader],
  )

  return (
    <PageHeaderContext.Provider value={value}>
      {children}
    </PageHeaderContext.Provider>
  )
}

export function usePageHeaderContext() {
  const context = useContext(PageHeaderContext)
  if (!context) {
    throw new Error('usePageHeaderContext must be used within PageHeaderProvider')
  }
  return context
}
