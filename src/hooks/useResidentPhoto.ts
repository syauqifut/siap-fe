import { useState, type ChangeEvent } from 'react'

const MAX_PHOTO_SIZE = 2 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export function useResidentPhoto(initialPhotoUrl?: string | null) {
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false)

  const existingPhotoUrl =
    !isPhotoRemoved && !photoFile ? (initialPhotoUrl ?? null) : null

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Format foto harus JPEG, PNG, atau WebP')
      e.target.value = ''
      return
    }

    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('Ukuran foto maksimal 2 MB')
      e.target.value = ''
      return
    }

    setPhotoError(null)
    setIsPhotoRemoved(false)
    setPhotoFile(file)
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return URL.createObjectURL(file)
    })
  }

  const handlePhotoRemove = () => {
    setPhotoFile(null)
    setPhotoError(null)
    setIsPhotoRemoved(true)
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  const resetPhoto = () => {
    setPhotoFile(null)
    setPhotoError(null)
    setIsPhotoRemoved(false)
    setPhotoPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }

  return {
    photoFile,
    photoPreviewUrl,
    photoError,
    isPhotoRemoved,
    existingPhotoUrl,
    handlePhotoChange,
    handlePhotoRemove,
    resetPhoto,
    allowedPhotoTypes: ALLOWED_PHOTO_TYPES,
  }
}
