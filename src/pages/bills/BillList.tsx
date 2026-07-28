import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PlusIcon, RotateCcwIcon } from 'lucide-react'

import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { useBillList } from '@/hooks/useBills'
import { useFeeTypeList } from '@/hooks/useFeeTypes'
import { useHouseList } from '@/hooks/useHouses'
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

const PAID_STATUS_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: '0', label: 'Belum lunas' },
  { value: '1', label: 'Lunas' },
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

export default function BillList() {
  const navigate = useNavigate()
  const defaultMonth = getCurrentMonth()
  const defaultYear = getCurrentYear()

  const [houseId, setHouseId] = useState('')
  const [feeTypeId, setFeeTypeId] = useState('')
  const [dueMonth, setDueMonth] = useState(defaultMonth)
  const [dueYear, setDueYear] = useState(defaultYear)
  const [isPaid, setIsPaid] = useState('')
  const [page, setPage] = useState(1)

  const { data: housesData } = useHouseList({ per_page: 100 })
  const { data: feeTypesData } = useFeeTypeList({ per_page: 100 })

  const houses = housesData?.data ?? []
  const feeTypes = feeTypesData?.data ?? []

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

  const feeTypeItems = useMemo(
    () => [
      { value: '', label: 'Semua jenis iuran' },
      ...feeTypes.map((feeType) => ({
        value: String(feeType.id),
        label: feeType.name,
      })),
    ],
    [feeTypes],
  )

  const { data, isLoading, error } = useBillList({
    house_id: houseId ? Number(houseId) : undefined,
    fee_type_id: feeTypeId ? Number(feeTypeId) : undefined,
    due_month: dueMonth ? Number(dueMonth) : undefined,
    due_year: dueYear ? Number(dueYear) : undefined,
    is_paid: isPaid ? (Number(isPaid) as 0 | 1) : undefined,
    page,
  })

  const isFiltered =
    Boolean(houseId) ||
    Boolean(feeTypeId) ||
    Boolean(isPaid) ||
    dueMonth !== defaultMonth ||
    dueYear !== defaultYear

  const handleResetFilters = () => {
    setHouseId('')
    setFeeTypeId('')
    setDueMonth(defaultMonth)
    setDueYear(defaultYear)
    setIsPaid('')
    setPage(1)
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const bills = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tagihan"
        description="Daftar kewajiban bayar per rumah dan periode."
        breadcrumbs={[{ label: 'Tagihan' }]}
        action={
          <Button render={<Link to="/bills/new" />}>
            <PlusIcon data-icon="inline-start" />
            Buat Tagihan
          </Button>
        }
      />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
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
                value={feeTypeId || null}
                items={feeTypeItems}
                onValueChange={(value) => {
                  setFeeTypeId(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Semua jenis iuran" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {feeTypeItems.map((item) => (
                    <SelectItem key={item.value || 'all-fee-types'} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                modal={false}
                value={dueMonth || null}
                items={MONTH_OPTIONS}
                onValueChange={(value) => {
                  setDueMonth(value ?? '')
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
                value={dueYear || null}
                items={YEAR_OPTIONS}
                onValueChange={(value) => {
                  setDueYear(value ?? '')
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

              <Select
                modal={false}
                value={isPaid || null}
                items={PAID_STATUS_OPTIONS}
                onValueChange={(value) => {
                  setIsPaid(value ?? '')
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent align="start" side="bottom" sideOffset={4}>
                  {PAID_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all-status'} value={option.value}>
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
            <p className="text-sm text-muted-foreground">{meta.total} tagihan</p>
          )}

          {bills.length === 0 ? (
            <EmptyState text="Belum ada data tagihan" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Rumah</TableHead>
                  <TableHead className="w-36">Jenis Iuran</TableHead>
                  <TableHead className="w-36">Jatuh Tempo</TableHead>
                  <TableHead className="w-32 text-right">Nominal</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow
                    key={bill.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/bills/${bill.id}`)}
                  >
                    <TableCell className="whitespace-nowrap font-medium">
                      {bill.house.house_number}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {bill.fee_type.name}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(bill.due_date)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right">
                      {formatCurrency(bill.amount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={bill.is_paid ? 'Lunas' : 'Belum lunas'}
                        variant={bill.is_paid ? 'positive' : 'negative'}
                      />
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
