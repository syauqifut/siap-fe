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
import { useCreateFeeType } from '@/hooks/useFeeTypes'
import {
  feeTypeSchema,
  toFeeTypePayload,
  type FeeTypeFormValues,
} from '@/lib/validators/feeTypeSchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { FeeType } from '@/types/feeType'

interface CreateFeeTypeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (feeType: FeeType) => void
}

export function CreateFeeTypeDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateFeeTypeDialogProps) {
  const createMutation = useCreateFeeType()

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeeTypeFormValues>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      name: '',
      amount: undefined,
      is_recurring: true,
      due_day: 10,
    },
  })

  const isRecurring = watch('is_recurring')

  useEffect(() => {
    if (!open) {
      createMutation.reset()
      return
    }

    reset({
      name: '',
      amount: undefined,
      is_recurring: true,
      due_day: 10,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFormSubmit = (values: FeeTypeFormValues) => {
    createMutation.mutate(toFeeTypePayload(values), {
      onSuccess: (feeType) => {
        onSuccess(feeType)
        onOpenChange(false)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[70] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tambah Jenis Iuran</DialogTitle>
          <DialogDescription>
            Jenis iuran baru akan langsung bisa dipilih setelah disimpan.
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
            <Label htmlFor="create_fee_type_name">Nama Jenis Iuran</Label>
            <Input
              id="create_fee_type_name"
              placeholder="Contoh: Satpam"
              aria-invalid={Boolean(errors.name)}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="create_fee_type_amount">Nominal (Rp)</Label>
            <Input
              id="create_fee_type_amount"
              type="number"
              min={0}
              step={1000}
              placeholder="Contoh: 100000"
              aria-invalid={Boolean(errors.amount)}
              {...register('amount', { valueAsNumber: true })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                className="accent-primary"
                {...register('is_recurring', {
                  onChange: (event) => {
                    if (!event.target.checked) {
                      setValue('due_day', null)
                    }
                  },
                })}
              />
              Iuran rutin bulanan
            </label>
            <p className="text-xs text-muted-foreground">
              Nonaktifkan untuk iuran sekali jalan (misal acara).
            </p>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <Label htmlFor="create_fee_type_due_day">
                Tanggal Jatuh Tempo (per bulan)
              </Label>
              <Input
                id="create_fee_type_due_day"
                type="number"
                min={1}
                max={31}
                placeholder="Contoh: 10"
                aria-invalid={Boolean(errors.due_day)}
                {...register('due_day', { valueAsNumber: true })}
              />
              {errors.due_day && (
                <p className="text-sm text-destructive">
                  {errors.due_day.message}
                </p>
              )}
            </div>
          )}

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
