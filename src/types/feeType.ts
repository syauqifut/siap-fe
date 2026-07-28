export interface FeeType {
  id: number
  name: string
  amount: string
  is_recurring: boolean
  due_day: number | null
  created_at: string
  updated_at: string
}

export interface FeeTypeListParams {
  search?: string
  is_recurring?: 0 | 1
  page?: number
  per_page?: number
}

export interface FeeTypePayload {
  name: string
  amount: number
  is_recurring: boolean
  due_day?: number | null
}
