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
import { useReplaceResident } from '@/hooks/useOccupancy'
import { getEligibleResidentsForReplace } from '@/lib/occupancyUtils'
import {
  createReplaceResidentSchema,
  getTodayDateString,
  toReplaceResidentPayload,
  type ReplaceResidentFormValues,
} from '@/lib/validators/occupancySchema'
import { formatDate, getApiErrorMessage } from '@/lib/utils'
import type { House, HouseOccupant } from '@/types/house'
import type { Resident } from '@/types/resident'

interface ReplaceResidentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  house: House
  occupant: HouseOccupant | null
  residents: Resident[]
  isResidentsLoading: boolean
}

export function ReplaceResidentDialog({
  open,
  onOpenChange,
  house,
  occupant,
  residents,
  isResidentsLoading,
}: ReplaceResidentDialogProps) {
  const replaceMutation = useReplaceResident()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createdResident, setCreatedResident] = useState<Resident | null>(null)
  const minDate = occupant?.occupied_since ?? getTodayDateString()

  const schema = useMemo(
    () => createReplaceResidentSchema(minDate),
    [minDate],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReplaceResidentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      old_resident_id: '',
      new_resident_id: '',
      event_date: getTodayDateString(),
    },
  })

  const remainingOccupants = occupant
    ? house.current_residents.filter(
        (item) => item.resident.id !== occupant.resident.id,
      )
    : []

  const referenceType =
    remainingOccupants.length > 0
      ? residents.find(
          (resident) =>
            resident.id === remainingOccupants[0].resident.id,
        )?.resident_type
      : undefined

  const eligibleResidents = useMemo(() => {
    if (!occupant) return []

    const base = getEligibleResidentsForReplace(
      residents,
      house.current_residents,
      occupant.resident.id,
    )

    if (
      createdResident &&
      !base.some((resident) => resident.id === createdResident.id)
    ) {
      return [createdResident, ...base]
    }

    return base
  }, [residents, house.current_residents, occupant, createdResident])

  const selectedNewResidentId = watch('new_resident_id')

  useEffect(() => {
    if (!open) {
      replaceMutation.reset()
      setCreatedResident(null)
      return
    }

    if (!occupant) return

    reset({
      old_resident_id: String(occupant.resident.id),
      new_resident_id: '',
      event_date: getTodayDateString(),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, occupant?.resident.id])

  const handleFormSubmit = (values: ReplaceResidentFormValues) => {
    replaceMutation.mutate(
      { houseId: house.id, payload: toReplaceResidentPayload(values) },
      { onSuccess: () => onOpenChange(false) },
    )
  }

  const handleCreateSuccess = (resident: Resident) => {
    setCreatedResident(resident)
    setValue('new_resident_id', String(resident.id), { shouldValidate: true })
  }

  if (!occupant) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ganti Penghuni</DialogTitle>
            <DialogDescription>
              Ganti {occupant.resident.full_name} dengan penghuni lain di Rumah{' '}
              {house.house_number}. Penghuni lama masuk sejak{' '}
              {formatDate(occupant.occupied_since)}.
              {referenceType && (
                <>
                  {' '}
                  Penghuni pengganti harus bertipe{' '}
                  {referenceType === 'permanent' ? 'Tetap' : 'Kontrak'}.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <input type="hidden" {...register('old_resident_id')} />

            {replaceMutation.error && (
              <ErrorMessage message={getApiErrorMessage(replaceMutation.error)} />
            )}

            <div className="space-y-2">
              <Label htmlFor="replace_new_resident_id">Penghuni Pengganti</Label>
              {isResidentsLoading ? (
                <p className="text-sm text-muted-foreground">
                  Memuat daftar penghuni...
                </p>
              ) : (
                <ResidentSelect
                  id="replace_new_resident_id"
                  value={selectedNewResidentId}
                  residents={eligibleResidents}
                  placeholder="Pilih penghuni pengganti..."
                  invalid={Boolean(errors.new_resident_id)}
                  onChange={(value) =>
                    setValue('new_resident_id', value, { shouldValidate: true })
                  }
                  onCreateNew={() => setIsCreateOpen(true)}
                />
              )}
              {errors.new_resident_id && (
                <p className="text-sm text-destructive">
                  {errors.new_resident_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="replace_event_date">Tanggal Penggantian</Label>
              <Input
                id="replace_event_date"
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
              <Button
                type="submit"
                disabled={
                  replaceMutation.isPending ||
                  isResidentsLoading ||
                  !selectedNewResidentId
                }
              >
                {replaceMutation.isPending ? 'Menyimpan...' : 'Simpan'}
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
            ? `Penghuni pengganti harus bertipe ${
                referenceType === 'permanent' ? 'Tetap' : 'Kontrak'
              } agar bisa dimasukkan ke rumah ini.`
            : 'Data penghuni akan tersimpan ke sistem dan bisa langsung dipilih sebagai pengganti.'
        }
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}
