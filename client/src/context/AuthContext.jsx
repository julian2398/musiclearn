import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { trackEvent } from '../services/analytics'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ml_token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.get('/auth/me')
        .then(res => setUser(res.data.user))
        .catch(() => localStorage.removeItem('ml_token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('ml_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    trackEvent('login', { method: 'email', role: user.role })
    return user
  }

  const register = async (data) => {
    const res = await api.post('/auth/register', data)
    const { token, user } = res.data
    localStorage.setItem('ml_token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(user)
    trackEvent('sign_up', { role: data.role })
    return user
  }

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data)
    setUser(prev => ({ ...prev, ...res.data.user }))
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('ml_token')
    delete api.defaults.headers.common['Authorization']
    setUser(null)
    trackEvent('logout')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
