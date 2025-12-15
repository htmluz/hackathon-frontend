import axios from 'axios'
import type { AxiosInstance } from 'axios'

// Create axios instance with base configuration
// In development, we use Vite's proxy to avoid CORS/cookie issues
// The proxy forwards /api requests to the backend server
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // Important: This ensures cookies are sent with requests
  withCredentials: true,
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle 401 Unauthorized - session expired or not authenticated
    if (error.response?.status === 401) {
      // Clear all user data
      localStorage.removeItem('user')
      localStorage.removeItem('user_types')
      // Optionally redirect to login
      // window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default apiClient
