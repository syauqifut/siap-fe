import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type {
  ExpenseCategory,
  ExpenseCategoryListParams,
  ExpenseCategoryPayload,
} from '@/types/expenseCategory'

export const expenseCategoryService = {
  async getAll(
    params: ExpenseCategoryListParams = {},
  ): Promise<PaginatedApiResponse<ExpenseCategory>> {
    const { data } = await api.get<PaginatedApiResponse<ExpenseCategory>>(
      '/expense-categories',
      { params },
    )

    return data
  },

  async getById(id: number | string): Promise<ExpenseCategory> {
    const { data } = await api.get<ApiResponse<ExpenseCategory>>(
      `/expense-categories/${id}`,
    )

    return data.data as ExpenseCategory
  },

  async create(payload: ExpenseCategoryPayload): Promise<ExpenseCategory> {
    const { data } = await api.post<ApiResponse<ExpenseCategory>>(
      '/expense-categories',
      payload,
    )

    return data.data as ExpenseCategory
  },

  async update(
    id: number | string,
    payload: ExpenseCategoryPayload,
  ): Promise<ExpenseCategory> {
    const { data } = await api.patch<ApiResponse<ExpenseCategory>>(
      `/expense-categories/${id}`,
      payload,
    )

    return data.data as ExpenseCategory
  },

  async remove(id: number | string): Promise<ApiResponse> {
    const { data } = await api.delete<ApiResponse>(
      `/expense-categories/${id}`,
    )

    return data
  },
}
