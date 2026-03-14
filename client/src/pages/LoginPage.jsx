import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenido de nuevo, ${user.name.split(' ')[0]}`)
      navigate(user.role === 'teacher' ? '/dashboard' : '/portal')
    } catch (err) {
      toast.error(err || 'Credenciales incorrectas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Bienvenido de nuevo a MusicLearn">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input
            type="email" required className="form-input"
            placeholder="tu@correo.com"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input
            type="password" required className="form-input"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? <span className="spinner" /> : 'Ingresar'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          ¿No tienes cuenta?{' '}
          <Link to="/register" style={{ color: 'var(--color-accent)' }}>Regístrate</Link>
        </p>
      </form>
    </AuthLayout>
  )
}

export function AuthLayout({ title, subtitle, children }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,149,108,0.08), transparent)',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--color-text-primary)', marginBottom: '2rem',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎵</span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem' }}>MusicLearn</span>
        </Link>
        <div className="card-elevated" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '0.25rem', fontSize: '1.4rem' }}>{title}</h2>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.75rem' }}>{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
