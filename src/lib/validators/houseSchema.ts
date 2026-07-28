import { z } from 'zod'

export const houseSchema = z.object({
  house_number: z
    .string()
    .min(1, 'Nomor rumah wajib diisi')
    .max(50, 'Nomor rumah maksimal 50 karakter'),
})

export type HouseFormValues = z.infer<typeof houseSchema>
