export type Gender = 'male' | 'female'

export type ResidentType = 'contract' | 'permanent'

export interface ResidentCurrentHouse {
  id: number
  house_number: string
}

export interface Resident {
  id: number
  full_name: string
  gender: Gender
  id_card_photo: string | null
  id_card_photo_url: string | null
  resident_type: ResidentType
  phone_number: string
  is_married: boolean
  current_house: ResidentCurrentHouse | null
  created_at: string
  updated_at: string
}

export interface ResidentListParams {
  search?: string
  resident_type?: ResidentType
  is_married?: 0 | 1
  page?: number
  per_page?: number
}

export interface ResidentPayload {
  full_name: string
  gender: Gender
  resident_type: ResidentType
  phone_number: string
  is_married: boolean
}
