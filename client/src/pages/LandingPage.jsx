import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { trackEvent } from '../services/analytics'

const INSTRUMENTS = [
  {
    id: 'guitar', icon: '🎸', name: 'Guitarra Acústica',
    desc: 'Desde acordes básicos hasta técnicas avanzadas de fingerpicking y rasgueos.',
    color: 'var(--color-guitar)', levels: ['Principiante', 'Intermedio', 'Avanzado']
  },
  {
    id: 'bass', icon: '🎵', name: 'Bajo Eléctrico',
    desc: 'Fundamentos del groove, teoría del ritmo y técnicas de slap & pop.',
    color: 'var(--color-bass)', levels: ['Principiante', 'Intermedio', 'Avanzado']
  },
  {
    id: 'piano', icon: '🎹', name: 'Piano',
    desc: 'Lectura musical, armonía, escalas y repertorio clásico y contemporáneo.',
    color: 'var(--color-piano)', levels: ['Principiante', 'Intermedio', 'Avanzado']
  },
  {
    id: 'vocal', icon: '🎤', name: 'Técnica Vocal',
    desc: 'Respiración, proyección, afinación y manejo del registro completo.',
    color: 'var(--color-vocal)', levels: ['Principiante', 'Intermedio', 'Avanzado']
  }
]

const TESTIMONIALS = [
  {
    name: 'Laura Martínez', instrument: 'Guitarra', avatar: 'LM', rating: 5,
    text: 'En 3 meses aprendí más que en 2 años con profesores anteriores. La metodología es increíble y el seguimiento de progreso me mantiene motivada.'
  },
  {
    name: 'Juan Rodríguez', instrument: 'Piano', avatar: 'JR', rating: 5,
    text: 'Las clases virtuales son perfectas para mi horario de trabajo. El profesor es muy paciente y las herramientas de la plataforma hacen todo más claro.'
  },
  {
    name: 'Camila Mejía', instrument: 'Vocal', avatar: 'CM', rating: 5,
    text: 'La técnica vocal mejoró notablemente. Los reportes de progreso me ayudan a ver exactamente en qué debo enfocarme cada semana.'
  }
]

const FEATURES = [
  { icon: '📊', title: 'Seguimiento de progreso', desc: 'Visualiza tu avance con barras de progreso, checklists y estadísticas detalladas.' },
  { icon: '📅', title: 'Agenda integrada', desc: 'Programa clases virtuales y presenciales desde el portal con sincronización a Google Calendar.' },
  { icon: '💬', title: 'Chat directo', desc: 'Comunícate con tu profesor en tiempo real para resolver dudas entre clases.' },
  { icon: '📄', title: 'Reportes PDF', desc: 'Recibe reportes detallados de tu avance mensual para compartir con familia o becas.' },
  { icon: '🎯', title: 'Metas personalizadas', desc: 'El sistema te sugiere objetivos según tu instrumento, nivel y ritmo de aprendizaje.' },
  { icon: '🔔', title: 'Notificaciones', desc: 'Nunca olvides una clase. Recibe recordatorios automáticos antes de cada sesión.' }
]

export default function LandingPage() {
  const heroRef = useRef(null)

  useEffect(() => {
    trackEvent('page_view', { page: 'landing' })
    // Parallax subtle on hero
    const onScroll = () => {
      if (heroRef.current) {
        const y = window.scrollY
        heroRef.current.style.transform = `translateY(${y * 0.3}px)`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ overflowX: 'hidden' }}>
      <Navbar />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(200,149,108,0.12), transparent)'
      }}>
        {/* Background grid */}
        <div ref={heroRef} style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)',
          backgroundSize: '60px 60px', pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, paddingTop: '6rem', paddingBottom: '4rem' }}>
          <div style={{ maxWidth: 700 }}>
            <div className="badge badge-accent animate-fade-in" style={{ marginBottom: '1.5rem' }}>
              🎵 Bogotá · Virtual &amp; Presencial
            </div>
            <h1 className="animate-fade-in-delay-1" style={{ marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
              Aprende música<br />
              <span style={{ color: 'var(--color-accent)' }}>a tu ritmo</span>
            </h1>
            <p className="animate-fade-in-delay-2" style={{ fontSize: '1.15rem', maxWidth: 560, marginBottom: '2.5rem' }}>
              Clases de guitarra, bajo, piano y técnica vocal en Bogotá. Metodología personalizada, seguimiento de progreso en tiempo real y comunicación directa con tu profesor.
            </p>
            <div className="animate-fade-in-delay-3" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                to="/register"
                className="btn btn-primary btn-lg"
                onClick={() => trackEvent('cta_click', { label: 'reserva_clase_hero' })}
              >
                🎸 Reserva tu clase
              </Link>
              <a
                href="#instrumentos"
                className="btn btn-outline btn-lg"
                onClick={() => trackEvent('cta_click', { label: 'ver_instrumentos' })}
              >
                Ver instrumentos
              </a>
            </div>

            {/* Social proof */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '2.5rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', marginRight: 4 }}>
                {['LM','JR','CM','AS','PR'].map((init, i) => (
                  <div key={i} className="avatar avatar-sm" style={{
                    background: 'var(--color-bg-elevated)',
                    border: '2px solid var(--color-bg)',
                    color: 'var(--color-accent)',
                    marginLeft: i > 0 ? -8 : 0,
                    fontSize: '0.65rem'
                  }}>
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>+80 estudiantes activos</div>
                <div style={{ display: 'flex', gap: 2 }}>{Array(5).fill('⭐').map((s,i)=><span key={i} style={{fontSize:'0.75rem'}}>{s}</span>)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating note decorations */}
        <FloatingNotes />
      </section>

      {/* ── INSTRUMENTOS ── */}
      <section id="instrumentos" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>Instrumentos</div>
            <h2>¿Qué quieres aprender?</h2>
            <p style={{ marginTop: '0.75rem', maxWidth: 500, margin: '0.75rem auto 0' }}>
              Cuatro instrumentos, un solo profesor apasionado. Clases diseñadas para cada nivel y objetivo.
            </p>
          </div>

          <div className="grid-4">
            {INSTRUMENTS.map(inst => (
              <div key={inst.id} className="card" style={{
                cursor: 'pointer', transition: 'all 0.3s',
                borderTop: `3px solid ${inst.color}`
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                onClick={() => trackEvent('instrument_card_click', { instrument: inst.id })}
              >
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{inst.icon}</div>
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.05rem' }}>{inst.name}</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>{inst.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {inst.levels.map(l => (
                    <span key={l} className="badge" style={{
                      background: `${inst.color}18`,
                      color: inst.color, fontSize: '0.7rem'
                    }}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODALIDAD ── */}
      <section className="section" style={{ background: 'var(--color-bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2>Virtual o presencial,<br />tú decides</h2>
          </div>
          <div className="grid-2">
            <ModalityCard
              icon="💻" title="Clases virtuales"
              color="var(--color-info)"
              features={[
                'Desde cualquier lugar de Colombia',
                'Google Meet incluido',
                'Grabación disponible (opcional)',
                'Materiales digitales compartidos',
                'Horarios flexibles AM/PM'
              ]}
            />
            <ModalityCard
              icon="📍" title="Clases presenciales"
              color="var(--color-accent)"
              features={[
                'Bogotá — zona norte y centro',
                'Estudio equipado con instrumentos',
                'Atención personalizada 1 a 1',
                'Posibilidad de usar tu propio instrumento',
                'Ambiente profesional y cómodo'
              ]}
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>Plataforma</div>
            <h2>Todo lo que necesitas para aprender</h2>
          </div>
          <div className="grid-3">
            {FEATURES.map(f => (
              <div key={f.title} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{f.icon}</span>
                <div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.4rem' }}>{f.title}</h3>
                  <p style={{ fontSize: '0.83rem' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonios" className="section" style={{ background: 'var(--color-bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div className="badge badge-accent" style={{ marginBottom: '1rem' }}>Testimonios</div>
            <h2>Lo que dicen los estudiantes</h2>
          </div>
          <div className="grid-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="card-elevated" style={{ position: 'relative' }}>
                <div style={{ fontSize: '2rem', color: 'var(--color-accent)', marginBottom: '1rem', opacity: 0.4 }}>"</div>
                <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>{t.text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="avatar avatar-md" style={{
                    background: 'var(--color-bg-input)',
                    color: 'var(--color-accent)',
                    border: '1px solid var(--color-border)'
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-accent)' }}>{t.instrument}</div>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                    {'⭐'.repeat(t.rating)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '1rem' }}>¿Listo para empezar?</h2>
          <p style={{ marginBottom: '2rem', maxWidth: 440, margin: '0 auto 2rem' }}>
            Primera clase de diagnóstico sin costo. Descubre tu nivel y diseñamos un plan personalizado para ti.
          </p>
          <Link
            to="/register"
            className="btn btn-primary btn-lg"
            onClick={() => trackEvent('cta_click', { label: 'reserva_clase_footer' })}
          >
            🎸 Reserva tu clase gratis
          </Link>
          <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
            Sin tarjeta requerida · Cancela cuando quieras
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}

/* ── Sub-components ── */

function Navbar() {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1rem 1.5rem',
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--color-border)',
      height: 64
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-text-primary)' }}>
        <span style={{ fontSize: '1.3rem' }}>🎵</span>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem' }}>MusicLearn</span>
      </Link>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <a href="#instrumentos" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Instrumentos</a>
        <a href="#testimonios" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Testimonios</a>
        <Link to="/login" className="btn btn-ghost btn-sm">Ingresar</Link>
        <Link to="/register" className="btn btn-primary btn-sm">Reserva tu clase</Link>
      </div>
    </nav>
  )
}

function ModalityCard({ icon, title, color, features }) {
  return (
    <div className="card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '1.75rem' }}>{icon}</span>
        <h3 style={{ fontSize: '1.15rem' }}>{title}</h3>
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--color-text-secondary)' }}>
            <span style={{ color, fontSize: '0.75rem' }}>●</span> {f}
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className="btn btn-outline btn-sm"
        style={{ marginTop: '1.5rem', borderColor: color, color }}
        onClick={() => trackEvent('cta_click', { label: 'modality_card', modality: title })}
      >
        Empezar ahora
      </Link>
    </div>
  )
}

function FloatingNotes() {
  const notes = ['♩','♪','♫','♬','🎵','🎶']
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {notes.map((note, i) => (
        <span key={i} style={{
          position: 'absolute',
          fontSize: `${1 + Math.random() * 1.5}rem`,
          opacity: 0.05 + Math.random() * 0.08,
          top: `${10 + Math.random() * 80}%`,
          left: `${70 + Math.random() * 25}%`,
          animation: `fadeIn ${2 + i * 0.4}s ease both`,
          animationDelay: `${i * 0.3}s`,
          color: 'var(--color-accent)'
        }}>{note}</span>
      ))}
    </div>
  )
}

function Footer() {
  return (
    <footer style={{
      background: 'var(--color-bg-card)',
      borderTop: '1px solid var(--color-border)',
      padding: '3rem 0 2rem'
    }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ maxWidth: 280 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🎵</span>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>MusicLearn</span>
            </div>
            <p style={{ fontSize: '0.85rem' }}>Clases de música en Bogotá. Virtual y presencial. Guitarra, bajo, piano y técnica vocal.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>Plataforma</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {['Instrumentos','Precios','Sobre nosotros'].map(l => (
                <a key={l} href="#" style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{l}</a>
              ))}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>Contacto</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
              <span>📍 Bogotá, Colombia</span>
              <span>📧 julian.cortez2010@gmail.com</span>
              <span>📱 WhatsApp disponible - + 57 3212350490</span>
            </div>
          </div>
        </div>
        <div className="divider" />
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} MusicLearn Bogotá. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}
