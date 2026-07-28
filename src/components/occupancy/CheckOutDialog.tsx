import { useEffect, useMemo } from 'react'
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
import { useCheckOut } from '@/hooks/useOccupancy'
import {
  createCheckOutSchema,
  getTodayDateString,
  toCheckOutPayload,
  type CheckOutFormValues,
} from '@/lib/validators/occupancySchema'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import type { HouseOccupant } from '@/types/house'

interface CheckOutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  houseId: number
  houseNumber: string
  occupant: HouseOccupant | null
}

export function CheckOutDialog({
  open,
  onOpenChange,
  houseId,
  houseNumber,
  occupant,
}: CheckOutDialogProps) {
  const checkOutMutation = useCheckOut()
  const minDate = occupant?.occupied_since ?? getTodayDateString()

  const schema = useMemo(
    () => createCheckOutSchema(minDate),
    [minDate],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckOutFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      resident_id: '',
      event_date: getTodayDateString(),
    },
  })

  useEffect(() => {
    if (!open) {
      checkOutMutation.reset()
      return
    }

    if (!occupant) return

    reset({
      resident_id: String(occupant.resident.id),
      event_date: getTodayDateString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, occupant?.resident.id])

  const handleFormSubmit = (values: CheckOutFormValues) => {
    checkOutMutation.mutate(
      { houseId, payload: toCheckOutPayload(values) },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  if (!occupant) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keluarkan Penghuni</DialogTitle>
          <DialogDescription>
            Catat {occupant.resident.full_name} keluar dari Rumah{' '}
            {houseNumber}. Penghuni ini masuk sejak{' '}
            {formatDate(occupant.occupied_since)}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <input type="hidden" {...register('resident_id')} />

          {checkOutMutation.error && (
            <ErrorMessage message={getApiErrorMessage(checkOutMutation.error)} />
          )}

          <div className="space-y-2">
            <Label htmlFor="check_out_event_date">Tanggal Keluar</Label>
            <Input
              id="check_out_event_date"
              type="date"
              min={minDate}
              max={getTodayDateString()}
              aria-invalid={Boolean(errors.event_date)}
              {...register('event_date')}
            />
            {errors.event_date && (
              <p className="text-sm text-destructive">
                {errors.event_date.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Batal
            </DialogClose>
            <Button type="submit" disabled={checkOutMutation.isPending}>
              {checkOutMutation.isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
