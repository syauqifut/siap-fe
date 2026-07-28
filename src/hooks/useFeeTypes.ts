import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { feeTypeService } from '@/services/feeTypeService'
import type { FeeTypeListParams, FeeTypePayload } from '@/types/feeType'

export function useFeeTypeList(params: FeeTypeListParams = {}) {
  return useQuery({
    queryKey: ['fee-types', 'list', params],
    queryFn: () => feeTypeService.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useFeeType(id?: string) {
  return useQuery({
    queryKey: ['fee-types', 'detail', id],
    queryFn: () => feeTypeService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateFeeType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: feeTypeService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] })
    },
  })
}

export function useUpdateFeeType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string
      payload: FeeTypePayload
    }) => feeTypeService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] })
    },
  })
}

export function useDeleteFeeType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: feeTypeService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] })
    },
  })
}
