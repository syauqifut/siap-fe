import { z } from 'zod'

function isNotFutureDate(value: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)

  return date <= today
}

export const paymentSchema = z.object({
  house_id: z.string().min(1, 'Rumah wajib dipilih'),
  bill_ids: z.array(z.string()).min(1, 'Minimal 1 tagihan dipilih'),
  resident_id: z.string().min(1, 'Penghuni wajib dipilih'),
  payment_date: z
    .string()
    .min(1, 'Tanggal wajib diisi')
    .refine(isNotFutureDate, 'Tanggal tidak boleh di masa depan'),
  notes: z
    .string()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
})

export type PaymentFormValues = z.infer<typeof paymentSchema>

export function toPaymentPayload(values: PaymentFormValues) {
  return {
    resident_id: Number(values.resident_id),
    payment_date: values.payment_date,
    notes: values.notes?.trim() || undefined,
    bill_ids: values.bill_ids.map(Number),
  }
}
