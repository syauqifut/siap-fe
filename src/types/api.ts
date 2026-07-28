export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string[]>
}

export interface PaginationLinks {
  first: string | null
  last: string | null
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  path: string
  per_page: number
  to: number | null
  total: number
  links: Array<{
    url: string | null
    label: string
    page: number | null
    active: boolean
  }>
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  links?: PaginationLinks
  meta?: PaginationMeta
}
