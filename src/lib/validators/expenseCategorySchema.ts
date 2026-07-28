import { z } from 'zod'

export const expenseCategorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nama kategori wajib diisi')
    .max(255, 'Nama kategori maksimal 255 karakter'),
})

export type ExpenseCategoryFormValues = z.infer<typeof expenseCategorySchema>
