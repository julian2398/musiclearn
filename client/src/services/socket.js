import { io } from 'socket.io-client'
import { auth } from './firebase'

let socket = null

export async function getSocket() {
  if (!socket) {
    const token = auth.currentUser
      ? await auth.currentUser.getIdToken()
      : null

    socket = io('/', {
      auth: { token },
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