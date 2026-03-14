import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useNotif } from '../../context/NotifContext'

const TEACHER_LINKS = [
  { to: '/dashboard',          icon: '📊', label: 'Dashboard' },
  { to: '/dashboard/calendar', icon: '📅', label: 'Calendario' },
  { to: '/dashboard/chat',     icon: '💬', label: 'Chat' },
]

const STUDENT_LINKS = [
  { to: '/portal',          icon: '🏠', label: 'Mi portal' },
  { to: '/portal/calendar', icon: '📅', label: 'Calendario' },
  { to: '/portal/chat',     icon: '💬', label: 'Chat' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotif()
  const navigate = useNavigate()

  const links = user?.role === 'teacher' ? TEACHER_LINKS : STUDENT_LINKS

  const initials = user?.name
    ? user.name.split(' ').slice(0,2).map(n => n[0]).join('').toUpperCase()
    : '?'

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem', padding: '0 0.5rem' }}>
        <span style={{ fontSize: '1.25rem' }}>🎵</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>MusicLearn</span>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard' || link.to === '/portal'}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem', fontWeight: isActive ? 500 : 400,
              color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
              textDecoration: 'none', transition: 'all 0.15s',
              position: 'relative'
            })}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
            {link.icon === '💬' && unreadCount > 0 && (
              <span style={{
                marginLeft: 'auto', background: 'var(--color-accent)',
                color: '#fff', borderRadius: 10, fontSize: '0.7rem',
                padding: '1px 6px', fontWeight: 700
              }}>{unreadCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info at bottom */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--color-border)',
        paddingTop: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', padding: '0 0.25rem' }}>
          <div className="avatar avatar-sm" style={{
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-accent)',
            border: '1px solid var(--color-border)',
            fontWeight: 600
          }}>{initials}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>
              {user?.role === 'teacher' ? 'Profesor' : 'Estudiante'}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
