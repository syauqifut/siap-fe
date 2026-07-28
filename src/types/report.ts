import type { Expense } from '@/types/expense'
import type { Payment } from '@/types/payment'

export interface ReportSummaryPeriod {
  year: number
  months: number
}

export interface ReportSummaryTotals {
  total_income: string
  total_expense: string
  balance: string
}

export interface ReportChartPoint {
  month: number
  year: number
  month_label: string
  income: string
  expense: string
  balance: string
  cumulative_balance: string
}

export interface ReportSummary {
  period: ReportSummaryPeriod
  summary: ReportSummaryTotals
  chart: ReportChartPoint[]
}

export interface ReportDetailPeriod {
  month: number
  year: number
  month_label: string
}

export interface ExpenseByCategory {
  expense_category: {
    id: number
    name: string
  }
  total_amount: string
  transaction_count: number
}

export interface ReportDetail {
  period: ReportDetailPeriod
  summary: ReportSummaryTotals
  income: Payment[]
  expenses: Expense[]
  expenses_by_category: ExpenseByCategory[]
}

export interface ReportSummaryParams {
  year?: number
}

export interface ReportDetailParams {
  month: number
  year?: number
}
