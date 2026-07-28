import type { Payment } from '@/types/payment'

export interface DashboardPeriod {
  month: number
  year: number
  month_label: string
}

export interface DashboardOccupancy {
  total_houses: number
  occupied_houses: number
  vacant_houses: number
  occupancy_rate: number
}

export interface DashboardFinance {
  total_income: string
  total_expense: string
  balance: string
}

export interface DashboardBills {
  unpaid_count: number
  unpaid_total_amount: string
  paid_this_due_month_count: number
  due_this_month_count: number
}

export interface DashboardCashFlowPoint {
  month: number
  year: number
  month_label: string
  income: string
  expense: string
  balance: string
}

export interface Dashboard {
  period: DashboardPeriod
  occupancy: DashboardOccupancy
  finance_current_month: DashboardFinance
  finance_current_year: DashboardFinance
  bills: DashboardBills
  recent_payments: Payment[]
  cash_flow_chart: DashboardCashFlowPoint[]
}

export interface DashboardParams {
  month?: number
  year?: number
}
