import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { zodResolver } from '@hookform/resolvers/zod'

import { ResidentFormFields } from '@/components/residents/ResidentFormFields'
import { ErrorMessage } from '@/components/shared/ErrorMessage'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  useCreateResident,
  useResident,
  useUpdateResident,
} from '@/hooks/useResidents'
import { useResidentPhoto } from '@/hooks/useResidentPhoto'
import {
  residentSchema,
  type ResidentFormValues,
} from '@/lib/validators/residentSchema'
import { getApiErrorMessage } from '@/lib/utils'

export default function ResidentForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const {
    data: resident,
    isLoading: isResidentLoading,
    error: residentError,
  } = useResident(id)
  const createMutation = useCreateResident()
  const updateMutation = useUpdateResident()
  const photo = useResidentPhoto(
    isEdit ? (resident?.id_card_photo_url ?? null) : null,
  )

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResidentFormValues>({
    resolver: zodResolver(residentSchema),
    defaultValues: {
      full_name: '',
      phone_number: '',
      is_married: false,
    },
    values: resident
      ? {
          full_name: resident.full_name,
          gender: resident.gender,
          resident_type: resident.resident_type,
          phone_number: resident.phone_number,
          is_married: resident.is_married,
        }
      : undefined,
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = isEdit ? updateMutation.error : createMutation.error

  const handleFormSubmit = (values: ResidentFormValues) => {
    if (isEdit && id) {
      updateMutation.mutate(
        {
          id,
          payload: values,
          photo:
            photo.photoFile ??
            (photo.isPhotoRemoved ? null : undefined),
        },
        { onSuccess: () => navigate(`/residents/${id}`) },
      )
    } else {
      createMutation.mutate(
        { payload: values, photo: photo.photoFile ?? undefined },
        { onSuccess: () => navigate('/residents') },
      )
    }
  }

  if (isEdit && isResidentLoading) return <LoadingSpinner />
  if (isEdit && residentError)
    return <ErrorMessage message={getApiErrorMessage(residentError)} />

  return (
    <div className="max-w-lg space-y-4">
      <PageHeader
        title={isEdit ? 'Edit Penghuni' : 'Tambah Penghuni'}
        description={
          isEdit
            ? `Ubah data penghuni ${resident?.full_name ?? ''}.`
            : 'Tambahkan data penghuni baru.'
        }
        breadcrumbs={[
          { label: 'Penghuni', to: '/residents' },
          ...(isEdit && resident
            ? [
                { label: resident.full_name, to: `/residents/${resident.id}` },
                { label: 'Edit' },
              ]
            : [{ label: 'Tambah' }]),
        ]}
        backTo={isEdit && id ? `/residents/${id}` : '/residents'}
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

            <ResidentFormFields
              register={register}
              errors={errors}
              photo={photo}
              showExistingPhoto={isEdit}
            />

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
