import { isAxiosError } from "axios"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { ApiResponse } from "@/types/api"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function formatCurrency(value: number | string) {
  const amount = typeof value === 'string' ? Number(value) : value

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan. Silakan coba lagi.",
) {
  if (isAxiosError<ApiResponse>(error)) {
    const response = error.response?.data

    if (response?.errors) {
      const firstFieldError = Object.values(response.errors)[0]?.[0]
      if (firstFieldError) return firstFieldError
    }

    if (response?.message) return response.message
  }

  if (error instanceof Error && error.message) return error.message

  return fallback
}
