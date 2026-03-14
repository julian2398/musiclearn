const jwt = require('jsonwebtoken')
const JWT_SECRET = process.env.JWT_SECRET || 'musiclearn_secret_2025'

function initSocket(io) {
  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Token requerido'))
    try {
      const user = jwt.verify(token, JWT_SECRET)
      socket.user = user
      next()
    } catch {
      next(new Error('Token inválido'))
    }
  })

  io.on('connection', (socket) => {
    const userId = socket.user.id
    console.log(`🔌 Socket connected: ${socket.user.name} (${userId})`)

    // Join personal room
    socket.join(`user:${userId}`)

    // Join conversation room
    socket.on('join_conversation', ({ otherId }) => {
      const room = [userId, otherId].sort().join('_')
      socket.join(room)
    })

    // Send message
    socket.on('message', ({ receiverId, content }) => {
      if (!content?.trim()) return
      const room = [userId, receiverId].sort().join('_')
      const msg = {
        id: Date.now().toString(),
        sender_id: userId,
        receiver_id: receiverId,
        content: content.trim(),
        sent_at: new Date().toISOString(),
        convId: room
      }
      // Broadcast to both participants
      io.to(room).emit('message', msg)
      // Notification to receiver's personal room
      io.to(`user:${receiverId}`).emit('notification', {
        id: msg.id,
        type: 'chat',
        text: `Nuevo mensaje de ${socket.user.name}`,
        read: false,
        timestamp: msg.sent_at
      })
    })

    // Teacher marks session
    socket.on('session_update', ({ studentId, type, data }) => {
      io.to(`user:${studentId}`).emit('notification', {
        id: Date.now().toString(),
        type: 'session',
        text: type === 'scheduled' ? 'Nueva clase agendada' : 'Actualización de clase',
        data,
        read: false,
        timestamp: new Date().toISOString()
      })
    })

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name}`)
    })
  })
}

module.exports = { initSocket }
