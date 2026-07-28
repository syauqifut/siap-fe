import { z } from 'zod'

export const residentSchema = z.object({
  full_name: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .max(255, 'Nama lengkap maksimal 255 karakter'),
  gender: z.enum(['male', 'female'], 'Jenis kelamin wajib dipilih'),
  resident_type: z.enum(
    ['contract', 'permanent'],
    'Tipe penghuni wajib dipilih',
  ),
  phone_number: z
    .string()
    .min(1, 'No. telepon wajib diisi')
    .max(20, 'No. telepon maksimal 20 karakter')
    .regex(
      /^[0-9+\-() ]+$/,
      'No. telepon hanya boleh berisi angka dan karakter + - ( ) spasi',
    ),
  is_married: z.boolean(),
})

export type ResidentFormValues = z.infer<typeof residentSchema>
