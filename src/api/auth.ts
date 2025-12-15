import apiClient from './axios'

export interface LoginCredentials {
  email: string
  password: string
}

export interface User {
  id: number
  email: string
  name: string
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  error?: string
  code?: number
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', credentials)
    return response.data
  },
}

