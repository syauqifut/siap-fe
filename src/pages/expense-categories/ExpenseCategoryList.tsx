import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
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
import {
  useDeleteExpenseCategory,
  useExpenseCategoryList,
} from '@/hooks/useExpenseCategories'
import { getApiErrorMessage } from '@/lib/utils'
import type { ExpenseCategory } from '@/types/expenseCategory'

export default function ExpenseCategoryList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [categoryToDelete, setCategoryToDelete] =
    useState<ExpenseCategory | null>(null)

  const { data, isLoading, error } = useExpenseCategoryList({
    search: debouncedSearch || undefined,
    page,
  })
  const deleteMutation = useDeleteExpenseCategory()

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  const handleDeleteDialogChange = (open: boolean) => {
    if (!open) {
      setCategoryToDelete(null)
      deleteMutation.reset()
    }
  }

  const handleDeleteConfirm = () => {
    if (!categoryToDelete) return

    deleteMutation.mutate(categoryToDelete.id, {
      onSuccess: () => setCategoryToDelete(null),
    })
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={getApiErrorMessage(error)} />

  const categories = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kategori Pengeluaran"
        description="Kelola master data kategori pengeluaran operasional."
        breadcrumbs={[
          { label: 'Master Data' },
          { label: 'Kategori Pengeluaran' },
        ]}
        action={
          <Button render={<Link to="/master-data/expense-categories/new" />}>
            <PlusIcon data-icon="inline-start" />
            Tambah Kategori
          </Button>
        }
      />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nama kategori..."
        className="max-w-xs"
      />

      <Card>
        <CardContent>
          {categories.length === 0 ? (
            <EmptyState text="Belum ada data kategori pengeluaran" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="cursor-pointer"
                    onClick={() =>
                      navigate(
                        `/master-data/expense-categories/${category.id}/edit`,
                      )
                    }
                  >
                    <TableCell className="font-medium">
                      {category.name}
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
                              to={`/master-data/expense-categories/${category.id}/edit`}
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
                          onClick={() => setCategoryToDelete(category)}
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
            kategori
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
        open={Boolean(categoryToDelete)}
        onOpenChange={handleDeleteDialogChange}
        title="Hapus Kategori Pengeluaran"
        description={`Yakin ingin menghapus kategori ${categoryToDelete?.name ?? ''}? Kategori yang sudah dipakai pengeluaran tidak bisa dihapus.`}
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
