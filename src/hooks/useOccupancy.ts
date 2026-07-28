import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { occupancyService } from '@/services/occupancyService'
import type {
  CheckInPayload,
  CheckOutPayload,
  OccupancyHistoryListParams,
  ReplaceResidentPayload,
} from '@/types/occupancy'

function invalidateOccupancyQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['houses'] })
  queryClient.invalidateQueries({ queryKey: ['occupancy-histories'] })
  queryClient.invalidateQueries({ queryKey: ['residents'] })
}

export function useOccupancyHistoryList(params: OccupancyHistoryListParams = {}) {
  return useQuery({
    queryKey: ['occupancy-histories', 'list', params],
    queryFn: () => occupancyService.getHistories(params),
    placeholderData: keepPreviousData,
    enabled: Boolean(params.house_id ?? params.resident_id),
  })
}

export function useCheckIn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      houseId,
      payload,
    }: {
      houseId: number | string
      payload: CheckInPayload
    }) => occupancyService.checkIn(houseId, payload),
    onSuccess: () => {
      invalidateOccupancyQueries(queryClient)
    },
  })
}

export function useCheckOut() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      houseId,
      payload,
    }: {
      houseId: number | string
      payload: CheckOutPayload
    }) => occupancyService.checkOut(houseId, payload),
    onSuccess: () => {
      invalidateOccupancyQueries(queryClient)
    },
  })
}

export function useReplaceResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      houseId,
      payload,
    }: {
      houseId: number | string
      payload: ReplaceResidentPayload
    }) => occupancyService.replaceResident(houseId, payload),
    onSuccess: () => {
      invalidateOccupancyQueries(queryClient)
    },
  })
}
