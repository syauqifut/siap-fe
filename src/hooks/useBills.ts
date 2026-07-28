import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { billService } from '@/services/billService'
import type { BillListParams, BillPayload } from '@/types/bill'

export function useBillList(
  params: BillListParams = {},
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ['bills', 'list', params],
    queryFn: () => billService.getAll(params),
    placeholderData: keepPreviousData,
    enabled: options?.enabled ?? true,
  })
}

export function useBill(id?: string) {
  return useQuery({
    queryKey: ['bills', 'detail', id],
    queryFn: () => billService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateBill() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: BillPayload) => billService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}
