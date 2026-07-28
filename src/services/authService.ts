import api from '@/services/axios'
import type { ApiResponse } from '@/types/api'
import type { LoginPayload, LoginResponse, User } from '@/types/auth'

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      '/login',
      payload,
    )

    return data.data as LoginResponse
  },

  async logout(): Promise<void> {
    await api.post('/logout')
  },

  async getCurrentUser(): Promise<User> {
    const { data } = await api.get<ApiResponse<User>>('/user')

    return data.data as User
  },
}
