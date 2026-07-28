import api from '@/services/axios'
import type { ApiResponse, PaginatedApiResponse } from '@/types/api'
import type { House } from '@/types/house'
import type {
  CheckInPayload,
  CheckOutPayload,
  OccupancyHistory,
  OccupancyHistoryListParams,
  ReplaceResidentPayload,
} from '@/types/occupancy'

export const occupancyService = {
  async getHistories(
    params: OccupancyHistoryListParams = {},
  ): Promise<PaginatedApiResponse<OccupancyHistory>> {
    const { data } = await api.get<PaginatedApiResponse<OccupancyHistory>>(
      '/occupancy-histories',
      { params },
    )

    return data
  },

  async checkIn(
    houseId: number | string,
    payload: CheckInPayload,
  ): Promise<House> {
    const { data } = await api.post<ApiResponse<House>>(
      `/houses/${houseId}/check-in`,
      payload,
    )

    return data.data as House
  },

  async checkOut(
    houseId: number | string,
    payload: CheckOutPayload,
  ): Promise<House> {
    const { data } = await api.post<ApiResponse<House>>(
      `/houses/${houseId}/check-out`,
      payload,
    )

    return data.data as House
  },

  async replaceResident(
    houseId: number | string,
    payload: ReplaceResidentPayload,
  ): Promise<House> {
    const { data } = await api.post<ApiResponse<House>>(
      `/houses/${houseId}/replace-resident`,
      payload,
    )

    return data.data as House
  },
}
