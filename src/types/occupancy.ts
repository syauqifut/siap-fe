export type OccupancyEventType = 'check_in' | 'check_out'

export interface OccupancyHistoryHouse {
  id: number
  house_number: string
}

export interface OccupancyHistoryResident {
  id: number
  full_name: string
}

export interface OccupancyHistory {
  id: number
  house: OccupancyHistoryHouse
  resident: OccupancyHistoryResident
  event_type: OccupancyEventType
  event_date: string
  created_at: string
}

export interface OccupancyHistoryListParams {
  house_id?: number
  resident_id?: number
  event_type?: OccupancyEventType
  page?: number
  per_page?: number
}

export interface CheckInPayload {
  resident_id: number
  event_date: string
}

export interface CheckOutPayload {
  resident_id: number
  event_date: string
}

export interface ReplaceResidentPayload {
  old_resident_id: number
  new_resident_id: number
  event_date: string
}
