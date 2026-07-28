import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useReportDetail } from '@/hooks/useReports'
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils'

const MONTH_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' },
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

function getCurrentMonth() {
  return String(new Date().getMonth() + 1)
}

function getCurrentYear() {
  return String(new Date().getFullYear())
}

export default function ReportDetail() {
  const navigate = useNavigate()
  const [month, setMonth] = useState(getCurrentMonth())
  const [year, setYear] = useState(getCurrentYear())

  const { data, isLoading, isError, error } = useReportDetail({
    month: Number(month),
    year: Number(year),
  })

  return (
    <div className="space-y-4">
      <PageHeader
        title="Detail Laporan"
        description="Daftar pemasukan dan pengeluaran untuk bulan tertentu, beserta ringkasan per kategori."
        breadcrumbs={[
          { label: 'Laporan' },
          { label: 'Detail' },
        ]}
        action={
          <div className="flex gap-2">
            <Select
              value={month}
              items={MONTH_OPTIONS}
              onValueChange={(value) => value && setMonth(value)}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={year}
              items={YEAR_OPTIONS}
              onValueChange={(value) => value && setYear(value)}
            >
              <SelectTrigger className="w-28">
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
          </div>
        }
      />

      {isLoading && <LoadingSpinner />}

      {isError && (
        <ErrorMessage message={getApiErrorMessage(error, 'Gagal memuat detail laporan.')} />
      )}

      {!isLoading && !isError && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  Pemasukan — {data.period.month_label}
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
                  Pengeluaran — {data.period.month_label}
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
                  Saldo — {data.period.month_label}
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
              <CardTitle>Pemasukan</CardTitle>
            </CardHeader>
            <CardContent>
              {data.income.length === 0 ? (
                <EmptyState text="Tidak ada pemasukan pada periode ini" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Tanggal</TableHead>
                      <TableHead className="w-28">Rumah</TableHead>
                      <TableHead className="w-40">Penghuni</TableHead>
                      <TableHead>Catatan</TableHead>
                      <TableHead className="w-36 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.income.map((payment) => (
                      <TableRow
                        key={payment.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/payments/${payment.id}`)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {formatDate(payment.payment_date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">
                          {payment.house.house_number}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {payment.resident.full_name}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {payment.notes || '—'}
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

          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran</CardTitle>
            </CardHeader>
            <CardContent>
              {data.expenses.length === 0 ? (
                <EmptyState text="Tidak ada pengeluaran pada periode ini" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-36">Tanggal</TableHead>
                      <TableHead className="w-40">Kategori</TableHead>
                      <TableHead>Deskripsi</TableHead>
                      <TableHead className="w-36 text-right">Jumlah</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expenses.map((expense) => (
                      <TableRow
                        key={expense.id}
                        className="cursor-pointer"
                        onClick={() => navigate(`/expenses/${expense.id}`)}
                      >
                        <TableCell className="whitespace-nowrap">
                          {formatDate(expense.expense_date)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {expense.expense_category.name}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {expense.description}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right font-medium">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pengeluaran per Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              {data.expenses_by_category.length === 0 ? (
                <EmptyState text="Tidak ada pengeluaran per kategori pada periode ini" />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kategori</TableHead>
                      <TableHead className="w-32 text-right">Transaksi</TableHead>
                      <TableHead className="w-40 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.expenses_by_category.map((item) => (
                      <TableRow key={item.expense_category.id}>
                        <TableCell className="font-medium">
                          {item.expense_category.name}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.transaction_count}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.total_amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
