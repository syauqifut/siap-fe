import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type {
  Bill,
  BillBulkSummary,
  BillCreateResult,
  BillListParams,
  BillPayload,
} from '@/types/bill'

function parseCreateResult(data: Bill | BillBulkSummary): BillCreateResult {
  if ('created' in data) {
    return { mode: 'bulk', summary: data }
  }

  return { mode: 'single', bill: data }
}

export const billService = {
  async getAll(
    params: BillListParams = {},
  ): Promise<PaginatedApiResponse<Bill>> {
    const { data } = await api.get<PaginatedApiResponse<Bill>>('/bills', {
      params,
    })

    return data
  },

  async getById(id: number | string): Promise<Bill> {
    const { data } = await api.get<ApiResponse<Bill>>(`/bills/${id}`)

    return data.data as Bill
  },

  async create(payload: BillPayload): Promise<BillCreateResult> {
    const { data } = await api.post<ApiResponse<Bill | BillBulkSummary>>(
      '/bills',
      payload,
    )

    return parseCreateResult(data.data as Bill | BillBulkSummary)
  },
}
