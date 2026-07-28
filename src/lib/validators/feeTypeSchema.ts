import { z } from 'zod'

export const feeTypeSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nama jenis iuran wajib diisi')
      .max(255, 'Nama jenis iuran maksimal 255 karakter'),
    amount: z
      .number({ message: 'Nominal wajib diisi' })
      .min(0, 'Nominal minimal 0'),
    is_recurring: z.boolean(),
    due_day: z
      .number({ message: 'Tanggal jatuh tempo wajib diisi' })
      .int()
      .min(1, 'Minimal tanggal 1')
      .max(31, 'Maksimal tanggal 31')
      .nullable()
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.is_recurring && data.due_day == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Tanggal jatuh tempo wajib diisi (1–31)',
        path: ['due_day'],
      })
    }
  })

export type FeeTypeFormValues = z.infer<typeof feeTypeSchema>

export function toFeeTypePayload(values: FeeTypeFormValues) {
  return {
    name: values.name,
    amount: values.amount,
    is_recurring: values.is_recurring,
    ...(values.is_recurring ? { due_day: values.due_day } : {}),
  }
}
