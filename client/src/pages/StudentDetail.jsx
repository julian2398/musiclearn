import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import { generateStudentReport } from '../services/pdfService'
import { trackReportDownloaded } from '../services/analytics'
import toast from 'react-hot-toast'

const MOCK_STUDENT = {
  id:'1', name:'Laura Martínez', avatar:'LM', email:'laura@email.com',
  instrument:'guitar', level:'intermediate', modality:'virtual',
  progress:82, attendance:90, totalClasses:18, completedClasses:16,
  joinDate:'2024-09-15', lastClass:'2025-01-18',
  goal:'Aprender una canción completa',
  topics: [
    { title:'Acordes abiertos', pct:100 },
    { title:'Posición de mano', pct:100 },
    { title:'Rasgueos básicos', pct:100 },
    { title:'Escala pentatónica', pct:30 },
    { title:'Barre chords', pct:0 },
  ],
  sessions: [
    { date:'2025-01-18', topic:'Rasgueos avanzados', attended:true, notes:'Excelente progreso' },
    { date:'2025-01-11', topic:'Escala pentatónica intro', attended:true, notes:'Necesita practicar posición 1' },
    { date:'2025-01-04', topic:'Cambios de acorde', attended:false, notes:'Ausente — reagendada' },
    { date:'2024-12-21', topic:'Acordes mayores', attended:true, notes:'Dominó todos los acordes básicos' },
  ]
}

export default function StudentDetail() {
  const { id } = useParams()
  const s = MOCK_STUDENT
  const [pdfLoading, setPdfLoading] = useState(false)
  const [note, setNote] = useState('')

  const handleReport = async () => {
    setPdfLoading(true)
    try {
      await generateStudentReport(s)
      trackReportDownloaded(s.id, 'progress')
      toast.success('Reporte PDF generado')
    } catch {
      toast.error('Error al generar reporte')
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main style={{ padding:'2rem', flex:1, background:'var(--color-bg)', overflowY:'auto' }}>

        {/* Back */}
        <Link to="/dashboard" style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:'0.85rem', color:'var(--color-text-secondary)', marginBottom:'1.5rem' }}>
          ← Volver al dashboard
        </Link>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:'1.25rem', marginBottom:'2rem', flexWrap:'wrap' }}>
          <div className="avatar avatar-lg" style={{ background:'var(--color-bg-elevated)', color:'var(--color-guitar)', border:'2px solid var(--color-border)', fontWeight:700, fontSize:'1.1rem' }}>
            {s.avatar}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ marginBottom:'0.25rem' }}>{s.name}</h2>
            <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <span className="badge badge-accent">🎸 Guitarra</span>
              <span className="badge badge-info">Intermedio</span>
              <span className="badge" style={{ background:'rgba(106,159,216,0.12)', color:'var(--color-info)' }}>💻 Virtual</span>
            </div>
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <Link to="/dashboard/chat" className="btn btn-outline btn-sm">💬 Mensaje</Link>
            <button className="btn btn-primary btn-sm" onClick={handleReport} disabled={pdfLoading}>
              {pdfLoading ? <span className="spinner" style={{width:14,height:14}} /> : '📄 Reporte PDF'}
            </button>
          </div>
        </div>

        {/* KPI row */}
        <div className="grid-4" style={{ marginBottom:'2rem' }}>
          {[
            { label:'Progreso total', value:`${s.progress}%`, bar:s.progress },
            { label:'Asistencia', value:`${s.attendance}%`, bar:s.attendance },
            { label:'Clases completadas', value:`${s.completedClasses}/${s.totalClasses}` },
            { label:'Meta', value:s.goal, small:true },
          ].map(k => (
            <div key={k.label} className="card" style={{ padding:'1.25rem' }}>
              <div style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)', marginBottom:'0.4rem' }}>{k.label}</div>
              <div style={{ fontSize: k.small ? '0.85rem' : '1.5rem', fontWeight: k.small ? 400 : 600, color: k.small ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>{k.value}</div>
              {k.bar !== undefined && (
                <div className="progress-bar" style={{ marginTop:'0.5rem' }}>
                  <div className="progress-fill" style={{ width:`${k.bar}%` }} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="grid-2">

          {/* Topics progress */}
          <div className="card">
            <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Progreso por tema</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {s.topics.map(t => (
                <div key={t.title}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                    <span style={{ fontSize:'0.83rem', color:'var(--color-text-secondary)' }}>{t.title}</span>
                    <span style={{ fontSize:'0.83rem', fontWeight:500 }}>{t.pct}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width:`${t.pct}%`, background: t.pct===100 ? 'var(--color-success)' : undefined }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session history */}
          <div className="card">
            <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Historial de clases</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {s.sessions.map(sess => (
                <div key={sess.date} style={{ padding:'0.75rem', borderRadius:'var(--radius-md)', background:'var(--color-bg-elevated)', borderLeft:`3px solid ${sess.attended ? 'var(--color-success)' : 'var(--color-danger)'}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'3px' }}>
                    <span style={{ fontSize:'0.82rem', fontWeight:500 }}>{sess.topic}</span>
                    <span className="badge" style={{ background: sess.attended ? 'rgba(92,184,138,0.12)' : 'rgba(224,96,96,0.12)', color: sess.attended ? 'var(--color-success)' : 'var(--color-danger)', fontSize:'0.68rem' }}>
                      {sess.attended ? 'Asistió' : 'Ausente'}
                    </span>
                  </div>
                  <div style={{ fontSize:'0.77rem', color:'var(--color-text-secondary)' }}>{sess.date}</div>
                  {sess.notes && <div style={{ fontSize:'0.77rem', color:'var(--color-text-muted)', marginTop:'3px', fontStyle:'italic' }}>{sess.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher notes */}
        <div className="card" style={{ marginTop:'1.5rem' }}>
          <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Notas del profesor</h3>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Escribe observaciones sobre el progreso de este estudiante..."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ resize:'vertical', marginBottom:'0.75rem' }}
          />
          <button className="btn btn-primary btn-sm" onClick={() => { toast.success('Nota guardada'); setNote('') }}>
            Guardar nota
          </button>
        </div>
      </main>
    </div>
  )
}
