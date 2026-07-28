import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { houseService } from '@/services/houseService'
import type { HouseListParams, HousePayload } from '@/types/house'

export function useHouseList(params: HouseListParams = {}) {
  return useQuery({
    queryKey: ['houses', 'list', params],
    queryFn: () => houseService.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useHouse(id?: string) {
  return useQuery({
    queryKey: ['houses', 'detail', id],
    queryFn: () => houseService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: houseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export function useUpdateHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string
      payload: HousePayload
    }) => houseService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}

export function useDeleteHouse() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: houseService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['houses'] })
    },
  })
}
