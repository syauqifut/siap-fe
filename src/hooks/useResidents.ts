import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { residentService } from '@/services/residentService'
import type { ResidentListParams, ResidentPayload } from '@/types/resident'

export function useResidentList(params: ResidentListParams = {}) {
  return useQuery({
    queryKey: ['residents', 'list', params],
    queryFn: () => residentService.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useResident(id?: string) {
  return useQuery({
    queryKey: ['residents', 'detail', id],
    queryFn: () => residentService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      payload,
      photo,
    }: {
      payload: ResidentPayload
      photo?: File
    }) => residentService.create(payload, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
    },
  })
}

export function useUpdateResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
      photo,
    }: {
      id: number | string
      payload: ResidentPayload
      photo?: File | null
    }) => residentService.update(id, payload, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
    },
  })
}

export function useDeleteResident() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: residentService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['residents'] })
    },
  })
}
