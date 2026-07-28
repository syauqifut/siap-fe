import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type {
  Resident,
  ResidentListParams,
  ResidentPayload,
} from '@/types/resident'

function buildResidentFormData(payload: ResidentPayload) {
  const formData = new FormData()

  formData.append('full_name', payload.full_name)
  formData.append('gender', payload.gender)
  formData.append('resident_type', payload.resident_type)
  formData.append('phone_number', payload.phone_number)
  formData.append('is_married', payload.is_married ? '1' : '0')

  return formData
}

export const residentService = {
  async getAll(
    params: ResidentListParams = {},
  ): Promise<PaginatedApiResponse<Resident>> {
    const { data } = await api.get<PaginatedApiResponse<Resident>>(
      '/residents',
      { params },
    )

    return data
  },

  async getById(id: number | string): Promise<Resident> {
    const { data } = await api.get<ApiResponse<Resident>>(`/residents/${id}`)

    return data.data as Resident
  },

  async create(payload: ResidentPayload, photo?: File): Promise<Resident> {
    if (photo) {
      const formData = buildResidentFormData(payload)
      formData.append('id_card_photo', photo)

      const { data } = await api.post<ApiResponse<Resident>>(
        '/residents',
        formData,
      )

      return data.data as Resident
    }

    const { data } = await api.post<ApiResponse<Resident>>(
      '/residents',
      payload,
    )

    return data.data as Resident
  },

  /**
   * `photo` mengontrol foto KTP:
   * - undefined → foto tidak disentuh (PATCH JSON biasa)
   * - File      → ganti foto (POST + _method=PATCH, karena PHP tidak bisa
   *               membaca file upload dari request PATCH)
   * - null      → hapus foto (kirim id_card_photo kosong)
   */
  async update(
    id: number | string,
    payload: ResidentPayload,
    photo?: File | null,
  ): Promise<Resident> {
    if (photo === undefined) {
      const { data } = await api.patch<ApiResponse<Resident>>(
        `/residents/${id}`,
        payload,
      )

      return data.data as Resident
    }

    const formData = buildResidentFormData(payload)
    formData.append('_method', 'PATCH')
    formData.append('id_card_photo', photo ?? '')

    const { data } = await api.post<ApiResponse<Resident>>(
      `/residents/${id}`,
      formData,
    )

    return data.data as Resident
  },

  async remove(id: number | string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/residents/${id}`)

    return data
  },
}
