import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { Payment, PaymentListParams, PaymentPayload } from '@/types/payment'

export const paymentService = {
  async getAll(
    params: PaymentListParams = {},
  ): Promise<PaginatedApiResponse<Payment>> {
    const { data } = await api.get<PaginatedApiResponse<Payment>>('/payments', {
      params,
    })

    return data
  },

  async getById(id: number | string): Promise<Payment> {
    const { data } = await api.get<ApiResponse<Payment>>(`/payments/${id}`)

    return data.data as Payment
  },

  async create(payload: PaymentPayload): Promise<Payment> {
    const { data } = await api.post<ApiResponse<Payment>>('/payments', payload)

    return data.data as Payment
  },
}
