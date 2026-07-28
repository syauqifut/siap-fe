import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { CreateResidentDialog } from '@/components/residents/CreateResidentDialog'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { ResidentSelect } from '@/components/occupancy/ResidentSelect'
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
import { useCheckIn } from '@/hooks/useOccupancy'
import { getEligibleResidentsForCheckIn } from '@/lib/occupancyUtils'
import {
  checkInSchema,
  getTodayDateString,
  toCheckInPayload,
  type CheckInFormValues,
} from '@/lib/validators/occupancySchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { House } from '@/types/house'
import type { Resident } from '@/types/resident'

interface CheckInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  house: House
  residents: Resident[]
  isResidentsLoading: boolean
}

export function CheckInDialog({
  open,
  onOpenChange,
  house,
  residents,
  isResidentsLoading,
}: CheckInDialogProps) {
  const checkInMutation = useCheckIn()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createdResident, setCreatedResident] = useState<Resident | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckInFormValues>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      resident_id: '',
      event_date: getTodayDateString(),
    },
  })

  const referenceType =
    house.current_residents.length > 0
      ? residents.find(
          (resident) =>
            resident.id === house.current_residents[0].resident.id,
        )?.resident_type
      : undefined

  const eligibleResidents = useMemo(() => {
    const base = getEligibleResidentsForCheckIn(
      residents,
      house.current_residents,
    )

    if (
      createdResident &&
      !base.some((resident) => resident.id === createdResident.id)
    ) {
      return [createdResident, ...base]
    }

    return base
  }, [residents, house.current_residents, createdResident])

  const selectedResidentId = watch('resident_id')

  useEffect(() => {
    if (!open) {
      checkInMutation.reset()
      setCreatedResident(null)
      return
    }

    reset({
      resident_id: '',
      event_date: getTodayDateString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleFormSubmit = (values: CheckInFormValues) => {
    checkInMutation.mutate(
      { houseId: house.id, payload: toCheckInPayload(values) },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  const handleCreateSuccess = (resident: Resident) => {
    setCreatedResident(resident)
    setValue('resident_id', String(resident.id), { shouldValidate: true })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Penghuni</DialogTitle>
            <DialogDescription>
              Catat penghuni masuk ke Rumah {house.house_number}.
              {referenceType && (
                <>
                  {' '}
                  Penghuni baru harus bertipe{' '}
                  {referenceType === 'permanent' ? 'Tetap' : 'Kontrak'} agar
                  sesuai dengan penghuni aktif di rumah ini.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {checkInMutation.error && (
              <ErrorMessage message={getApiErrorMessage(checkInMutation.error)} />
            )}

            <div className="space-y-2">
              <Label htmlFor="check_in_resident_id">Penghuni</Label>
              {isResidentsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Memuat daftar penghuni...
                </p>
              ) : (
                <ResidentSelect
                  id="check_in_resident_id"
                  value={selectedResidentId}
                  residents={eligibleResidents}
                  invalid={Boolean(errors.resident_id)}
                  onChange={(value) =>
                    setValue('resident_id', value, { shouldValidate: true })
                  }
                  onCreateNew={() => setIsCreateOpen(true)}
                />
              )}
              {errors.resident_id && (
                <p className="text-sm text-destructive">
                  {errors.resident_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_in_event_date">Tanggal Masuk</Label>
              <Input
                id="check_in_event_date"
                type="date"
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
              <Button
                type="submit"
                disabled={
                  checkInMutation.isPending ||
                  isResidentsLoading ||
                  !selectedResidentId
                }
              >
                {checkInMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <CreateResidentDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        lockResidentType={referenceType}
        description={
          referenceType
            ? `Penghuni baru harus bertipe ${
                referenceType === 'permanent' ? 'Tetap' : 'Kontrak'
              } agar bisa dimasukkan ke rumah ini.`
            : 'Data penghuni akan tersimpan ke sistem dan bisa langsung dipilih untuk check-in.'
        }
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
