import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'

import { GenerateBillDialog } from '@/components/payments/GenerateBillDialog'
import { UnpaidBillMultiSelect } from '@/components/payments/UnpaidBillMultiSelect'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useBillList } from '@/hooks/useBills'
import { useHouseList } from '@/hooks/useHouses'
import { useCreatePayment } from '@/hooks/usePayments'
import { getTodayDateString } from '@/lib/validators/occupancySchema'
import {
  paymentSchema,
  toPaymentPayload,
  type PaymentFormValues,
} from '@/lib/validators/paymentSchema'
import { getApiErrorMessage } from '@/lib/utils'

export default function PaymentForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const createMutation = useCreatePayment()
  const [isGenerateOpen, setIsGenerateOpen] = useState(false)

  const prefillHouseId = searchParams.get('house_id') ?? ''
  const prefillBillIds =
    searchParams.get('bill_ids')?.split(',').filter(Boolean) ?? []

  const { data: housesData, isLoading: isHousesLoading } = useHouseList({
    per_page: 100,
    status: 'occupied',
  })

  const houses = housesData?.data ?? []

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
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      house_id: prefillHouseId,
      bill_ids: prefillBillIds,
      resident_id: '',
      payment_date: getTodayDateString(),
      notes: '',
    },
  })

  const houseId = watch('house_id')
  const billIds = watch('bill_ids')
  const residentId = watch('resident_id')

  const selectedHouse = houses.find((house) => String(house.id) === houseId)

  const activeResidents = useMemo(
    () =>
      selectedHouse?.current_residents.map((occupant) => occupant.resident) ??
      [],
    [selectedHouse],
  )

  const residentItems = useMemo(
    () =>
      activeResidents.map((resident) => ({
        value: String(resident.id),
        label: resident.full_name,
      })),
    [activeResidents],
  )

  const {
    data: billsData,
    isLoading: isBillsLoading,
    refetch: refetchBills,
  } = useBillList(
    {
      house_id: houseId ? Number(houseId) : undefined,
      is_paid: 0,
      per_page: 100,
    },
    { enabled: Boolean(houseId) },
  )

  const unpaidBills = billsData?.data ?? []

  useEffect(() => {
    if (!houseId || isBillsLoading) return

    if (
      residentId &&
      !activeResidents.some((resident) => String(resident.id) === residentId)
    ) {
      setValue('resident_id', '')
    }

    const validBillIds = billIds.filter((id) =>
      unpaidBills.some((bill) => String(bill.id) === id),
    )

    if (validBillIds.length !== billIds.length) {
      setValue('bill_ids', validBillIds, { shouldValidate: true })
    }
  }, [
    houseId,
    isBillsLoading,
    activeResidents,
    unpaidBills,
    billIds,
    residentId,
    setValue,
  ])

  const handleHouseChange = (nextHouseId: string) => {
    setValue('house_id', nextHouseId, { shouldValidate: true })
    setValue('bill_ids', [], { shouldValidate: true })
    setValue('resident_id', '', { shouldValidate: true })
  }

  const handleBillGenerated = async (billId: number) => {
    await refetchBills()

    const nextBillId = String(billId)
    if (!billIds.includes(nextBillId)) {
      setValue('bill_ids', [...billIds, nextBillId], { shouldValidate: true })
    }
  }

  const handleFormSubmit = (values: PaymentFormValues) => {
    createMutation.mutate(toPaymentPayload(values), {
      onSuccess: (payment) => navigate(`/payments/${payment.id}`),
    })
  }

  if (isHousesLoading) return <LoadingSpinner />

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader
        title="Catat Pembayaran"
        description="Catat pembayaran iuran dari penghuni. Data bersifat append-only dan tidak bisa diubah setelah disimpan."
        breadcrumbs={[
          { label: 'Pembayaran', to: '/payments' },
          { label: 'Catat' },
        ]}
        backTo="/payments"
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
              <Label htmlFor="house_id">Rumah</Label>
              <Select
                modal={false}
                value={houseId || null}
                items={houseItems}
                disabled={houseItems.length === 0}
                onValueChange={(value) => handleHouseChange(value ?? '')}
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
                <SelectContent align="start" side="bottom" sideOffset={4}>
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

            {houseId && (
              <>
                <div className="flex items-center justify-end">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setIsGenerateOpen(true)}
                  >
                    <PlusIcon data-icon="inline-start" />
                    Generate tagihan
                  </Button>
                </div>

                {isBillsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <UnpaidBillMultiSelect
                    id="bill_ids"
                    bills={unpaidBills}
                    value={billIds}
                    onChange={(value) =>
                      setValue('bill_ids', value, { shouldValidate: true })
                    }
                    invalid={Boolean(errors.bill_ids)}
                    emptyHint="Generate tagihan baru jika tagihan belum ada."
                  />
                )}
                {errors.bill_ids && (
                  <p className="text-sm text-destructive">
                    {errors.bill_ids.message}
                  </p>
                )}

                <div className="space-y-2">
                  <Label htmlFor="resident_id">Penghuni yang Bayar</Label>
                  <Select
                    modal={false}
                    value={residentId || null}
                    items={residentItems}
                    disabled={residentItems.length === 0}
                    onValueChange={(value) =>
                      setValue('resident_id', value ?? '', {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger
                      id="resident_id"
                      className="w-full"
                      aria-invalid={Boolean(errors.resident_id)}
                    >
                      <SelectValue
                        placeholder={
                          residentItems.length === 0
                            ? 'Tidak ada penghuni aktif di rumah ini'
                            : 'Pilih penghuni...'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent align="start" side="bottom" sideOffset={4}>
                      {residentItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.resident_id && (
                    <p className="text-sm text-destructive">
                      {errors.resident_id.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Hanya penghuni yang sedang menempati rumah ini yang bisa
                    dipilih.
                  </p>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="payment_date">Tanggal Pembayaran</Label>
              <Input
                id="payment_date"
                type="date"
                max={getTodayDateString()}
                aria-invalid={Boolean(errors.payment_date)}
                {...register('payment_date')}
              />
              {errors.payment_date && (
                <p className="text-sm text-destructive">
                  {errors.payment_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (opsional)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Contoh: Bayar iuran Januari–Maret"
                aria-invalid={Boolean(errors.notes)}
                {...register('notes')}
              />
              {errors.notes && (
                <p className="text-sm text-destructive">{errors.notes.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={createMutation.isPending || !houseId}
              className="w-full"
            >
              {createMutation.isPending ? 'Menyimpan...' : 'Simpan Pembayaran'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {houseId && selectedHouse && (
        <GenerateBillDialog
          open={isGenerateOpen}
          onOpenChange={setIsGenerateOpen}
          houseId={Number(houseId)}
          houseNumber={selectedHouse.house_number}
          onSuccess={handleBillGenerated}
        />
      )}
    </div>
  )
}
