import { z } from 'zod'

import type { FeeType } from '@/types/feeType'

export const billTargetOptions = ['single', 'all'] as const

const amountSchema = z
  .union([
    z.number().min(0, 'Nominal minimal 0'),
    z.nan(),
    z.undefined(),
    z.null(),
    z.literal(''),
  ])
  .transform((value) => {
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    return undefined
  })
  .pipe(z.number({ message: 'Nominal wajib diisi' }).min(0, 'Nominal minimal 0'))

export const billSchema = z
  .object({
    target: z.enum(billTargetOptions),
    house_id: z.string(),
    fee_type_id: z.string().min(1, 'Jenis iuran wajib dipilih'),
    due_date: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
    amount: amountSchema,
  })
  .superRefine((data, ctx) => {
    if (data.target === 'single' && !data.house_id) {
      ctx.addIssue({
        code: 'custom',
        message: 'Rumah wajib dipilih',
        path: ['house_id'],
      })
    }
  })

export type BillFormInput = z.input<typeof billSchema>
export type BillFormValues = z.output<typeof billSchema>

export function buildDefaultDueDate(feeType: Pick<FeeType, 'is_recurring' | 'due_day'>) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1

  if (feeType.is_recurring && feeType.due_day != null) {
    const lastDay = new Date(year, month, 0).getDate()
    const day = Math.min(feeType.due_day, lastDay)

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const day = now.getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function applyFeeTypeDefaults(
  feeType: FeeType,
): Pick<BillFormValues, 'amount' | 'due_date'> {
  return {
    amount: Number(feeType.amount),
    due_date: buildDefaultDueDate(feeType),
  }
}

export function toBillPayload(values: BillFormValues) {
  const base = {
    fee_type_id: Number(values.fee_type_id),
    due_date: values.due_date,
    amount: values.amount,
  }

  if (values.target === 'single') {
    return {
      ...base,
      house_id: Number(values.house_id),
    }
  }

  return base
}

export const singleHouseBillSchema = z.object({
  fee_type_id: z.string().min(1, 'Jenis iuran wajib dipilih'),
  due_date: z.string().min(1, 'Tanggal jatuh tempo wajib diisi'),
  amount: amountSchema,
})

export type SingleHouseBillFormInput = z.input<typeof singleHouseBillSchema>
export type SingleHouseBillFormValues = z.output<typeof singleHouseBillSchema>

export function toSingleHouseBillPayload(
  houseId: number,
  values: SingleHouseBillFormValues,
) {
  return {
    house_id: houseId,
    fee_type_id: Number(values.fee_type_id),
    due_date: values.due_date,
    amount: values.amount,
  }
}
