import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import api from '../services/api'
import { trackEvent } from '../services/analytics'
import { generateStudentReport } from '../services/pdfService'
import toast from 'react-hot-toast'

const INSTRUMENT_COLORS = {
  guitar: 'var(--color-guitar)', bass: 'var(--color-bass)',
  piano: 'var(--color-piano)', vocal: 'var(--color-vocal)'
}
const INSTRUMENT_LABELS = { guitar:'Guitarra', bass:'Bajo', piano:'Piano', vocal:'Vocal' }

// ─── Mock data (replace with real API calls) ───
const MOCK_STATS = {
  totalStudents: 24, avgProgress: 67, topInstrument: 'guitar',
  attendance: 89, newThisMonth: 3
}
const MOCK_STUDENTS = [
  { id:'1', name:'Laura Martínez',  instrument:'guitar', level:'intermediate', progress:82, lastSeen:'Hoy',   modality:'virtual',    avatar:'LM' },
  { id:'2', name:'Juan Rodríguez',  instrument:'piano',  level:'beginner',     progress:54, lastSeen:'Ayer',  modality:'presential', avatar:'JR' },
  { id:'3', name:'Camila Mejía',    instrument:'vocal',  level:'intermediate', progress:71, lastSeen:'Hoy',   modality:'virtual',    avatar:'CM' },
  { id:'4', name:'Andrés Suárez',   instrument:'bass',   level:'beginner',     progress:38, lastSeen:'3d',    modality:'presential', avatar:'AS' },
  { id:'5', name:'Valentina López', instrument:'guitar', level:'advanced',     progress:91, lastSeen:'Hoy',   modality:'virtual',    avatar:'VL' },
  { id:'6', name:'Diego Herrera',   instrument:'piano',  level:'intermediate', progress:60, lastSeen:'2d',    modality:'virtual',    avatar:'DH' },
]
const MOCK_SESSIONS = [
  { id:'s1', studentName:'Laura Martínez', instrument:'guitar', time:'Hoy 3:00 PM',    modality:'virtual',    link:'https://meet.google.com/abc-123' },
  { id:'s2', studentName:'Juan Rodríguez', instrument:'piano',  time:'Hoy 5:00 PM',    modality:'presential', link:null },
  { id:'s3', studentName:'Camila Mejía',   instrument:'vocal',  time:'Mañana 10:00 AM',modality:'virtual',    link:'https://meet.google.com/def-456' },
  { id:'s4', studentName:'Andrés Suárez',  instrument:'bass',   time:'Mañana 4:00 PM', modality:'presential', link:null },
]
const INSTRUMENT_DIST = [
  { id:'guitar', label:'Guitarra', count:9,  pct:38 },
  { id:'piano',  label:'Piano',    count:7,  pct:29 },
  { id:'vocal',  label:'Vocal',    count:5,  pct:21 },
  { id:'bass',   label:'Bajo',     count:3,  pct:12 },
]

export default function TeacherDashboard() {
  const [students]  = useState(MOCK_STUDENTS)
  const [sessions]  = useState(MOCK_SESSIONS)
  const [stats]     = useState(MOCK_STATS)
  const [filter, setFilter]     = useState('all')
  const [sortBy, setSortBy]     = useState('name')
  const [pdfLoading, setPdfLoading] = useState(null)

  useEffect(() => { trackEvent('page_view', { page: 'teacher_dashboard' }) }, [])

  const filtered = students
    .filter(s => filter === 'all' || s.instrument === filter)
    .sort((a, b) => sortBy === 'name'
      ? a.name.localeCompare(b.name)
      : b.progress - a.progress)

  const handleDownloadReport = async (student) => {
    setPdfLoading(student.id)
    try {
      await generateStudentReport(student)
      trackEvent('report_downloaded', { student_id: student.id, type: 'progress' })
      toast.success(`Reporte de ${student.name} generado`)
    } catch {
      toast.error('Error al generar el reporte')
    } finally {
      setPdfLoading(null)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding: '2rem', overflowY: 'auto', background: 'var(--color-bg)' }}>

        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <h2 style={{ marginBottom:'0.25rem' }}>Dashboard</h2>
            <p style={{ fontSize:'0.875rem' }}>
              {new Date().toLocaleDateString('es-CO', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <Link to="/dashboard/calendar" className="btn btn-outline btn-sm">📅 Agendar clase</Link>
            <Link to="/dashboard/chat" className="btn btn-primary btn-sm">💬 Chat</Link>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid-4" style={{ marginBottom:'2rem' }}>
          <KpiCard icon="👥" label="Estudiantes" value={stats.totalStudents} sub={`+${stats.newThisMonth} este mes`} subColor="var(--color-success)" />
          <KpiCard icon="📈" label="Progreso promedio" value={`${stats.avgProgress}%`} bar={stats.avgProgress} barColor="var(--color-success)" />
          <KpiCard icon="🎸" label="Instrumento top" value={INSTRUMENT_LABELS[stats.topInstrument]} sub="9 de 24 estudiantes" />
          <KpiCard icon="✅" label="Asistencia" value={`${stats.attendance}%`} bar={stats.attendance} barColor="var(--color-info)" />
        </div>

        {/* Middle row */}
        <div className="grid-2" style={{ marginBottom:'2rem' }}>

          {/* Sessions today */}
          <div className="card">
            <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Próximas clases</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
              {sessions.map(s => (
                <SessionRow key={s.id} session={s} />
              ))}
            </div>
          </div>

          {/* Instrument distribution */}
          <div className="card">
            <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Distribución por instrumento</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {INSTRUMENT_DIST.map(ins => (
                <div key={ins.id}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'0.825rem', color:'var(--color-text-secondary)' }}>{ins.label}</span>
                    <span style={{ fontSize:'0.825rem', fontWeight:500 }}>{ins.count} · {ins.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${ins.pct}%`, background: INSTRUMENT_COLORS[ins.id] }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Students table */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem', flexWrap:'wrap', gap:'0.75rem' }}>
            <h3 style={{ fontSize:'0.95rem' }}>Estudiantes</h3>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              {/* Filter */}
              <div style={{ display:'flex', gap:'4px' }}>
                {['all','guitar','bass','piano','vocal'].map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className="btn btn-sm"
                    style={{
                      background: filter===f ? 'var(--color-accent)' : 'transparent',
                      color: filter===f ? '#fff' : 'var(--color-text-secondary)',
                      border: `1px solid ${filter===f ? 'var(--color-accent)' : 'var(--color-border)'}`,
                      padding:'4px 10px', fontSize:'0.75rem', borderRadius:6
                    }}>
                    {f==='all' ? 'Todos' : INSTRUMENT_LABELS[f]}
                  </button>
                ))}
              </div>
              <select className="form-input btn-sm" style={{ width:'auto', fontSize:'0.8rem', padding:'4px 28px 4px 10px' }}
                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="name">A–Z</option>
                <option value="progress">Por progreso</option>
              </select>
            </div>
          </div>

          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.86rem' }}>
              <thead>
                <tr style={{ borderBottom:'1px solid var(--color-border)' }}>
                  {['Estudiante','Instrumento','Nivel','Progreso','Modalidad','Última actividad','Acciones'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:'0.75rem', color:'var(--color-text-secondary)', fontWeight:500 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} style={{ borderBottom:'1px solid var(--color-border)' }}>
                    <td style={{ padding:'10px 10px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
                        <div className="avatar avatar-sm" style={{ background:'var(--color-bg-elevated)', color:`${INSTRUMENT_COLORS[s.instrument]}`, fontWeight:600 }}>
                          {s.avatar}
                        </div>
                        <span style={{ fontWeight:500 }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 10px' }}>
                      <span className="badge" style={{ background:`${INSTRUMENT_COLORS[s.instrument]}18`, color:INSTRUMENT_COLORS[s.instrument] }}>
                        {INSTRUMENT_LABELS[s.instrument]}
                      </span>
                    </td>
                    <td style={{ padding:'10px 10px', color:'var(--color-text-secondary)' }}>
                      {{beginner:'Principiante',intermediate:'Intermedio',advanced:'Avanzado'}[s.level]}
                    </td>
                    <td style={{ padding:'10px 10px', minWidth:120 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div className="progress-bar" style={{ flex:1 }}>
                          <div className="progress-fill" style={{ width:`${s.progress}%` }} />
                        </div>
                        <span style={{ fontSize:'0.78rem', fontWeight:500, minWidth:32 }}>{s.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding:'10px 10px' }}>
                      <span className="badge" style={{ background: s.modality==='virtual' ? 'rgba(106,159,216,0.12)' : 'rgba(200,149,108,0.12)', color: s.modality==='virtual' ? 'var(--color-info)' : 'var(--color-accent)' }}>
                        {s.modality==='virtual' ? '💻 Virtual' : '📍 Presencial'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 10px', color:'var(--color-text-secondary)', fontSize:'0.8rem' }}>{s.lastSeen}</td>
                    <td style={{ padding:'10px 10px' }}>
                      <div style={{ display:'flex', gap:'0.4rem' }}>
                        <Link to={`/dashboard/student/${s.id}`} className="btn btn-ghost btn-sm" style={{ padding:'4px 8px', fontSize:'0.75rem' }}>
                          Ver
                        </Link>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ padding:'4px 8px', fontSize:'0.75rem' }}
                          onClick={() => handleDownloadReport(s)}
                          disabled={pdfLoading === s.id}
                        >
                          {pdfLoading === s.id ? <span className="spinner" style={{width:12,height:12}} /> : '📄 PDF'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

function KpiCard({ icon, label, value, sub, subColor, bar, barColor }) {
  return (
    <div className="card" style={{ padding:'1.25rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
        <span style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontSize:'1.1rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize:'1.6rem', fontWeight:600, marginBottom:'0.35rem' }}>{value}</div>
      {sub && <div style={{ fontSize:'0.75rem', color: subColor || 'var(--color-text-muted)' }}>{sub}</div>}
      {bar !== undefined && (
        <div className="progress-bar" style={{ marginTop:'0.6rem' }}>
          <div className="progress-fill" style={{ width:`${bar}%`, background: barColor }} />
        </div>
      )}
    </div>
  )
}

function SessionRow({ session }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.6rem', borderRadius:'var(--radius-md)', background:'var(--color-bg-elevated)' }}>
      <div style={{ width:8, height:8, borderRadius:'50%', flexShrink:0, background: session.modality==='virtual' ? 'var(--color-info)' : 'var(--color-accent)' }} />
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
          {session.studentName}
        </div>
        <div style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)' }}>{session.time}</div>
      </div>
      {session.link && (
        <a href={session.link} target="_blank" rel="noreferrer"
          className="btn btn-sm" onClick={() => trackEvent('session_joined', { modality:'virtual' })}
          style={{ fontSize:'0.72rem', padding:'4px 8px', background:'rgba(106,159,216,0.12)', color:'var(--color-info)', border:'1px solid rgba(106,159,216,0.2)', borderRadius:6 }}>
          Unirse
        </a>
      )}
    </div>
  )
}
