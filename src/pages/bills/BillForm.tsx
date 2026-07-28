import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { CreateFeeTypeDialog } from '@/components/bills/CreateFeeTypeDialog'
import { FeeTypeSelect } from '@/components/bills/FeeTypeSelect'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCreateBill } from '@/hooks/useBills'
import { useFeeTypeList } from '@/hooks/useFeeTypes'
import { useHouseList } from '@/hooks/useHouses'
import {
  applyFeeTypeDefaults,
  billSchema,
  toBillPayload,
  type BillFormInput,
  type BillFormValues,
} from '@/lib/validators/billSchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { FeeType } from '@/types/feeType'

export default function BillForm() {
  const navigate = useNavigate()
  const createMutation = useCreateBill()
  const [pendingValues, setPendingValues] = useState<BillFormValues | null>(null)
  const [bulkSuccessMessage, setBulkSuccessMessage] = useState<string | null>(
    null,
  )
  const [isCreateFeeTypeOpen, setIsCreateFeeTypeOpen] = useState(false)
  const [createdFeeType, setCreatedFeeType] = useState<FeeType | null>(null)

  const { data: housesData, isLoading: isHousesLoading } = useHouseList({
    per_page: 100,
    status: 'occupied',
  })
  const { data: feeTypesData, isLoading: isFeeTypesLoading } = useFeeTypeList({
    per_page: 100,
  })

  const houses = housesData?.data ?? []
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

  const houseItems = useMemo(
    () =>
      houses.map((house) => ({
        value: String(house.id),
        label: house.house_number,
      })),
    [houses],
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BillFormInput, unknown, BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      target: 'all',
      house_id: '',
      fee_type_id: '',
      due_date: '',
      amount: undefined,
    },
  })

  const target = watch('target')
  const houseId = watch('house_id')
  const feeTypeId = watch('fee_type_id')

  const selectedFeeType = feeTypes.find(
    (feeType) => String(feeType.id) === feeTypeId,
  )

  const handleFeeTypeChange = (nextFeeTypeId: string) => {
    setValue('fee_type_id', nextFeeTypeId, { shouldValidate: true })

    const feeType = feeTypes.find(
      (item) => String(item.id) === nextFeeTypeId,
    )

    if (!feeType) return

    const defaults = applyFeeTypeDefaults(feeType)
    setValue('amount', defaults.amount, { shouldValidate: true })
    setValue('due_date', defaults.due_date, { shouldValidate: true })
  }

  const handleCreateFeeTypeSuccess = (feeType: FeeType) => {
    setCreatedFeeType(feeType)
    handleFeeTypeChange(String(feeType.id))
  }

  const submitBill = (values: BillFormValues) => {
    createMutation.mutate(toBillPayload(values), {
      onSuccess: (result) => {
        setPendingValues(null)

        if (result.mode === 'single') {
          navigate(`/bills/${result.bill.id}`)
          return
        }

        setBulkSuccessMessage(
          `${result.summary.created} tagihan dibuat, ${result.summary.skipped} dilewati (sudah ada).`,
        )
      },
    })
  }

  const handleFormSubmit = (values: BillFormValues) => {
    if (values.target === 'all') {
      setPendingValues(values)
      return
    }

    submitBill(values)
  }

  const handleBulkConfirm = () => {
    if (!pendingValues) return
    submitBill(pendingValues)
  }

  const handleBulkDialogChange = (open: boolean) => {
    if (!open) {
      setPendingValues(null)
      createMutation.reset()
    }
  }

  if (isHousesLoading || isFeeTypesLoading) return <LoadingSpinner />

  const selectedFeeTypeName = selectedFeeType?.name ?? '—'
  const selectedDueDate = pendingValues?.due_date
    ? new Date(pendingValues.due_date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—'

  return (
    <>
      <div className="max-w-md space-y-4">
        <PageHeader
          title="Buat Tagihan"
          description="Buat tagihan manual untuk satu rumah atau semua rumah yang sedang dihuni."
          breadcrumbs={[
            { label: 'Tagihan', to: '/bills' },
            { label: 'Buat' },
          ]}
          backTo="/bills"
        />

        {bulkSuccessMessage && (
          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                {bulkSuccessMessage}
              </p>
              <Button render={<Link to="/bills" />} variant="outline">
                Lihat Daftar Tagihan
              </Button>
            </CardContent>
          </Card>
        )}

        {!bulkSuccessMessage && (
          <Card>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className="space-y-4"
                noValidate
              >
                {createMutation.error && (
                  <ErrorMessage
                    message={getApiErrorMessage(createMutation.error)}
                  />
                )}

                <div className="space-y-2">
                  <Label>Target Generate</Label>
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="all"
                        className="accent-primary"
                        {...register('target')}
                      />
                      Semua rumah dihuni
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        value="single"
                        className="accent-primary"
                        {...register('target', {
                          onChange: () => {
                            setValue('house_id', '')
                          },
                        })}
                      />
                      Satu rumah
                    </label>
                  </div>
                </div>

                {target === 'all' && (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                    Tagihan akan digenerate ke semua rumah yang sedang dihuni.
                    Kombinasi rumah + jenis iuran + periode yang sudah ada akan
                    dilewati.
                  </p>
                )}

                {target === 'single' && (
                  <div className="space-y-2">
                    <Label htmlFor="house_id">Rumah</Label>
                    <Select
                      modal={false}
                      value={houseId || null}
                      items={houseItems}
                      disabled={houseItems.length === 0}
                      onValueChange={(value) =>
                        setValue('house_id', value ?? '', {
                          shouldValidate: true,
                        })
                      }
                    >
                      <SelectTrigger
                        id="house_id"
                        className="w-full"
                        aria-invalid={Boolean(errors.house_id)}
                      >
                        <SelectValue
                          placeholder={
                            houseItems.length === 0
                              ? 'Tidak ada rumah dihuni'
                              : 'Pilih rumah...'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        align="start"
                        side="bottom"
                        sideOffset={4}
                      >
                        {houseItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.house_id && (
                      <p className="text-sm text-destructive">
                        {errors.house_id.message}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fee_type_id">Jenis Iuran</Label>
                  <FeeTypeSelect
                    id="fee_type_id"
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
                  <Label htmlFor="amount">Nominal (Rp)</Label>
                  <Input
                    id="amount"
                    type="number"
                    min={0}
                    step={1000}
                    placeholder="Pilih jenis iuran terlebih dahulu"
                    disabled={!feeTypeId}
                    aria-invalid={Boolean(errors.amount)}
                    {...register('amount', { valueAsNumber: true })}
                  />
                  {errors.amount && (
                    <p className="text-sm text-destructive">
                      {errors.amount.message}
                    </p>
                  )}
                  {selectedFeeType && (
                    <p className="text-xs text-muted-foreground">
                      Terisi otomatis dari jenis iuran. Bisa diubah jika
                      diperlukan.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Tanggal Jatuh Tempo</Label>
                  <Input
                    id="due_date"
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
                  <p className="text-xs text-muted-foreground">
                    {selectedFeeType?.is_recurring && selectedFeeType.due_day
                      ? `Default: tanggal ${selectedFeeType.due_day} bulan berjalan. Periode tagihan mengikuti bulan/tahun tanggal ini.`
                      : 'Periode tagihan diidentifikasi dari bulan dan tahun tanggal ini.'}
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending
                    ? 'Menyimpan...'
                    : target === 'all'
                      ? 'Generate ke Semua Rumah'
                      : 'Buat Tagihan'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={Boolean(pendingValues)} onOpenChange={handleBulkDialogChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate ke Semua Rumah?</DialogTitle>
            <DialogDescription>
              Tagihan {selectedFeeTypeName} dengan jatuh tempo {selectedDueDate}{' '}
              akan dibuat untuk semua rumah dihuni. Tagihan yang sudah ada untuk
              periode yang sama akan dilewati.
            </DialogDescription>
          </DialogHeader>
          {createMutation.error && (
            <ErrorMessage message={getApiErrorMessage(createMutation.error)} />
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Batal</DialogClose>
            <Button disabled={createMutation.isPending} onClick={handleBulkConfirm}>
              {createMutation.isPending ? 'Memproses...' : 'Generate'}
            </Button>
          </DialogFooter>
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
