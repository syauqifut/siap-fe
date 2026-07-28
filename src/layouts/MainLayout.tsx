import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3Icon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DatabaseIcon,
  HomeIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  ReceiptIcon,
  UsersIcon,
  WalletIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import {
  PageHeaderProvider,
  usePageHeaderContext,
} from '@/context/PageHeaderContext'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { cn } from '@/lib/utils'

const APP_HEADER_HEIGHT = 'h-[4.75rem]'

const navItems: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
  { to: '/residents', label: 'Penghuni', icon: UsersIcon },
  { to: '/houses', label: 'Rumah', icon: HomeIcon },
  { to: '/bills', label: 'Tagihan', icon: ReceiptIcon },
  { to: '/payments', label: 'Pembayaran', icon: CreditCardIcon },
  { to: '/expenses', label: 'Pengeluaran', icon: WalletIcon },
]

const reportItems = [
  { to: '/reports/summary', label: 'Ringkasan' },
  { to: '/reports/detail', label: 'Detail' },
]

const masterDataItems = [
  { to: '/master-data/fee-types', label: 'Jenis Iuran' },
  {
    to: '/master-data/expense-categories',
    label: 'Kategori Pengeluaran',
  },
]

function NavItem({
  to,
  label,
  icon: Icon,
}: {
  to: string
  label: string
  icon: LucideIcon
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
          isActive
            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
        )
      }
    >
      <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
      {label}
    </NavLink>
  )
}

function MainLayoutContent() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { state: pageHeader } = usePageHeaderContext()
  const isMasterDataActive = pathname.startsWith('/master-data')
  const isReportsActive = pathname.startsWith('/reports')
  const [isMasterDataOpen, setIsMasterDataOpen] = useState(isMasterDataActive)
  const [isReportsOpen, setIsReportsOpen] = useState(isReportsActive)

  useEffect(() => {
    if (isMasterDataActive) {
      setIsMasterDataOpen(true)
    }
  }, [isMasterDataActive])

  useEffect(() => {
    if (isReportsActive) {
      setIsReportsOpen(true)
    }
  }, [isReportsActive])

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 border-b bg-background">
        <NavLink
          to="/dashboard"
          className={cn(
            APP_HEADER_HEIGHT,
            'flex w-64 shrink-0 flex-col justify-center border-r bg-background px-4 transition-colors hover:bg-muted/50',
          )}
        >
          <p className="text-lg font-semibold tracking-tight text-foreground">
            {APP_NAME}
          </p>
          <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
        </NavLink>

        <div
          className={cn(
            APP_HEADER_HEIGHT,
            'flex min-w-0 flex-1 items-center bg-background px-6',
          )}
        >
          {pageHeader && (
            <Breadcrumbs
              items={pageHeader.breadcrumbs}
              title={pageHeader.title}
            />
          )}
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar">
          <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
            {navItems.map((item) => (
              <NavItem key={item.to} {...item} />
            ))}

            <div className="mt-1">
              <button
                type="button"
                onClick={() => setIsReportsOpen((prev) => !prev)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isReportsActive
                    ? 'bg-sidebar-accent/60 font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
                )}
              >
                <BarChart3Icon
                  className="size-4 shrink-0 opacity-70"
                  aria-hidden
                />
                <span className="flex-1 text-left">Laporan</span>
                {isReportsOpen ? (
                  <ChevronDownIcon className="size-4 shrink-0" />
                ) : (
                  <ChevronRightIcon className="size-4 shrink-0" />
                )}
              </button>

              {isReportsOpen && (
                <div className="mt-0.5 flex flex-col gap-0.5 pl-6">
                  {reportItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-1">
              <button
                type="button"
                onClick={() => setIsMasterDataOpen((prev) => !prev)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  isMasterDataActive
                    ? 'bg-sidebar-accent/60 font-medium text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
                )}
              >
                <DatabaseIcon
                  className="size-4 shrink-0 opacity-70"
                  aria-hidden
                />
                <span className="flex-1 text-left">Master Data</span>
                {isMasterDataOpen ? (
                  <ChevronDownIcon className="size-4 shrink-0" />
                ) : (
                  <ChevronRightIcon className="size-4 shrink-0" />
                )}
              </button>

              {isMasterDataOpen && (
                <div className="mt-0.5 flex flex-col gap-0.5 pl-6">
                  {masterDataItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/60',
                        )
                      }
                    >
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="border-t p-3 space-y-2">
            {user && (
              <div className="px-3 py-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-muted-foreground"
              onClick={handleLogout}
            >
              <LogOutIcon data-icon="inline-start" />
              Keluar
            </Button>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default function MainLayout() {
  return (
    <PageHeaderProvider>
      <MainLayoutContent />
    </PageHeaderProvider>
  )
}
