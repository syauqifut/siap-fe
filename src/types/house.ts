export interface HouseResidentSummary {
  id: number
  full_name: string
  gender: 'male' | 'female'
}

export interface HouseOccupant {
  resident: HouseResidentSummary
  occupied_since: string
}

export interface House {
  id: number
  house_number: string
  is_occupied: boolean
  current_residents: HouseOccupant[]
  created_at: string
  updated_at: string
}

export type HouseStatusFilter = 'occupied' | 'vacant'

export interface HouseListParams {
  search?: string
  status?: HouseStatusFilter
  page?: number
  per_page?: number
}

export interface HousePayload {
  house_number: string
}
