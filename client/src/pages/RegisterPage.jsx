import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthLayout } from './LoginPage'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      toast.success('Cuenta creada. Completemos tu perfil')
      navigate('/onboarding')
    } catch (err) {
      toast.error(err || 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Crear cuenta" subtitle="Únete a MusicLearn y empieza a tocar">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Nombre completo</label>
          <input type="text" required className="form-input" placeholder="Tu nombre"
            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Correo electrónico</label>
          <input type="email" required className="form-input" placeholder="tu@correo.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Contraseña</label>
          <input type="password" required className="form-input" placeholder="Mínimo 8 caracteres"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Soy…</label>
          <select className="form-input" value={form.role}
            onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
            <option value="student">Estudiante</option>
            <option value="teacher">Profesor</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
          {loading ? <span className="spinner" /> : 'Crear cuenta'}
        </button>
        <p style={{ textAlign: 'center', fontSize: '0.85rem' }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--color-accent)' }}>Ingresar</Link>
        </p>
      </form>
    </AuthLayout>
  )
}
