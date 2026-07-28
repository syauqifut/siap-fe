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
import { useCreateFeeType, useFeeType, useUpdateFeeType } from '@/hooks/useFeeTypes'
import {
  feeTypeSchema,
  toFeeTypePayload,
  type FeeTypeFormValues,
} from '@/lib/validators/feeTypeSchema'
import { getApiErrorMessage } from '@/lib/utils'

export default function FeeTypeForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const {
    data: feeType,
    isLoading: isFeeTypeLoading,
    error: feeTypeError,
  } = useFeeType(id)
  const createMutation = useCreateFeeType()
  const updateMutation = useUpdateFeeType()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FeeTypeFormValues>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      name: '',
      amount: 0,
      is_recurring: true,
      due_day: 10,
    },
    values: feeType
      ? {
          name: feeType.name,
          amount: Number(feeType.amount),
          is_recurring: feeType.is_recurring,
          due_day: feeType.due_day,
        }
      : undefined,
  })

  const isRecurring = watch('is_recurring')

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = isEdit ? updateMutation.error : createMutation.error

  const handleFormSubmit = (values: FeeTypeFormValues) => {
    const payload = toFeeTypePayload(values)

    if (isEdit && id) {
      updateMutation.mutate(
        { id, payload },
        { onSuccess: () => navigate('/master-data/fee-types') },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/master-data/fee-types'),
      })
    }
  }

  if (isEdit && isFeeTypeLoading) return <LoadingSpinner />
  if (isEdit && feeTypeError)
    return <ErrorMessage message={getApiErrorMessage(feeTypeError)} />

  return (
    <div className="max-w-md space-y-4">
      <PageHeader
        title={isEdit ? 'Edit Jenis Iuran' : 'Tambah Jenis Iuran'}
        description={
          isEdit
            ? `Ubah jenis iuran ${feeType?.name ?? ''}.`
            : 'Tambahkan jenis iuran baru.'
        }
        breadcrumbs={[
          { label: 'Master Data' },
          { label: 'Jenis Iuran', to: '/master-data/fee-types' },
          isEdit
            ? { label: feeType ? `Edit ${feeType.name}` : 'Edit' }
            : { label: 'Tambah' },
        ]}
        backTo="/master-data/fee-types"
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
              <Label htmlFor="name">Nama Jenis Iuran</Label>
              <Input
                id="name"
                placeholder="Contoh: Satpam"
                aria-invalid={Boolean(errors.name)}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Nominal (Rp)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step={1000}
                placeholder="Contoh: 100000"
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
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="accent-primary"
                  {...register('is_recurring', {
                    onChange: (e) => {
                      if (!e.target.checked) {
                        setValue('due_day', null)
                      }
                    },
                  })}
                />
                Iuran rutin bulanan
              </label>
              <p className="text-xs text-muted-foreground">
                Nonaktifkan untuk iuran sekali jalan (misal acara 17 Agustusan).
                Tanggal jatuh tempo ditentukan manual saat tagihan dibuat.
              </p>
            </div>

            {isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="due_day">Tanggal Jatuh Tempo (per bulan)</Label>
                <Input
                  id="due_day"
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
