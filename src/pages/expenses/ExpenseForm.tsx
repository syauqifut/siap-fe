import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { CreateExpenseCategoryDialog } from '@/components/expenses/CreateExpenseCategoryDialog'
import { ExpenseCategorySelect } from '@/components/expenses/ExpenseCategorySelect'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useExpenseCategoryList } from '@/hooks/useExpenseCategories'
import { useCreateExpense } from '@/hooks/useExpenses'
import { getTodayDateString } from '@/lib/validators/occupancySchema'
import {
  expenseSchema,
  toExpensePayload,
  type ExpenseFormValues,
} from '@/lib/validators/expenseSchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { ExpenseCategory } from '@/types/expenseCategory'

export default function ExpenseForm() {
  const navigate = useNavigate()
  const createMutation = useCreateExpense()
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false)
  const [createdCategory, setCreatedCategory] = useState<ExpenseCategory | null>(
    null,
  )

  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useExpenseCategoryList({ per_page: 100 })

  const categories = useMemo(() => {
    const base = categoriesData?.data ?? []

    if (
      createdCategory &&
      !base.some((category) => category.id === createdCategory.id)
    ) {
      return [createdCategory, ...base]
    }

    return base
  }, [categoriesData?.data, createdCategory])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expense_category_id: '',
      description: '',
      amount: undefined,
      expense_date: getTodayDateString(),
    },
  })

  const categoryId = watch('expense_category_id')

  const handleFormSubmit = (values: ExpenseFormValues) => {
    createMutation.mutate(toExpensePayload(values), {
      onSuccess: () => navigate('/expenses'),
    })
  }

  const handleCreateCategorySuccess = (category: ExpenseCategory) => {
    setCreatedCategory(category)
    setValue('expense_category_id', String(category.id), {
      shouldValidate: true,
    })
  }

  if (isCategoriesLoading) return <LoadingSpinner />

  return (
    <>
    <div className="max-w-md space-y-4">
      <PageHeader
        title="Catat Pengeluaran"
        description="Tambahkan catatan pengeluaran baru. Data bersifat append-only dan tidak bisa diubah setelah disimpan."
        breadcrumbs={[
          { label: 'Pengeluaran', to: '/expenses' },
          { label: 'Catat' },
        ]}
        backTo="/expenses"
      />

      <Card>
        <CardContent>
          <form
            onSubmit={handleSubmit(handleFormSubmit)}
            className="space-y-4"
            noValidate
          >
            {createMutation.error && (
              <ErrorMessage message={getApiErrorMessage(createMutation.error)} />
            )}

            <div className="space-y-2">
              <Label htmlFor="expense_category_id">Kategori</Label>
              <ExpenseCategorySelect
                id="expense_category_id"
                value={categoryId}
                onChange={(value) =>
                  setValue('expense_category_id', value, {
                    shouldValidate: true,
                  })
                }
                categories={categories}
                invalid={Boolean(errors.expense_category_id)}
                onCreateNew={() => setIsCreateCategoryOpen(true)}
              />
              {errors.expense_category_id && (
                <p className="text-sm text-destructive">
                  {errors.expense_category_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Input
                id="description"
                placeholder="Contoh: Token listrik pos satpam Januari"
                aria-invalid={Boolean(errors.description)}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min={0.01}
                step={1000}
                placeholder="Contoh: 350000"
                aria-invalid={Boolean(errors.amount)}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expense_date">Tanggal Pengeluaran</Label>
              <Input
                id="expense_date"
                type="date"
                max={getTodayDateString()}
                aria-invalid={Boolean(errors.expense_date)}
                {...register('expense_date')}
              />
              {errors.expense_date && (
                <p className="text-sm text-destructive">
                  {errors.expense_date.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>

    <CreateExpenseCategoryDialog
      open={isCreateCategoryOpen}
      onOpenChange={setIsCreateCategoryOpen}
      onSuccess={handleCreateCategorySuccess}
    />
    </>
  )
}
