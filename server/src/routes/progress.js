// progress.js
const router = require('express').Router()
const { authMiddleware } = require('../middleware/authMiddleware')
const progress = new Map() // key: userId_courseId

router.get('/:courseId', authMiddleware, (req, res) => {
  const key = `${req.user.id}_${req.params.courseId}`
  const data = progress.get(key) || { completedSubtopics: [], progressPct: 0 }
  res.json(data)
})

router.post('/:courseId/subtopic/:subtopicId', authMiddleware, (req, res) => {
  const key = `${req.user.id}_${req.params.courseId}`
  const data = progress.get(key) || { completedSubtopics: [], progressPct: 0 }
  const id = req.params.subtopicId
  if (!data.completedSubtopics.includes(id)) data.completedSubtopics.push(id)
  progress.set(key, data)
  res.json({ success: true, data })
})

module.exports = router
