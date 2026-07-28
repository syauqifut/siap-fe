import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateExpenseCategory } from '@/hooks/useExpenseCategories'
import {
  expenseCategorySchema,
  type ExpenseCategoryFormValues,
} from '@/lib/validators/expenseCategorySchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { ExpenseCategory } from '@/types/expenseCategory'

interface CreateExpenseCategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (category: ExpenseCategory) => void
}

export function CreateExpenseCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateExpenseCategoryDialogProps) {
  const createMutation = useCreateExpenseCategory()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseCategoryFormValues>({
    resolver: zodResolver(expenseCategorySchema),
    defaultValues: { name: '' },
  })

  useEffect(() => {
    if (!open) {
      createMutation.reset()
      return
    }

    reset({ name: '' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFormSubmit = (values: ExpenseCategoryFormValues) => {
    createMutation.mutate(values, {
      onSuccess: (category) => {
        onSuccess(category)
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[70] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Kategori Pengeluaran</DialogTitle>
          <DialogDescription>
            Kategori baru akan langsung bisa dipilih setelah disimpan.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          noValidate
        >
          {createMutation.error && (
            <ErrorMessage message={getApiErrorMessage(createMutation.error)} />
          )}

          <div className="space-y-2">
            <Label htmlFor="create_category_name">Nama Kategori</Label>
            <Input
              id="create_category_name"
              placeholder="Contoh: Gaji Satpam"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
