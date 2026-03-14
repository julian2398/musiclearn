import { io } from 'socket.io-client'

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      auth: { token: localStorage.getItem('ml_token') },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })
    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message)
    })
  }
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
