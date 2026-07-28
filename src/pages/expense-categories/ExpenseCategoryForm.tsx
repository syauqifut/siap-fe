import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  useCreateExpenseCategory,
  useExpenseCategory,
  useUpdateExpenseCategory,
} from '@/hooks/useExpenseCategories'
import {
  expenseCategorySchema,
  type ExpenseCategoryFormValues,
} from '@/lib/validators/expenseCategorySchema'
import { getApiErrorMessage } from '@/lib/utils'

export default function ExpenseCategoryForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const {
    data: category,
    isLoading: isCategoryLoading,
    error: categoryError,
  } = useExpenseCategory(id)
  const createMutation = useCreateExpenseCategory()
  const updateMutation = useUpdateExpenseCategory()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: { name: '' },
    values: category ? { name: category.name } : undefined,
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = isEdit ? updateMutation.error : createMutation.error

  const handleFormSubmit = (values: ExpenseCategoryFormValues) => {
    if (isEdit && id) {
      updateMutation.mutate(
        { id, payload: values },
        {
          onSuccess: () => navigate('/master-data/expense-categories'),
        },
      )
    } else {
      createMutation.mutate(values, {
        onSuccess: () => navigate('/master-data/expense-categories'),
      })
    }
  }

  if (isEdit && isCategoryLoading) return <LoadingSpinner />
  if (isEdit && categoryError)
    return <ErrorMessage message={getApiErrorMessage(categoryError)} />

  return (
    <div className="max-w-md space-y-4">
      <PageHeader
        title={isEdit ? 'Edit Kategori Pengeluaran' : 'Tambah Kategori Pengeluaran'}
        description={
          isEdit
            ? `Ubah kategori ${category?.name ?? ''}.`
            : 'Tambahkan kategori pengeluaran baru.'
        }
        breadcrumbs={[
          { label: 'Master Data' },
          {
            label: 'Kategori Pengeluaran',
            to: '/master-data/expense-categories',
          },
          isEdit
            ? { label: category ? `Edit ${category.name}` : 'Edit' }
            : { label: 'Tambah' },
        ]}
        backTo="/master-data/expense-categories"
      />

      <Card>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
            noValidate
          >
            {mutationError && (
              <ErrorMessage message={getApiErrorMessage(mutationError)} />
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Kategori</Label>
              <Input
                id="name"
                placeholder="Contoh: Gaji Satpam"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending
                ? 'Menyimpan...'
                : isEdit
                  ? 'Simpan Perubahan'
                  : 'Simpan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
