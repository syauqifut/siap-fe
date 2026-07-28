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
import { useDeleteResident, useResidentList } from '@/hooks/useResidents'
import { getApiErrorMessage } from '@/lib/utils'
import type { Resident, ResidentType } from '@/types/resident'

const TYPE_OPTIONS: Array<{
  label: string
  value: ResidentType | undefined
}> = [
  { label: 'Semua', value: undefined },
  { label: 'Tetap', value: 'permanent' },
  { label: 'Kontrak', value: 'contract' },
]

export default function ResidentList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [residentType, setResidentType] = useState<ResidentType | undefined>()
  const [page, setPage] = useState(1)
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(
    null,
  )

  const { data, isLoading, error } = useResidentList({
    search: debouncedSearch || undefined,
    resident_type: residentType,
    page,
  })
  const deleteMutation = useDeleteResident()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleTypeChange = (value: ResidentType | undefined) => {
    setResidentType(value)
    setPage(1)
  }

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open) {
      setResidentToDelete(null)
      deleteMutation.reset()
    }
  }

  const handleDeleteConfirm = () => {
    if (!residentToDelete) return

    deleteMutation.mutate(residentToDelete.id, {
      onSuccess: () => setResidentToDelete(null),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const residents = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Penghuni"
        description="Kelola data penghuni perumahan."
        breadcrumbs={[
          { label: 'Penghuni' },
        ]}
        action={
          <Button render={<Link to="/residents/new" />}>
            <PlusIcon data-icon="inline-start" />
            Tambah Penghuni
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau no. telepon..."
          className="max-w-xs"
        />
        <div className="flex gap-1">
          {TYPE_OPTIONS.map((option) => (
            <Button
              key={option.label}
              size="sm"
              variant={residentType === option.value ? 'default' : 'outline'}
              onClick={() => handleTypeChange(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent>
          {residents.length === 0 ? (
            <EmptyState text="Belum ada data penghuni" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>No. Telepon</TableHead>
                  <TableHead>Status Nikah</TableHead>
                  <TableHead>Rumah Saat Ini</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((resident) => (
                  <TableRow
                    key={resident.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/residents/${resident.id}`)}
                  >
                    <TableCell className="font-medium">
                      {resident.full_name}
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={
                          resident.resident_type === 'permanent'
                            ? 'Tetap'
                            : 'Kontrak'
                        }
                        variant={
                          resident.resident_type === 'permanent'
                            ? 'positive'
                            : 'neutral'
                        }
                      />
                    </TableCell>
                    <TableCell>{resident.phone_number}</TableCell>
                    <TableCell>
                      {resident.is_married ? 'Menikah' : 'Belum menikah'}
                    </TableCell>
                    <TableCell>
                      {resident.current_house?.house_number ?? '-'}
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
                            <Link to={`/residents/${resident.id}/edit`} />
                          }
                        >
                          <PencilIcon />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setResidentToDelete(resident)}
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
            penghuni
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
        open={Boolean(residentToDelete)}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus Penghuni"
        description={`Yakin ingin menghapus penghuni ${residentToDelete?.full_name ?? ''}? Foto KTP-nya juga akan terhapus. Tindakan ini tidak bisa dibatalkan.`}
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
