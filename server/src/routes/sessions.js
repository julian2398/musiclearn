const router = require('express').Router()
const { authMiddleware, requireRole } = require('../middleware/authMiddleware')

const sessions = new Map()
let sessionIdSeq = 1

router.get('/', authMiddleware, (req, res) => {
  const list = Array.from(sessions.values()).filter(s =>
    s.teacher_id === req.user.id || s.student_id === req.user.id
  )
  res.json({ sessions: list })
})

router.post('/', authMiddleware, requireRole('teacher'), (req, res) => {
  const { student_id, modality, start_time, duration_min, topic } = req.body
  if (!student_id || !modality || !start_time) {
    return res.status(400).json({ message: 'Campos requeridos: student_id, modality, start_time' })
  }
  const id = String(sessionIdSeq++)
  const meet_link = modality === 'virtual' ? `https://meet.google.com/${Math.random().toString(36).slice(2,9)}` : null
  const session = { id, teacher_id: req.user.id, student_id, modality, start_time, duration_min: duration_min || 60, topic: topic || '', meet_link, created_at: new Date().toISOString() }
  sessions.set(id, session)
  res.status(201).json({ session })
})

router.delete('/:id', authMiddleware, requireRole('teacher'), (req, res) => {
  const s = sessions.get(req.params.id)
  if (!s) return res.status(404).json({ message: 'Sesión no encontrada' })
  if (s.teacher_id !== req.user.id) return res.status(403).json({ message: 'Sin permiso' })
  sessions.delete(req.params.id)
  res.json({ success: true })
})

module.exports = router
