import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { getSocket } from '../services/socket'

const NotifContext = createContext(null)

export function NotifProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    if (!user) return
    let socketInstance = null

    const connect = async () => {
      socketInstance = await getSocket()
      socketInstance.on('notification', (notif) => {
        setNotifications(prev => [notif, ...prev])
      })
    }

    connect()

    return () => {
      if (socketInstance) socketInstance.off('notification')
    }
  }, [user])

  const markRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <NotifContext.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </NotifContext.Provider>
  )
}

export const useNotif = () => useContext(NotifContext)