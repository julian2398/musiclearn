const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'musiclearn_secret_2025'

function authMiddleware(req, res, next) {
  const header = req.headers['authorization']
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido' })
  }
  const token = header.slice(7)
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado' })
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: 'Acceso denegado' })
    }
    next()
  }
}

module.exports = { authMiddleware, requireRole }
