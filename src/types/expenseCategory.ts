export interface ExpenseCategory {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export interface ExpenseCategoryListParams {
  search?: string
  page?: number
  per_page?: number
}

export interface ExpenseCategoryPayload {
  name: string
}
