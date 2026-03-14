import React, { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
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
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => { setMobileOpen(false) }, [location.pathname])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const links = user?.role === 'teacher' ? TEACHER_LINKS : STUDENT_LINKS
  const initials = user?.name ? user.name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase() : '?'
  const handleLogout = () => { logout(); navigate('/') }

  const NavLinks = () => links.map(link => (
    <NavLink key={link.to} to={link.to} end={link.to==='/dashboard'||link.to==='/portal'}
      style={({isActive})=>({
        display:'flex', alignItems:'center', gap:'0.6rem',
        padding:'0.75rem 0.75rem', borderRadius:'var(--radius-md)',
        fontSize:'0.95rem', fontWeight: isActive?500:400,
        color: isActive?'var(--color-text-primary)':'var(--color-text-secondary)',
        background: isActive?'var(--color-bg-elevated)':'transparent',
        textDecoration:'none', transition:'all 0.15s',
      })}>
      <span style={{fontSize:'1.1rem'}}>{link.icon}</span>
      <span>{link.label}</span>
      {link.icon==='💬'&&unreadCount>0&&(
        <span style={{marginLeft:'auto',background:'var(--color-accent)',color:'#fff',borderRadius:10,fontSize:'0.7rem',padding:'1px 6px',fontWeight:700}}>{unreadCount}</span>
      )}
    </NavLink>
  ))

  const UserInfo = () => (
    <div style={{marginTop:'auto',borderTop:'1px solid var(--color-border)',paddingTop:'1rem'}}>
      <div style={{display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'0.75rem'}}>
        <div className="avatar avatar-sm" style={{background:'var(--color-bg-elevated)',color:'var(--color-accent)',border:'1px solid var(--color-border)',fontWeight:600}}>{initials}</div>
        <div style={{minWidth:0}}>
          <div style={{fontSize:'0.85rem',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.name}</div>
          <div style={{fontSize:'0.72rem',color:'var(--color-text-muted)'}}>{user?.role==='teacher'?'Profesor':'Estudiante'}</div>
        </div>
      </div>
      <button className="btn btn-ghost btn-sm" onClick={handleLogout} style={{width:'100%',justifyContent:'center',fontSize:'0.8rem'}}>Cerrar sesión</button>
    </div>
  )

  return (
    <>
      {/* Hamburger button - mobile only */}
      <button onClick={()=>setMobileOpen(true)} aria-label="Abrir menú" style={{
        display:'none', position:'fixed', top:14, left:14, zIndex:200,
        background:'var(--color-bg-card)', border:'1px solid var(--color-border)',
        borderRadius:'var(--radius-md)', padding:'8px 12px', cursor:'pointer',
        fontSize:'1.2rem', color:'var(--color-text-primary)', boxShadow:'0 2px 8px rgba(0,0,0,0.4)',
      }} className="hamburger-btn">☰</button>

      {/* Overlay - mobile only */}
      {mobileOpen && (
        <div onClick={()=>setMobileOpen(false)} className="sidebar-overlay" style={{
          display:'none', position:'fixed', inset:0, zIndex:299,
          background:'rgba(0,0,0,0.65)', backdropFilter:'blur(3px)',
        }}/>
      )}

      {/* Desktop sidebar */}
      <aside className="sidebar sidebar-desktop" style={{
        width:240, flexShrink:0, background:'var(--color-bg-card)',
        borderRight:'1px solid var(--color-border)', padding:'1.5rem 1rem',
        display:'flex', flexDirection:'column', position:'sticky',
        top:0, height:'100vh', overflowY:'auto',
      }}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:'2rem',padding:'0 0.5rem'}}>
          <span style={{fontSize:'1.25rem'}}>🎵</span>
          <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:'1rem'}}>MusicLearn</span>
        </div>
        <nav style={{display:'flex',flexDirection:'column',gap:'0.25rem',flex:1}}><NavLinks/></nav>
        <UserInfo/>
      </aside>

      {/* Mobile drawer */}
      <aside className="sidebar-mobile" style={{
        display:'none', position:'fixed', top:0, left:0, zIndex:300,
        width:270, height:'100vh', background:'var(--color-bg-card)',
        borderRight:'1px solid var(--color-border)', padding:'1.25rem 1rem',
        flexDirection:'column', overflowY:'auto',
        transform: mobileOpen?'translateX(0)':'translateX(-100%)',
        transition:'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        boxShadow:'4px 0 20px rgba(0,0,0,0.5)',
      }}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'2rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:'1.25rem'}}>🎵</span>
            <span style={{fontFamily:'var(--font-display)',fontWeight:700}}>MusicLearn</span>
          </div>
          <button onClick={()=>setMobileOpen(false)} style={{background:'transparent',border:'none',color:'var(--color-text-secondary)',fontSize:'1.5rem',cursor:'pointer',padding:4,lineHeight:1}}>✕</button>
        </div>
        <nav style={{display:'flex',flexDirection:'column',gap:'0.4rem',flex:1}}><NavLinks/></nav>
        <UserInfo/>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile  { display: flex !important; }
          .hamburger-btn   { display: block !important; }
          .sidebar-overlay { display: block !important; }
          .main-content    { padding: 1rem !important; padding-top: 64px !important; }
        }
      `}</style>
    </>
  )
}