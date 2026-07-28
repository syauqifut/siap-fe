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
import { useHouseList } from '@/hooks/useHouses'
import { usePaymentList } from '@/hooks/usePayments'
import { useResidentList } from '@/hooks/useResidents'
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

export default function PaymentList() {
  const navigate = useNavigate()
  const defaultMonth = getCurrentMonth()
  const defaultYear = getCurrentYear()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [houseId, setHouseId] = useState('')
  const [residentId, setResidentId] = useState('')
  const [paymentMonth, setPaymentMonth] = useState(defaultMonth)
  const [paymentYear, setPaymentYear] = useState(defaultYear)
  const [page, setPage] = useState(1)

  const { data: housesData } = useHouseList({ per_page: 100 })
  const { data: residentsData } = useResidentList({ per_page: 100 })

  const houses = housesData?.data ?? []
  const residents = residentsData?.data ?? []

  const houseItems = useMemo(
    () => [
      { value: '', label: 'Semua rumah' },
      ...houses.map((house) => ({
        value: String(house.id),
        label: house.house_number,
      })),
    ],
    [houses],
  )

  const residentItems = useMemo(
    () => [
      { value: '', label: 'Semua penghuni' },
      ...residents.map((resident) => ({
        value: String(resident.id),
        label: resident.full_name,
      })),
    ],
    [residents],
  )

  const { data, isLoading, error } = usePaymentList({
    search: debouncedSearch || undefined,
    house_id: houseId ? Number(houseId) : undefined,
    resident_id: residentId ? Number(residentId) : undefined,
    payment_month: paymentMonth ? Number(paymentMonth) : undefined,
    payment_year: paymentYear ? Number(paymentYear) : undefined,
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
    Boolean(houseId) ||
    Boolean(residentId) ||
    paymentMonth !== defaultMonth ||
    paymentYear !== defaultYear

  const handleResetFilters = () => {
    setSearch('')
    setDebouncedSearch('')
    setHouseId('')
    setResidentId('')
    setPaymentMonth(defaultMonth)
    setPaymentYear(defaultYear)
    setPage(1)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const payments = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pembayaran"
        description="Catat dan lihat pembayaran iuran dari penghuni."
        breadcrumbs={[{ label: 'Pembayaran' }]}
        action={
          <Button render={<Link to="/payments/new" />}>
            <PlusIcon data-icon="inline-start" />
            Catat Pembayaran
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
                placeholder="Cari catatan..."
                className="w-full sm:w-52"
              />

              <Select
                modal={false}
                value={houseId || null}
                items={houseItems}
                onValueChange={(value) => {
                  setHouseId(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Semua rumah" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {houseItems.map((item) => (
                    <SelectItem key={item.value || 'all-houses'} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                modal={false}
                value={residentId || null}
                items={residentItems}
                onValueChange={(value) => {
                  setResidentId(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Semua penghuni" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {residentItems.map((item) => (
                    <SelectItem key={item.value || 'all-residents'} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                modal={false}
                value={paymentMonth || null}
                items={MONTH_OPTIONS}
                onValueChange={(value) => {
                  setPaymentMonth(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Semua bulan" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all-months'} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                modal={false}
                value={paymentYear || null}
                items={YEAR_OPTIONS}
                onValueChange={(value) => {
                  setPaymentYear(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Semua tahun" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {YEAR_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all-years'} value={option.value}>
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
              {meta.total} pembayaran
            </p>
          )}

          {payments.length === 0 ? (
            <EmptyState text="Belum ada data pembayaran" />
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
                {payments.map((payment) => (
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
