import { useMemo, useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useReportSummary } from '@/hooks/useReports'
import { formatCurrency, getApiErrorMessage } from '@/lib/utils'

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

function buildYearOptions() {
  const currentYear = new Date().getFullYear()
  const years: Array<{ value: string; label: string }> = []

  for (let year = currentYear; year >= currentYear - 5; year -= 1) {
    years.push({ value: String(year), label: String(year) })
  }

  return years
}

const YEAR_OPTIONS = buildYearOptions()

function getCurrentYear() {
  return String(new Date().getFullYear())
}

function formatChartCurrency(value: number) {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)} jt`
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 0)} rb`
  }

  return String(value)
}

export default function ReportSummary() {
  const [year, setYear] = useState(getCurrentYear())
  const { data, isLoading, isError, error } = useReportSummary({
    year: Number(year),
  })

  const chartData = useMemo(
    () =>
      (data?.chart ?? []).map((point) => ({
        label: MONTH_SHORT[point.month - 1] ?? String(point.month),
        income: Number(point.income),
        expense: Number(point.expense),
        balance: Number(point.balance),
        cumulativeBalance: Number(point.cumulative_balance),
      })),
    [data?.chart],
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title="Ringkasan Laporan"
        description="Grafik pemasukan, pengeluaran, dan saldo kas per bulan selama satu tahun."
        breadcrumbs={[
          { label: 'Laporan' },
          { label: 'Ringkasan' },
        ]}
        action={
          <Select
            value={year}
            items={YEAR_OPTIONS}
            onValueChange={(value) => value && setYear(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Tahun" />
            </SelectTrigger>
            <SelectContent>
              {YEAR_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading && <LoadingSpinner />}

      {isError && (
        <ErrorMessage message={getApiErrorMessage(error, 'Gagal memuat ringkasan laporan.')} />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Total Pemasukan {data.period.year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-emerald-600">
                  {formatCurrency(data.summary.total_income)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Total Pengeluaran {data.period.year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-red-600">
                  {formatCurrency(data.summary.total_expense)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Saldo Sisa {data.period.year}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatCurrency(data.summary.balance)}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Grafik Arus Kas {data.period.year}</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <EmptyState text="Belum ada data laporan untuk tahun ini" />
              ) : (
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatChartCurrency} tick={{ fontSize: 12 }} width={56} />
                      <Tooltip
                        formatter={(value, name) => {
                          const numericValue = Number(value ?? 0)
                          const label =
                            name === 'income'
                              ? 'Pemasukan'
                              : name === 'expense'
                                ? 'Pengeluaran'
                                : 'Saldo Kumulatif'

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
                              : 'Saldo Kumulatif'
                        }
                      />
                      <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} />
                      <Line
                        type="monotone"
                        dataKey="cumulativeBalance"
                        stroke="#2563eb"
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
