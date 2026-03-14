const router = require('express').Router()
const { authMiddleware } = require('../middleware/authMiddleware')

const messages = new Map() // key: sorted userId pair

function convKey(a, b) {
  return [a, b].sort().join('_')
}

router.get('/conversations', authMiddleware, (req, res) => {
  const uid = req.user.id
  const convs = []
  for (const [key, msgs] of messages.entries()) {
    if (key.includes(uid) && msgs.length > 0) {
      const last = msgs[msgs.length - 1]
      convs.push({ key, last_message: last.content, last_time: last.sent_at })
    }
  }
  res.json({ conversations: convs })
})

router.get('/:otherId', authMiddleware, (req, res) => {
  const key = convKey(req.user.id, req.params.otherId)
  const msgs = messages.get(key) || []
  res.json({ messages: msgs })
})

router.post('/:receiverId', authMiddleware, (req, res) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ message: 'Mensaje vacío' })
  const key = convKey(req.user.id, req.params.receiverId)
  const existing = messages.get(key) || []
  const msg = { id: Date.now().toString(), sender_id: req.user.id, receiver_id: req.params.receiverId, content: content.trim(), sent_at: new Date().toISOString(), read: false }
  existing.push(msg)
  messages.set(key, existing)
  // Emit via socket (access io from app)
  res.status(201).json({ message: msg })
})

module.exports = router
