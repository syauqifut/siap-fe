import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { CreateFeeTypeDialog } from '@/components/bills/CreateFeeTypeDialog'
import { FeeTypeSelect } from '@/components/bills/FeeTypeSelect'
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
import { useCreateBill } from '@/hooks/useBills'
import { useFeeTypeList } from '@/hooks/useFeeTypes'
import {
  applyFeeTypeDefaults,
  singleHouseBillSchema,
  toSingleHouseBillPayload,
  type SingleHouseBillFormInput,
  type SingleHouseBillFormValues,
} from '@/lib/validators/billSchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { FeeType } from '@/types/feeType'

interface GenerateBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  houseId: number
  houseNumber: string
  onSuccess: (billId: number) => void
}

export function GenerateBillDialog({
  open,
  onOpenChange,
  houseId,
  houseNumber,
  onSuccess,
}: GenerateBillDialogProps) {
  const createMutation = useCreateBill()
  const [isCreateFeeTypeOpen, setIsCreateFeeTypeOpen] = useState(false)
  const [createdFeeType, setCreatedFeeType] = useState<FeeType | null>(null)

  const { data: feeTypesData } = useFeeTypeList({ per_page: 100 })

  const feeTypes = useMemo(() => {
    const base = feeTypesData?.data ?? []

    if (
      createdFeeType &&
      !base.some((feeType) => feeType.id === createdFeeType.id)
    ) {
      return [createdFeeType, ...base]
    }

    return base
  }, [feeTypesData?.data, createdFeeType])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SingleHouseBillFormInput, unknown, SingleHouseBillFormValues>({
    resolver: zodResolver(singleHouseBillSchema),
    defaultValues: {
      fee_type_id: '',
      due_date: '',
      amount: undefined,
    },
  })

  const feeTypeId = watch('fee_type_id')

  const selectedFeeType = feeTypes.find(
    (feeType) => String(feeType.id) === feeTypeId,
  )

  useEffect(() => {
    if (!open) {
      createMutation.reset()
      reset({
        fee_type_id: '',
        due_date: '',
        amount: undefined,
      })
      return
    }

    reset({
      fee_type_id: '',
      due_date: '',
      amount: undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFeeTypeChange = (nextFeeTypeId: string) => {
    setValue('fee_type_id', nextFeeTypeId, { shouldValidate: true })

    const feeType = feeTypes.find((item) => String(item.id) === nextFeeTypeId)

    if (!feeType) return

    const defaults = applyFeeTypeDefaults(feeType)
    setValue('amount', defaults.amount, { shouldValidate: true })
    setValue('due_date', defaults.due_date, { shouldValidate: true })
  }

  const handleCreateFeeTypeSuccess = (feeType: FeeType) => {
    setCreatedFeeType(feeType)
    handleFeeTypeChange(String(feeType.id))
  }

  const handleFormSubmit = (values: SingleHouseBillFormValues) => {
    createMutation.mutate(toSingleHouseBillPayload(houseId, values), {
      onSuccess: (result) => {
        if (result.mode !== 'single') return

        onSuccess(result.bill.id)
        onOpenChange(false)
      },
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Tagihan</DialogTitle>
            <DialogDescription>
              Buat tagihan baru untuk rumah {houseNumber}. Tagihan akan langsung
              bisa dipilih untuk dibayar.
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
              <Label htmlFor="generate_fee_type_id">Jenis Iuran</Label>
              <FeeTypeSelect
                id="generate_fee_type_id"
                value={feeTypeId}
                feeTypes={feeTypes}
                invalid={Boolean(errors.fee_type_id)}
                onChange={handleFeeTypeChange}
                onCreateNew={() => setIsCreateFeeTypeOpen(true)}
              />
              {errors.fee_type_id && (
                <p className="text-sm text-destructive">
                  {errors.fee_type_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="generate_due_date">Tanggal Jatuh Tempo</Label>
              <Input
                id="generate_due_date"
                type="date"
                disabled={!feeTypeId}
                aria-invalid={Boolean(errors.due_date)}
                {...register('due_date')}
              />
              {errors.due_date && (
                <p className="text-sm text-destructive">
                  {errors.due_date.message}
                </p>
              )}
              {selectedFeeType && (
                <p className="text-xs text-muted-foreground">
                  {selectedFeeType.is_recurring && selectedFeeType.due_day
                    ? `Default: tanggal ${selectedFeeType.due_day} bulan berjalan.`
                    : 'Periode tagihan mengikuti bulan/tahun tanggal ini.'}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="generate_amount">Nominal (Rp)</Label>
              <Input
                id="generate_amount"
                type="number"
                min={0}
                step={1000}
                disabled={!feeTypeId}
                placeholder="Pilih jenis iuran terlebih dahulu"
                aria-invalid={Boolean(errors.amount)}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-destructive">
                  {errors.amount.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Batal
              </DialogClose>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Memproses...' : 'Generate'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateFeeTypeDialog
        open={isCreateFeeTypeOpen}
        onOpenChange={setIsCreateFeeTypeOpen}
        onSuccess={handleCreateFeeTypeSuccess}
      />
    </>
  )
}
