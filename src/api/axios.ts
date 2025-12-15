import axios from 'axios'
import type { AxiosInstance } from 'axios'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
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
      // Clear user data and redirect to login
      localStorage.removeItem('user')
      // Optionally redirect to login
      // window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default apiClient
