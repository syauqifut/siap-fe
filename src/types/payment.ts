import type { Bill } from '@/types/bill'

export interface PaymentResident {
  id: number
  full_name: string
}

export interface PaymentHouse {
  id: number
  house_number: string
}

export interface PaymentDetail {
  id: number
  bill_id: number
  paid_amount: string
  bill: Bill
}

export interface Payment {
  id: number
  resident: PaymentResident
  house: PaymentHouse
  payment_date: string
  notes: string | null
  total_amount: string
  details: PaymentDetail[]
  created_at: string
  updated_at: string
}

export interface PaymentListParams {
  resident_id?: number
  house_id?: number
  payment_month?: number
  payment_year?: number
  search?: string
  page?: number
  per_page?: number
}

export interface PaymentPayload {
  resident_id: number
  payment_date: string
  notes?: string
  bill_ids: number[]
}
