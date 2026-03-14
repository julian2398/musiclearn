const express    = require('express')
const http       = require('http')
const { Server } = require('socket.io')
const cors       = require('cors')
const helmet     = require('helmet')
const rateLimit  = require('express-rate-limit')
require('dotenv').config()

const authRoutes     = require('./routes/auth')
const courseRoutes   = require('./routes/courses')
const progressRoutes = require('./routes/progress')
const sessionRoutes  = require('./routes/sessions')
const chatRoutes     = require('./routes/chat')
const reportRoutes   = require('./routes/reports')
const { initSocket } = require('./services/socketService')

const app    = express()
const server = http.createServer(app)
const io     = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }
})

// ── Middleware ──
app.use(helmet({ contentSecurityPolicy: false }))
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200, message: 'Demasiadas solicitudes, intenta más tarde' })
app.use('/api/', limiter)

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 })
app.use('/api/auth', authLimiter)

// ── Routes ──
app.use('/api/auth',     authRoutes)
app.use('/api/courses',  courseRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/sessions', sessionRoutes)
app.use('/api/chat',     chatRoutes)
app.use('/api/reports',  reportRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }))

// 404
app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }))

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(err.status || 500).json({ message: err.message || 'Error interno del servidor' })
})

// ── Socket.io ──
initSocket(io)

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🎵 MusicLearn server running on port ${PORT}`))

module.exports = { app, server, io }
