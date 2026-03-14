import React, { useState, useEffect } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { trackEvent, trackClassBooked } from '../services/analytics'
import toast from 'react-hot-toast'

const DAYS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const MONTHS = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const MOCK_SESSIONS = [
  { id:'s1', date:'2025-01-20', time:'15:00', student:'Laura Martínez', instrument:'guitar', modality:'virtual', topic:'Escala pentatónica' },
  { id:'s2', date:'2025-01-20', time:'17:00', student:'Juan Rodríguez',  instrument:'piano',  modality:'presential', topic:'Manos separadas' },
  { id:'s3', date:'2025-01-22', time:'10:00', student:'Camila Mejía',    instrument:'vocal',  modality:'virtual', topic:'Proyección vocal' },
  { id:'s4', date:'2025-01-22', time:'16:00', student:'Andrés Suárez',   instrument:'bass',   modality:'presential', topic:'Groove básico' },
  { id:'s5', date:'2025-01-24', time:'14:00', student:'Valentina López', instrument:'guitar', modality:'virtual', topic:'Barre chords' },
  { id:'s6', date:'2025-01-27', time:'09:00', student:'Diego Herrera',   instrument:'piano',  modality:'virtual', topic:'Armonía básica' },
]

const INSTRUMENT_COLORS = { guitar:'var(--color-guitar)', bass:'var(--color-bass)', piano:'var(--color-piano)', vocal:'var(--color-vocal)' }

export default function CalendarPage() {
  const { user } = useAuth()
  const today    = new Date()
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newSession, setNewSession] = useState({ date:'', time:'', student:'', modality:'virtual', topic:'' })

  useEffect(() => { trackEvent('page_view', { page: 'calendar' }) }, [])

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const dateStr = (d) => `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const sessionsOn = (d) => MOCK_SESSIONS.filter(s => s.date === dateStr(d))
  const selectedSessions = selected ? sessionsOn(selected) : []

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }

  const handleBook = () => {
    toast.success('Clase agendada correctamente')
    trackClassBooked(newSession.modality, newSession.instrument || 'guitar')
    setShowModal(false)
    setNewSession({ date:'', time:'', student:'', modality:'virtual', topic:'' })
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main style={{ padding:'2rem', flex:1, background:'var(--color-bg)', overflowY:'auto' }}>

        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.75rem', flexWrap:'wrap', gap:'1rem' }}>
          <h2>Calendario</h2>
          {user?.role === 'teacher' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)}>
              + Agendar clase
            </button>
          )}
        </div>

        <div className="grid-2" style={{ alignItems:'start' }}>

          {/* Calendar grid */}
          <div className="card">
            {/* Month nav */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={prevMonth}>‹</button>
              <h3 style={{ fontSize:'0.95rem' }}>{MONTHS[month]} {year}</h3>
              <button className="btn btn-ghost btn-sm" onClick={nextMonth}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
              {DAYS.map(d => (
                <div key={d} style={{ textAlign:'center', fontSize:'0.72rem', color:'var(--color-text-muted)', fontWeight:500, padding:'4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
              {cells.map((day, i) => {
                if (!day) return <div key={i} />
                const hasSessions = sessionsOn(day).length > 0
                const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear()
                const isSelected = selected === day

                return (
                  <button
                    key={day}
                    onClick={() => setSelected(isSelected ? null : day)}
                    style={{
                      aspectRatio:'1', borderRadius:'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--color-accent)' : isToday ? '1px solid var(--color-accent)' : '1px solid transparent',
                      background: isSelected ? 'rgba(200,149,108,0.15)' : isToday ? 'rgba(200,149,108,0.06)' : 'transparent',
                      cursor:'pointer', display:'flex', flexDirection:'column',
                      alignItems:'center', justifyContent:'center', gap:2,
                      color: isToday ? 'var(--color-accent)' : 'var(--color-text-primary)',
                      fontSize:'0.82rem', fontWeight: isToday ? 600 : 400,
                      transition:'all 0.15s', padding:0
                    }}
                  >
                    {day}
                    {hasSessions && (
                      <div style={{ width:5, height:5, borderRadius:'50%', background:'var(--color-accent)' }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Selected day sessions */}
          <div className="card">
            <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>
              {selected
                ? `${selected} de ${MONTHS[month]}`
                : 'Selecciona un día'}
            </h3>

            {!selected && (
              <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>
                Haz clic en un día del calendario para ver las clases programadas.
              </p>
            )}

            {selected && selectedSessions.length === 0 && (
              <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Sin clases este día.</p>
            )}

            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {selectedSessions.map(s => (
                <div key={s.id} style={{
                  padding:'0.9rem', borderRadius:'var(--radius-md)',
                  background:'var(--color-bg-elevated)',
                  borderLeft:`3px solid ${INSTRUMENT_COLORS[s.instrument]}`
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'0.4rem' }}>
                    <div style={{ fontWeight:600, fontSize:'0.875rem' }}>{s.time} h</div>
                    <span className="badge" style={{ background: s.modality==='virtual' ? 'rgba(106,159,216,0.12)' : 'rgba(200,149,108,0.12)', color: s.modality==='virtual' ? 'var(--color-info)' : 'var(--color-accent)', fontSize:'0.7rem' }}>
                      {s.modality==='virtual' ? '💻 Virtual' : '📍 Presencial'}
                    </span>
                  </div>
                  {user?.role === 'teacher' && (
                    <div style={{ fontSize:'0.82rem', color:'var(--color-text-secondary)', marginBottom:'2px' }}>{s.student}</div>
                  )}
                  <div style={{ fontSize:'0.8rem', color:'var(--color-text-muted)' }}>{s.topic}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming sessions list */}
        <div className="card" style={{ marginTop:'1.5rem' }}>
          <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Próximas clases</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
            {MOCK_SESSIONS.slice(0,5).map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:'1rem', padding:'0.65rem 0', borderBottom:'1px solid var(--color-border)' }}>
                <div style={{ minWidth:80, fontSize:'0.8rem', color:'var(--color-text-secondary)' }}>
                  {s.date.slice(8)} {MONTHS[parseInt(s.date.slice(5,7))-1].slice(0,3)}<br />
                  <span style={{ fontWeight:500, color:'var(--color-text-primary)' }}>{s.time}</span>
                </div>
                <div style={{ width:3, height:36, borderRadius:2, background: INSTRUMENT_COLORS[s.instrument], flexShrink:0 }} />
                <div style={{ flex:1 }}>
                  {user?.role === 'teacher' && <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{s.student}</div>}
                  <div style={{ fontSize:'0.8rem', color:'var(--color-text-secondary)' }}>{s.topic}</div>
                </div>
                <span className="badge" style={{ background: s.modality==='virtual' ? 'rgba(106,159,216,0.12)' : 'rgba(200,149,108,0.12)', color: s.modality==='virtual' ? 'var(--color-info)' : 'var(--color-accent)', fontSize:'0.72rem' }}>
                  {s.modality==='virtual' ? '💻' : '📍'} {s.modality==='virtual' ? 'Virtual' : 'Presencial'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Book modal */}
        {showModal && (
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
            <div className="card-elevated" style={{ width:'100%', maxWidth:440 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h3 style={{ fontSize:'1rem' }}>Agendar clase</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <div className="form-group">
                  <label className="form-label">Estudiante</label>
                  <input className="form-input" placeholder="Nombre del estudiante" value={newSession.student} onChange={e => setNewSession(p=>({...p,student:e.target.value}))} />
                </div>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Fecha</label>
                    <input type="date" className="form-input" value={newSession.date} onChange={e => setNewSession(p=>({...p,date:e.target.value}))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora</label>
                    <input type="time" className="form-input" value={newSession.time} onChange={e => setNewSession(p=>({...p,time:e.target.value}))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Modalidad</label>
                  <select className="form-input" value={newSession.modality} onChange={e => setNewSession(p=>({...p,modality:e.target.value}))}>
                    <option value="virtual">Virtual (Google Meet)</option>
                    <option value="presential">Presencial — Bogotá</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tema de la clase</label>
                  <input className="form-input" placeholder="Ej: Escala pentatónica" value={newSession.topic} onChange={e => setNewSession(p=>({...p,topic:e.target.value}))} />
                </div>
                <div style={{ display:'flex', gap:'0.75rem', marginTop:'0.5rem' }}>
                  <button className="btn btn-ghost" style={{ flex:1 }} onClick={() => setShowModal(false)}>Cancelar</button>
                  <button className="btn btn-primary" style={{ flex:1 }} onClick={handleBook}>Agendar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
