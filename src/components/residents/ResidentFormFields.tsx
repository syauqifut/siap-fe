import type { FieldErrors, UseFormRegister } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { useResidentPhoto } from '@/hooks/useResidentPhoto'
import type { ResidentFormValues } from '@/lib/validators/residentSchema'
import type { ResidentType } from '@/types/resident'

const GENDER_OPTIONS = [
  { label: 'Laki-laki', value: 'male' },
  { label: 'Perempuan', value: 'female' },
] as const

const TYPE_OPTIONS = [
  { label: 'Tetap', value: 'permanent' },
  { label: 'Kontrak', value: 'contract' },
] as const

interface ResidentFormFieldsProps {
  idPrefix?: string
  register: UseFormRegister<ResidentFormValues>
  errors: FieldErrors<ResidentFormValues>
  photo: ReturnType<typeof useResidentPhoto>
  lockResidentType?: ResidentType
  showExistingPhoto?: boolean
}

export function ResidentFormFields({
  idPrefix = '',
  register,
  errors,
  photo,
  lockResidentType,
  showExistingPhoto = false,
}: ResidentFormFieldsProps) {
  const fieldId = (name: string) => `${idPrefix}${name}`

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={fieldId('full_name')}>Nama Lengkap</Label>
        <Input
          id={fieldId('full_name')}
          placeholder="Contoh: Syauqi"
          aria-invalid={Boolean(errors.full_name)}
          {...register('full_name')}
        />
        {errors.full_name && (
          <p className="text-sm text-destructive">{errors.full_name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Jenis Kelamin</Label>
        <div className="flex gap-4">
          {GENDER_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                value={option.value}
                className="accent-primary"
                {...register('gender')}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.gender && (
          <p className="text-sm text-destructive">{errors.gender.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tipe Penghuni</Label>
        <div className="flex gap-4">
          {TYPE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="radio"
                value={option.value}
                className="accent-primary"
                disabled={
                  lockResidentType !== undefined &&
                  option.value !== lockResidentType
                }
                {...register('resident_type')}
              />
              {option.label}
            </label>
          ))}
        </div>
        {errors.resident_type && (
          <p className="text-sm text-destructive">
            {errors.resident_type.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId('phone_number')}>No. Telepon</Label>
        <Input
          id={fieldId('phone_number')}
          type="tel"
          placeholder="Contoh: 081234567890"
          aria-invalid={Boolean(errors.phone_number)}
          {...register('phone_number')}
        />
        {errors.phone_number && (
          <p className="text-sm text-destructive">
            {errors.phone_number.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            className="accent-primary"
            {...register('is_married')}
          />
          Sudah menikah
        </label>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fieldId('id_card_photo')}>Foto KTP (opsional)</Label>

        {showExistingPhoto && photo.existingPhotoUrl && (
          <div className="space-y-2">
            <img
              src={photo.existingPhotoUrl}
              alt="Foto KTP saat ini"
              className="max-h-40 rounded-lg border"
            />
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={photo.handlePhotoRemove}
            >
              Hapus Foto
            </Button>
          </div>
        )}

        {photo.photoPreviewUrl && (
          <img
            src={photo.photoPreviewUrl}
            alt="Preview foto KTP baru"
            className="max-h-40 rounded-lg border"
          />
        )}

        {showExistingPhoto && photo.isPhotoRemoved && (
          <p className="text-sm text-muted-foreground">
            Foto akan dihapus saat disimpan.
          </p>
        )}

        <Input
          id={fieldId('id_card_photo')}
          type="file"
          accept={photo.allowedPhotoTypes.join(',')}
          onChange={photo.handlePhotoChange}
        />
        <p className="text-xs text-muted-foreground">
          Format JPEG, PNG, atau WebP. Maksimal 2 MB.
        </p>
        {photo.photoError && (
          <p className="text-sm text-destructive">{photo.photoError}</p>
        )}
      </div>
    </>
  )
}
