import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { expenseService } from '@/services/expenseService'
import type { ExpenseListParams } from '@/types/expense'

export function useExpenseList(params: ExpenseListParams = {}) {
  return useQuery({
    queryKey: ['expenses', 'list', params],
    queryFn: () => expenseService.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useExpense(id?: string) {
  return useQuery({
    queryKey: ['expenses', 'detail', id],
    queryFn: () => expenseService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
    },
  })
}
