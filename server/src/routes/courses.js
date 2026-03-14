// courses.js
const router = require('express').Router()
const c = require('../controllers/courseController')
const { authMiddleware, requireRole } = require('../middleware/authMiddleware')

router.get('/',              authMiddleware, c.list)
router.get('/:id',           authMiddleware, c.getById)
router.post('/',             authMiddleware, requireRole('teacher'), c.create)
router.put('/:id',           authMiddleware, requireRole('teacher'), c.update)
router.post('/:id/topics',   authMiddleware, requireRole('teacher'), c.addTopic)

module.exports = router
