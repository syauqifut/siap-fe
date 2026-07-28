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
import { useCreateHouse, useHouse, useUpdateHouse } from '@/hooks/useHouses'
import { houseSchema, type HouseFormValues } from '@/lib/validators/houseSchema'
import { getApiErrorMessage } from '@/lib/utils'

export default function HouseForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const {
    data: house,
    isLoading: isHouseLoading,
    error: houseError,
  } = useHouse(id)
  const createMutation = useCreateHouse()
  const updateMutation = useUpdateHouse()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HouseFormValues>({
    resolver: zodResolver(houseSchema),
    defaultValues: { house_number: '' },
    values: house ? { house_number: house.house_number } : undefined,
  })

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = isEdit ? updateMutation.error : createMutation.error

  const handleFormSubmit = (values: HouseFormValues) => {
    if (isEdit && id) {
      updateMutation.mutate(
        { id, payload: values },
        { onSuccess: () => navigate('/houses') },
      )
    } else {
      createMutation.mutate(values, { onSuccess: () => navigate('/houses') })
    }
  }

  if (isEdit && isHouseLoading) return <LoadingSpinner />
  if (isEdit && houseError)
    return <ErrorMessage message={getApiErrorMessage(houseError)} />

  return (
    <div className="max-w-md space-y-4">
      <PageHeader
        title={isEdit ? 'Edit Rumah' : 'Tambah Rumah'}
        description={
          isEdit
            ? `Ubah nomor rumah ${house?.house_number ?? ''}.`
            : 'Tambahkan nomor rumah baru.'
        }
        breadcrumbs={[
          { label: 'Rumah', to: '/houses' },
          ...(isEdit && house
            ? [
                { label: house.house_number, to: `/houses/${house.id}` },
                { label: 'Edit' },
              ]
            : [{ label: 'Tambah' }]),
        ]}
        backTo="/houses"
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
              <Label htmlFor="house_number">Nomor Rumah</Label>
              <Input
                id="house_number"
                placeholder="Contoh: A-01"
                aria-invalid={Boolean(errors.house_number)}
                {...register('house_number')}
              />
              {errors.house_number && (
                <p className="text-sm text-destructive">
                  {errors.house_number.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Simpan'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
