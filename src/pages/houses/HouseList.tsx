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
import { useDeleteHouse, useHouseList } from '@/hooks/useHouses'
import { getApiErrorMessage } from '@/lib/utils'
import type { House, HouseStatusFilter } from '@/types/house'

const STATUS_OPTIONS: Array<{
  label: string
  value: HouseStatusFilter | undefined
}> = [
  { label: 'Semua', value: undefined },
  { label: 'Dihuni', value: 'occupied' },
  { label: 'Kosong', value: 'vacant' },
]

export default function HouseList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<HouseStatusFilter | undefined>()
  const [page, setPage] = useState(1)
  const [houseToDelete, setHouseToDelete] = useState<House | null>(null)

  const { data, isLoading, error } = useHouseList({
    search: debouncedSearch || undefined,
    status,
    page,
  })
  const deleteMutation = useDeleteHouse()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleStatusChange = (value: HouseStatusFilter | undefined) => {
    setStatus(value)
    setPage(1)
  }

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open) {
      setHouseToDelete(null)
      deleteMutation.reset()
    }
  }

  const handleDeleteConfirm = () => {
    if (!houseToDelete) return

    deleteMutation.mutate(houseToDelete.id, {
      onSuccess: () => setHouseToDelete(null),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const houses = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Rumah"
        description="Kelola master data nomor rumah."
        breadcrumbs={[
          { label: 'Rumah' },
        ]}
        action={
          <Button render={<Link to="/houses/new" />}>
            <PlusIcon data-icon="inline-start" />
            Tambah Rumah
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor rumah..."
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={status === option.value ? 'default' : 'outline'}
              onClick={() => handleStatusChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent>
          {houses.length === 0 ? (
            <EmptyState text="Belum ada data rumah" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nomor Rumah</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Penghuni Saat Ini</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {houses.map((house) => (
                  <TableRow
                    key={house.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/houses/${house.id}`)}
                  >
                    <TableCell className="font-medium">
                      {house.house_number}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={house.is_occupied ? 'Dihuni' : 'Kosong'}
                        variant={house.is_occupied ? 'positive' : 'neutral'}
                      />
                    </TableCell>
                    <TableCell>
                      {house.current_residents.length > 0
                        ? house.current_residents
                            .map((occupant) => occupant.resident.full_name)
                            .join(', ')
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
                          render={<Link to={`/houses/${house.id}/edit`} />}
                        >
                          <PencilIcon />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setHouseToDelete(house)}
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
            rumah
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
        open={Boolean(houseToDelete)}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus Rumah"
        description={`Yakin ingin menghapus rumah ${houseToDelete?.house_number ?? ''}? Tindakan ini tidak bisa dibatalkan.`}
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
