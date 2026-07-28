import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRightIcon,
  BarChart3Icon,
  CreditCardIcon,
  HomeIcon,
  ReceiptIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDashboard } from '@/hooks/useReports'
import { cn, formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils'

const MONTH_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
]

function formatChartCurrency(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} jt`
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} rb`
  }

  return String(value)
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  valueClassName,
  to,
}: {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  valueClassName?: string
  to?: string
}) {
  const content = (
    <Card className={cn(to && 'transition-colors hover:bg-muted/30')}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
        <CardTitle className="text-sm font-normal text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="size-4 shrink-0 opacity-60" aria-hidden />
      </CardHeader>
      <CardContent>
        <p className={cn('text-2xl font-semibold tracking-tight', valueClassName)}>
          {value}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )

  if (to) {
    return (
      <Link to={to} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {content}
      </Link>
    )
  }

  return content
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, isError, error } = useDashboard()

  const chartData =
    data?.cash_flow_chart.map((point) => ({
      label: MONTH_SHORT[point.month - 1] ?? String(point.month),
      income: Number(point.income),
      expense: Number(point.expense),
      balance: Number(point.balance),
    })) ?? []

  if (isLoading) return <LoadingSpinner />

  if (isError) {
    return (
      <ErrorMessage message={getApiErrorMessage(error, 'Gagal memuat dashboard.')} />
    )
  }

  if (!data) return null

  const { period, occupancy, finance_current_month, finance_current_year, bills } =
    data

  const billCollectionRate =
    bills.due_this_month_count > 0
      ? Math.round(
          (bills.paid_this_due_month_count / bills.due_this_month_count) * 100,
        )
      : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description={`Ringkasan perumahan dan keuangan — ${period.month_label}.`}
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Rumah dihuni"
          value={`${occupancy.occupied_houses} / ${occupancy.total_houses}`}
          subtitle={`${occupancy.occupancy_rate}% terisi · ${occupancy.vacant_houses} kosong`}
          icon={HomeIcon}
          to="/houses"
        />
        <StatCard
          title="Saldo bulan ini"
          value={formatCurrency(finance_current_month.balance)}
          subtitle={`Pemasukan diterima ${period.month_label}`}
          icon={WalletIcon}
          to="/reports/detail"
        />
        <StatCard
          title="Pemasukan bulan ini"
          value={formatCurrency(finance_current_month.total_income)}
          subtitle="Berdasarkan tanggal pembayaran"
          icon={TrendingUpIcon}
          valueClassName="text-emerald-600"
          to="/reports/detail"
        />
        <StatCard
          title="Pengeluaran bulan ini"
          value={formatCurrency(finance_current_month.total_expense)}
          subtitle="Berdasarkan tanggal pengeluaran"
          icon={TrendingDownIcon}
          valueClassName="text-red-600"
          to="/reports/detail"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tagihan belum lunas"
          value={String(bills.unpaid_count)}
          subtitle={`Total sisa ${formatCurrency(bills.unpaid_total_amount)}`}
          icon={ReceiptIcon}
          valueClassName="text-amber-600"
          to="/bills"
        />
        <StatCard
          title="Tagihan lunas (jatuh tempo)"
          value={`${bills.paid_this_due_month_count} / ${bills.due_this_month_count}`}
          subtitle={`${billCollectionRate}% tagihan jatuh tempo ${period.month_label}`}
          icon={ReceiptIcon}
          to="/bills"
        />
        <StatCard
          title="Saldo tahun ini"
          value={formatCurrency(finance_current_year.balance)}
          subtitle={`Tahun ${period.year}`}
          icon={BarChart3Icon}
          to="/reports/summary"
        />
        <StatCard
          title="Pemasukan tahun ini"
          value={formatCurrency(finance_current_year.total_income)}
          subtitle={`Pengeluaran ${formatCurrency(finance_current_year.total_expense)}`}
          icon={CreditCardIcon}
          to="/reports/summary"
        />
      </section>

      <div className="grid gap-4 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Arus kas 6 bulan terakhir</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              render={<Link to="/reports/summary" />}
            >
              Lihat laporan
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <EmptyState text="Belum ada data arus kas" />
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={formatChartCurrency}
                      tick={{ fontSize: 12 }}
                      width={56}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const numericValue = Number(value ?? 0)
                        const label =
                          name === 'income'
                            ? 'Pemasukan'
                            : name === 'expense'
                              ? 'Pengeluaran'
                              : 'Saldo'

                        return [formatCurrency(numericValue), label]
                      }}
                      labelFormatter={(label) => `Bulan ${label}`}
                    />
                    <Legend
                      formatter={(value) =>
                        value === 'income'
                          ? 'Pemasukan'
                          : value === 'expense'
                            ? 'Pengeluaran'
                            : 'Saldo'
                      }
                    />
                    <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Pembayaran terakhir</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              render={<Link to="/payments" />}
            >
              Semua
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          </CardHeader>
          <CardContent>
            {data.recent_payments.length === 0 ? (
              <EmptyState text="Belum ada pembayaran tercatat" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28">Tanggal</TableHead>
                    <TableHead>Rumah</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recent_payments.map((payment) => (
                    <TableRow
                      key={payment.id}
                      className="cursor-pointer"
                      onClick={() => navigate(`/payments/${payment.id}`)}
                    >
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {formatDate(payment.payment_date)}
                      </TableCell>
                      <TableCell className="font-medium">
                        {payment.house.house_number}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-right font-medium">
                        {formatCurrency(payment.total_amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
