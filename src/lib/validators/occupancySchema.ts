import { z } from 'zod'

function isNotFutureDate(value: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)

  return date <= today
}

function isOnOrAfterDate(value: string, minDate: string) {
  const date = new Date(value)
  date.setHours(0, 0, 0, 0)
  const min = new Date(minDate)
  min.setHours(0, 0, 0, 0)

  return date >= min
}

const eventDateSchema = z
  .string()
  .min(1, 'Tanggal wajib diisi')
  .refine(isNotFutureDate, 'Tanggal tidak boleh di masa depan')

export const checkInSchema = z.object({
  resident_id: z.string().min(1, 'Penghuni wajib dipilih'),
  event_date: eventDateSchema,
})

export const checkOutSchema = z.object({
  resident_id: z.string().min(1),
  event_date: eventDateSchema,
})

export const replaceResidentSchema = z
  .object({
    old_resident_id: z.string().min(1),
    new_resident_id: z.string().min(1, 'Penghuni pengganti wajib dipilih'),
    event_date: eventDateSchema,
  })
  .refine((data) => data.old_resident_id !== data.new_resident_id, {
    message: 'Penghuni pengganti harus berbeda dari penghuni lama',
    path: ['new_resident_id'],
  })

export type CheckInFormValues = z.infer<typeof checkInSchema>
export type CheckOutFormValues = z.infer<typeof checkOutSchema>
export type ReplaceResidentFormValues = z.infer<typeof replaceResidentSchema>

export function createCheckOutSchema(minDate: string) {
  return checkOutSchema.refine(
    (data) => isOnOrAfterDate(data.event_date, minDate),
    {
      message: 'Tanggal tidak boleh lebih awal dari tanggal masuk penghuni',
      path: ['event_date'],
    },
  )
}

export function createReplaceResidentSchema(minDate: string) {
  return replaceResidentSchema.refine(
    (data) => isOnOrAfterDate(data.event_date, minDate),
    {
      message: 'Tanggal tidak boleh lebih awal dari tanggal masuk penghuni lama',
      path: ['event_date'],
    },
  )
}

export function getTodayDateString() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function toCheckInPayload(values: CheckInFormValues) {
  return {
    resident_id: Number(values.resident_id),
    event_date: values.event_date,
  }
}

export function toCheckOutPayload(values: CheckOutFormValues) {
  return {
    resident_id: Number(values.resident_id),
    event_date: values.event_date,
  }
}

export function toReplaceResidentPayload(values: ReplaceResidentFormValues) {
  return {
    old_resident_id: Number(values.old_resident_id),
    new_resident_id: Number(values.new_resident_id),
    event_date: values.event_date,
  }
}
