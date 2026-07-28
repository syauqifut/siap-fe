import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { FeeType, FeeTypeListParams, FeeTypePayload } from '@/types/feeType'

export const feeTypeService = {
  async getAll(
    params: FeeTypeListParams = {},
  ): Promise<PaginatedApiResponse<FeeType>> {
    const { data } = await api.get<PaginatedApiResponse<FeeType>>(
      '/fee-types',
      { params },
    )

    return data
  },

  async getById(id: number | string): Promise<FeeType> {
    const { data } = await api.get<ApiResponse<FeeType>>(`/fee-types/${id}`)

    return data.data as FeeType
  },

  async create(payload: FeeTypePayload): Promise<FeeType> {
    const { data } = await api.post<ApiResponse<FeeType>>('/fee-types', payload)

    return data.data as FeeType
  },

  async update(id: number | string, payload: FeeTypePayload): Promise<FeeType> {
    const { data } = await api.patch<ApiResponse<FeeType>>(
      `/fee-types/${id}`,
      payload,
    )

    return data.data as FeeType
  },

  async remove(id: number | string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(`/fee-types/${id}`)

    return data
  },
}
