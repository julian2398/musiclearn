import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// Response interceptor: handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ml_token')
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data?.message || 'Error de servidor')
  }
)

export default api
