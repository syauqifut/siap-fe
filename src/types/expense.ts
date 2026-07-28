import type { ExpenseCategory } from '@/types/expenseCategory'

export interface Expense {
  id: number
  expense_category: ExpenseCategory
  description: string
  amount: string
  expense_date: string
  created_at: string
  updated_at: string
}

export interface ExpenseListParams {
  expense_category_id?: number
  expense_month?: number
  expense_year?: number
  search?: string
  page?: number
  per_page?: number
}

export interface ExpensePayload {
  expense_category_id: number
  description: string
  amount: number
  expense_date: string
}
