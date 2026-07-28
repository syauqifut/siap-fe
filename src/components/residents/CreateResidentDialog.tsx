import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { ResidentFormFields } from '@/components/residents/ResidentFormFields'
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
import { useCreateResident } from '@/hooks/useResidents'
import { useResidentPhoto } from '@/hooks/useResidentPhoto'
import {
  residentSchema,
  type ResidentFormValues,
} from '@/lib/validators/residentSchema'
import { getApiErrorMessage } from '@/lib/utils'
import type { Resident, ResidentType } from '@/types/resident'

interface CreateResidentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (resident: Resident) => void
  defaultResidentType?: ResidentType
  lockResidentType?: ResidentType
  description?: string
}

export function CreateResidentDialog({
  open,
  onOpenChange,
  onSuccess,
  defaultResidentType,
  lockResidentType,
  description = 'Tambahkan data penghuni baru ke sistem.',
}: CreateResidentDialogProps) {
  const createMutation = useCreateResident()
  const photo = useResidentPhoto()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      is_married: false,
      resident_type: defaultResidentType,
    },
  })

  useEffect(() => {
    if (!open) {
      createMutation.reset()
      return
    }

    reset({
      full_name: '',
      phone_number: '',
      is_married: false,
      resident_type: lockResidentType ?? defaultResidentType,
    })
    photo.resetPhoto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, lockResidentType, defaultResidentType])

  const handleFormSubmit = (values: ResidentFormValues) => {
    createMutation.mutate(
      { payload: values, photo: photo.photoFile ?? undefined },
      {
        onSuccess: (resident) => {
          onSuccess(resident)
          onOpenChange(false)
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="z-[70] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Tambah Penghuni Baru</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1">
            {createMutation.error && (
              <ErrorMessage message={getApiErrorMessage(createMutation.error)} />
            )}

            <ResidentFormFields
              idPrefix="create_resident_"
              register={register}
              errors={errors}
              photo={photo}
              lockResidentType={lockResidentType}
            />
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
