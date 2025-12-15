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

export interface UserType {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface LoginResponse {
  success: boolean
  user?: User
  error?: string
  code?: number
}

export interface PersonalInfoResponse {
  success: boolean
  data?: {
    user: User
    user_types: UserType[]
  }
  error?: string
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/login', credentials)
    return response.data
  },

  getPersonalInfo: async (): Promise<PersonalInfoResponse> => {
    const response = await apiClient.get<PersonalInfoResponse>('/private/personal-information')
    return response.data
  },

  logout: (): void => {
    // Clear all stored user data
    localStorage.removeItem('user')
    localStorage.removeItem('user_types')
    // Clear the auth cookie by making a logout request or letting it expire
    // If backend has a logout endpoint, call it here
    // For now, we clear the cookie by setting it to expire
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  },
}

