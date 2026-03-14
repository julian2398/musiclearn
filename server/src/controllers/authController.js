const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')

const JWT_SECRET  = process.env.JWT_SECRET  || 'musiclearn_secret_2025'
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d'

// In-memory store for dev — replace with DB in production
const users = new Map()
let userIdSeq = 1

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role, instrument: user.instrument, level: user.level, modality: user.modality },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

function sanitize(user) {
  const { password_hash, ...safe } = user
  return safe
}

// POST /api/auth/register
async function register(req, res) {
  try {
    const { name, email, password, role = 'student' } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, email y contraseña son requeridos' })
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' })
    }
    if (!['student','teacher'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido' })
    }

    // Check email exists
    for (const u of users.values()) {
      if (u.email === email) return res.status(409).json({ message: 'Este correo ya está registrado' })
    }

    const password_hash = await bcrypt.hash(password, 12)
    const id = String(userIdSeq++)
    const user = {
      id, name, email, password_hash, role,
      instrument: null, level: null, modality: null,
      onboarding_complete: false,
      created_at: new Date().toISOString()
    }
    users.set(id, user)

    const token = signToken(user)
    return res.status(201).json({ token, user: sanitize(user) })
  } catch (err) {
    console.error('Register error:', err)
    return res.status(500).json({ message: 'Error al registrar usuario' })
  }
}

// POST /api/auth/login
async function login(req, res) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña requeridos' })
    }

    let user = null
    for (const u of users.values()) {
      if (u.email === email) { user = u; break }
    }
    if (!user) return res.status(401).json({ message: 'Credenciales incorrectas' })

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return res.status(401).json({ message: 'Credenciales incorrectas' })

    const token = signToken(user)
    return res.json({ token, user: sanitize(user) })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ message: 'Error al iniciar sesión' })
  }
}

// GET /api/auth/me
function getMe(req, res) {
  const user = users.get(req.user.id)
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })
  return res.json({ user: sanitize(user) })
}

// PUT /api/auth/profile
async function updateProfile(req, res) {
  try {
    const { instrument, level, modality, goal, phone, bio, onboarding_complete } = req.body
    const user = users.get(req.user.id)
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' })

    const updated = {
      ...user,
      ...(instrument          !== undefined && { instrument }),
      ...(level               !== undefined && { level }),
      ...(modality            !== undefined && { modality }),
      ...(goal                !== undefined && { goal }),
      ...(phone               !== undefined && { phone }),
      ...(bio                 !== undefined && { bio }),
      ...(onboarding_complete !== undefined && { onboarding_complete }),
    }
    users.set(user.id, updated)

    return res.json({ user: sanitize(updated) })
  } catch (err) {
    console.error('Profile update error:', err)
    return res.status(500).json({ message: 'Error al actualizar perfil' })
  }
}

module.exports = { register, login, getMe, updateProfile }
