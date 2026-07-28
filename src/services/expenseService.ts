import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { Expense, ExpenseListParams, ExpensePayload } from '@/types/expense'

export const expenseService = {
  async getAll(
    params: ExpenseListParams = {},
  ): Promise<PaginatedApiResponse<Expense>> {
    const { data } = await api.get<PaginatedApiResponse<Expense>>('/expenses', {
      params,
    })

    return data
  },

  async getById(id: number | string): Promise<Expense> {
    const { data } = await api.get<ApiResponse<Expense>>(`/expenses/${id}`)

    return data.data as Expense
  },

  async create(payload: ExpensePayload): Promise<Expense> {
    const { data } = await api.post<ApiResponse<Expense>>('/expenses', payload)

    return data.data as Expense
  },
}
