import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { expenseCategoryService } from '@/services/expenseCategoryService'
import type {
  ExpenseCategoryListParams,
  ExpenseCategoryPayload,
} from '@/types/expenseCategory'

export function useExpenseCategoryList(params: ExpenseCategoryListParams = {}) {
  return useQuery({
    queryKey: ['expense-categories', 'list', params],
    queryFn: () => expenseCategoryService.getAll(params),
    placeholderData: keepPreviousData,
  })
}

export function useExpenseCategory(id?: string) {
  return useQuery({
    queryKey: ['expense-categories', 'detail', id],
    queryFn: () => expenseCategoryService.getById(id as string),
    enabled: Boolean(id),
  })
}

export function useCreateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: expenseCategoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
    },
  })
}

export function useUpdateExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number | string
      payload: ExpenseCategoryPayload
    }) => expenseCategoryService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
    },
  })
}

export function useDeleteExpenseCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: expenseCategoryService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expense-categories'] })
    },
  })
}
