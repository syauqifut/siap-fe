import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useDeleteFeeType, useFeeTypeList } from '@/hooks/useFeeTypes'
import { formatCurrency, getApiErrorMessage } from '@/lib/utils'
import type { FeeType } from '@/types/feeType'

const RECURRING_OPTIONS: Array<{
  label: string
  value: 0 | 1 | undefined
}> = [
  { label: 'Semua', value: undefined },
  { label: 'Rutin', value: 1 },
  { label: 'Sekali Jalan', value: 0 },
]

export default function FeeTypeList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isRecurring, setIsRecurring] = useState<0 | 1 | undefined>()
  const [page, setPage] = useState(1)
  const [feeTypeToDelete, setFeeTypeToDelete] = useState<FeeType | null>(null)

  const { data, isLoading, error } = useFeeTypeList({
    search: debouncedSearch || undefined,
    is_recurring: isRecurring,
    page,
  })
  const deleteMutation = useDeleteFeeType()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleRecurringChange = (value: 0 | 1 | undefined) => {
    setIsRecurring(value)
    setPage(1)
  }

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open) {
      setFeeTypeToDelete(null)
      deleteMutation.reset()
    }
  }

  const handleDeleteConfirm = () => {
    if (!feeTypeToDelete) return

    deleteMutation.mutate(feeTypeToDelete.id, {
      onSuccess: () => setFeeTypeToDelete(null),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const feeTypes = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Jenis Iuran"
        description="Kelola master data jenis iuran perumahan."
        breadcrumbs={[
          { label: 'Master Data' },
          { label: 'Jenis Iuran' },
        ]}
        action={
          <Button render={<Link to="/master-data/fee-types/new" />}>
            <PlusIcon data-icon="inline-start" />
            Tambah Jenis Iuran
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama jenis iuran..."
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {RECURRING_OPTIONS.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={isRecurring === option.value ? 'default' : 'outline'}
              onClick={() => handleRecurringChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent>
          {feeTypes.length === 0 ? (
            <EmptyState text="Belum ada data jenis iuran" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nominal</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Jatuh Tempo</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feeTypes.map((feeType) => (
                  <TableRow
                    key={feeType.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(`/master-data/fee-types/${feeType.id}/edit`)
                    }
                  >
                    <TableCell className="font-medium">{feeType.name}</TableCell>
                    <TableCell>{formatCurrency(feeType.amount)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={feeType.is_recurring ? 'Rutin' : 'Sekali Jalan'}
                        variant={feeType.is_recurring ? 'positive' : 'neutral'}
                      />
                    </TableCell>
                    <TableCell>
                      {feeType.is_recurring && feeType.due_day != null
                        ? `Tanggal ${feeType.due_day}`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className="flex justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          render={
                            <Link
                              to={`/master-data/fee-types/${feeType.id}/edit`}
                            />
                          }
                        >
                          <PencilIcon />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setFeeTypeToDelete(feeType)}
                        >
                          <Trash2Icon />
                          <span className="sr-only">Hapus</span>
                        </Button>
                      </div>
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
            Halaman {meta.current_page} dari {meta.last_page} · {meta.total}{' '}
            jenis iuran
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

      <ConfirmDialog
        open={Boolean(feeTypeToDelete)}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus Jenis Iuran"
        description={`Yakin ingin menghapus jenis iuran ${feeTypeToDelete?.name ?? ''}? Jenis iuran yang sudah punya tagihan tidak bisa dihapus — ubah nominal-nya saja.`}
        isPending={deleteMutation.isPending}
        errorMessage={
          deleteMutation.error
            ? getApiErrorMessage(deleteMutation.error)
            : undefined
        }
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
