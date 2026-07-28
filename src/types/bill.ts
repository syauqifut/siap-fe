import type { FeeType } from '@/types/feeType'

export interface BillHouse {
  id: number
  house_number: string
}

export interface Bill {
  id: number
  house: BillHouse
  fee_type: FeeType
  due_date: string
  amount: string
  paid_amount: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

export interface BillBulkSummary {
  created: number
  skipped: number
}

export interface BillListParams {
  house_id?: number
  fee_type_id?: number
  due_month?: number
  due_year?: number
  is_paid?: 0 | 1
  page?: number
  per_page?: number
}

export interface BillSinglePayload {
  house_id: number
  fee_type_id: number
  due_date: string
  amount?: number
}

export interface BillBulkPayload {
  fee_type_id: number
  due_date: string
  amount?: number
}

export type BillPayload = BillSinglePayload | BillBulkPayload

export type BillCreateResult =
  | { mode: 'single'; bill: Bill }
  | { mode: 'bulk'; summary: BillBulkSummary }
