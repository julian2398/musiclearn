// controller
const courses = new Map()
let courseIdSeq = 1

const INSTRUMENTS = ['guitar','bass','piano','vocal']
const LEVELS      = ['beginner','intermediate','advanced']

function list(req, res) {
  const { instrument, level } = req.query
  let result = Array.from(courses.values()).filter(c => c.is_active)
  if (instrument) result = result.filter(c => c.instrument === instrument)
  if (level)      result = result.filter(c => c.level === level)
  return res.json({ courses: result })
}

function getById(req, res) {
  const c = courses.get(req.params.id)
  if (!c) return res.status(404).json({ message: 'Curso no encontrado' })
  return res.json({ course: c })
}

function create(req, res) {
  const { title, instrument, level, description } = req.body
  if (!title || !instrument || !level) {
    return res.status(400).json({ message: 'Título, instrumento y nivel son requeridos' })
  }
  if (!INSTRUMENTS.includes(instrument)) return res.status(400).json({ message: 'Instrumento inválido' })
  if (!LEVELS.includes(level))           return res.status(400).json({ message: 'Nivel inválido' })

  const id = String(courseIdSeq++)
  const course = { id, title, instrument, level, description: description || '', teacher_id: req.user.id, topics: [], is_active: true, created_at: new Date().toISOString() }
  courses.set(id, course)
  return res.status(201).json({ course })
}

function update(req, res) {
  const c = courses.get(req.params.id)
  if (!c) return res.status(404).json({ message: 'Curso no encontrado' })
  if (c.teacher_id !== req.user.id) return res.status(403).json({ message: 'Sin permiso' })
  const updated = { ...c, ...req.body, id: c.id, teacher_id: c.teacher_id }
  courses.set(c.id, updated)
  return res.json({ course: updated })
}

function addTopic(req, res) {
  const c = courses.get(req.params.id)
  if (!c) return res.status(404).json({ message: 'Curso no encontrado' })
  if (c.teacher_id !== req.user.id) return res.status(403).json({ message: 'Sin permiso' })
  const { title, subtopics = [] } = req.body
  if (!title) return res.status(400).json({ message: 'Título del tema requerido' })
  const topic = { id: `t${Date.now()}`, title, subtopics, order_index: c.topics.length + 1 }
  c.topics.push(topic)
  courses.set(c.id, c)
  return res.status(201).json({ topic })
}

module.exports = { list, getById, create, update, addTopic }
