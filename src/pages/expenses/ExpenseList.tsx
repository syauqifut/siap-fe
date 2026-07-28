import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon, RotateCcwIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { useExpenseCategoryList } from '@/hooks/useExpenseCategories'
import { useExpenseList } from '@/hooks/useExpenses'
import { formatCurrency, formatDate, getApiErrorMessage } from '@/lib/utils'

const MONTH_OPTIONS = [
  { value: '', label: 'Semua bulan' },
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

function getCurrentMonth() {
  return String(new Date().getMonth() + 1)
}

function getCurrentYear() {
  return String(new Date().getFullYear())
}

function buildYearOptions() {
  const currentYear = new Date().getFullYear()
  const years: Array<{ value: string; label: string }> = [
    { value: '', label: 'Semua tahun' },
  ]

  for (let year = currentYear; year >= currentYear - 5; year -= 1) {
    years.push({ value: String(year), label: String(year) })
  }

  return years
}

const YEAR_OPTIONS = buildYearOptions()

export default function ExpenseList() {
  const navigate = useNavigate()
  const defaultMonth = getCurrentMonth()
  const defaultYear = getCurrentYear()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [expenseMonth, setExpenseMonth] = useState(defaultMonth)
  const [expenseYear, setExpenseYear] = useState(defaultYear)
  const [page, setPage] = useState(1)

  const { data: categoriesData } = useExpenseCategoryList({ per_page: 100 })
  const categories = categoriesData?.data ?? []

  const categoryItems = useMemo(
    () => [
      { value: '', label: 'Semua kategori' },
      ...categories.map((category) => ({
        value: String(category.id),
        label: category.name,
      })),
    ],
    [categories],
  )

  const { data, isLoading, error } = useExpenseList({
    search: debouncedSearch || undefined,
    expense_category_id: categoryId ? Number(categoryId) : undefined,
    expense_month: expenseMonth ? Number(expenseMonth) : undefined,
    expense_year: expenseYear ? Number(expenseYear) : undefined,
    page,
  })

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const isFiltered =
    Boolean(debouncedSearch) ||
    Boolean(categoryId) ||
    expenseMonth !== defaultMonth ||
    expenseYear !== defaultYear

  const handleResetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setCategoryId('')
    setExpenseMonth(defaultMonth)
    setExpenseYear(defaultYear)
    setPage(1)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const expenses = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pengeluaran"
        description="Catat dan lihat pengeluaran operasional perumahan."
        breadcrumbs={[{ label: 'Pengeluaran' }]}
        action={
          <Button render={<Link to="/expenses/new" />}>
            <PlusIcon data-icon="inline-start" />
            Catat Pengeluaran
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari deskripsi..."
                className="w-full sm:w-52"
              />

              <Select
                modal={false}
                value={categoryId || null}
                items={categoryItems}
                onValueChange={(value) => {
                  setCategoryId(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue placeholder="Semua kategori" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value || 'all'} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                modal={false}
                value={expenseMonth || null}
                items={MONTH_OPTIONS}
                onValueChange={(value) => {
                  setExpenseMonth(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Semua bulan" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                modal={false}
                value={expenseYear || null}
                items={YEAR_OPTIONS}
                onValueChange={(value) => {
                  setExpenseYear(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Semua tahun" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {YEAR_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isFiltered && (
              <Button
                size="sm"
                variant="ghost"
                className="w-fit shrink-0 text-muted-foreground"
                onClick={handleResetFilters}
              >
                <RotateCcwIcon data-icon="inline-start" />
                Reset filter
              </Button>
            )}
          </div>

          {meta && (
            <p className="text-sm text-muted-foreground">
              {meta.total} pengeluaran
            </p>
          )}

          {expenses.length === 0 ? (
            <EmptyState text="Belum ada data pengeluaran" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36">Tanggal</TableHead>
                  <TableHead className="w-40">Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="w-36 text-right">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
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

      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Halaman {meta.current_page} dari {meta.last_page}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={meta.current_page <= 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Sebelumnya
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={meta.current_page >= meta.last_page}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Berikutnya
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
