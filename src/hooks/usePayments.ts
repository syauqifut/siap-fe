import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { paymentService } from '@/services/paymentService'
import type { PaymentListParams } from '@/types/payment'

export function usePaymentList(params: PaymentListParams = {}) {
  return useQuery({
    queryKey: ['payments', 'list', params],
    queryFn: () => paymentService.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function usePayment(id?: string) {
  return useQuery({
    queryKey: ['payments', 'detail', id],
    queryFn: () => paymentService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: paymentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['bills'] })
    },
  })
}
