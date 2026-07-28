import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { House, HouseListParams, HousePayload } from '@/types/house'

export const houseService = {
  async getAll(params: HouseListParams = {}): Promise<PaginatedApiResponse<House>> {
    const { data } = await api.get<PaginatedApiResponse<House>>('/houses', {
      params,
    })

    return data
  },

  async getById(id: number | string): Promise<House> {
    const { data } = await api.get<ApiResponse<House>>(`/houses/${id}`)

    return data.data as House
  },

  async create(payload: HousePayload): Promise<House> {
    const { data } = await api.post<ApiResponse<House>>('/houses', payload)

    return data.data as House
  },

  async update(id: number | string, payload: HousePayload): Promise<House> {
    const { data } = await api.patch<ApiResponse<House>>(
      `/houses/${id}`,
      payload,
    )

    return data.data as House
  },

  async remove(id: number | string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/houses/${id}`)

    return data
  },
}
