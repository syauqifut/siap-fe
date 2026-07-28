import { z } from 'zod'

function isNotFutureDate(value: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)

  return date <= today
}

export const expenseSchema = z.object({
  expense_category_id: z.string().min(1, 'Kategori wajib dipilih'),
  description: z
    .string()
    .min(1, 'Deskripsi wajib diisi')
    .max(255, 'Deskripsi maksimal 255 karakter'),
  amount: z
    .number({ message: 'Nominal wajib diisi' })
    .min(0.01, 'Nominal minimal Rp 0,01'),
  expense_date: z
    .string()
    .min(1, 'Tanggal wajib diisi')
    .refine(isNotFutureDate, 'Tanggal tidak boleh di masa depan'),
})

export type ExpenseFormValues = z.infer<typeof expenseSchema>

export function toExpensePayload(values: ExpenseFormValues) {
  return {
    expense_category_id: Number(values.expense_category_id),
    description: values.description,
    amount: values.amount,
    expense_date: values.expense_date,
  }
}
