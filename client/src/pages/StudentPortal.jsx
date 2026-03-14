import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { trackEvent, trackTopicCompleted } from '../services/analytics'
import toast from 'react-hot-toast'

const INSTRUMENT_COLORS = { guitar:'var(--color-guitar)', bass:'var(--color-bass)', piano:'var(--color-piano)', vocal:'var(--color-vocal)' }
const INSTRUMENT_LABELS = { guitar:'Guitarra', bass:'Bajo', piano:'Piano', vocal:'Vocal' }
const LEVEL_LABELS = { beginner:'Principiante', intermediate:'Intermedio', advanced:'Avanzado' }

const MOCK_COURSE = {
  id: 'c1', title: 'Guitarra Acústica — Nivel Intermedio', instrument: 'guitar',
  progress: 82, completedTopics: 23, totalTopics: 28,
  topics: [
    { id:'t1', title:'Acordes abiertos',     subtopics: ['Do mayor','Re mayor','Mi mayor','Fa mayor','Sol mayor','La mayor'], completed: [0,1,2,3,4,5] },
    { id:'t2', title:'Posición de mano',     subtopics: ['Mano izquierda','Mano derecha','Postura del cuerpo'], completed: [0,1,2] },
    { id:'t3', title:'Rasgueos básicos',     subtopics: ['Rasgueo abajo','Rasgueo arriba','Patrón básico 4/4'], completed: [0,1,2] },
    { id:'t4', title:'Escala pentatónica',   subtopics: ['Posición 1','Posición 2','Aplicación en canción'], completed: [] },
    { id:'t5', title:'Barre chords',         subtopics: ['Fa mayor barre','Si bemol','Acorde movible'], completed: [] },
  ]
}

const MOCK_RECOMMENDATIONS = [
  { icon:'🎯', title:'Practicar escala pentatónica', desc:'15 min diarios — siguiente tema desbloqueado', priority:'high' },
  { icon:'📹', title:'Ver video: Introducción a Barre chords', desc:'Antes de la próxima clase', priority:'medium' },
  { icon:'💪', title:'Ejercicio de agilidad: dedos 1-2-3-4', desc:'En la cuerda 6, 5 min al día', priority:'low' },
]

const MOCK_NEXT_SESSION = {
  date: 'Hoy', time: '3:00 PM', topic: 'Escala pentatónica — Posición 1',
  modality: 'virtual', link: 'https://meet.google.com/abc-123'
}

export default function StudentPortal() {
  const { user } = useAuth()
  const [course, setCourse]     = useState(MOCK_COURSE)
  const [expanded, setExpanded] = useState('t4') // open next topic by default

  useEffect(() => { trackEvent('page_view', { page: 'student_portal' }) }, [])

  const handleToggleSubtopic = (topicId, subIdx) => {
    setCourse(prev => ({
      ...prev,
      topics: prev.topics.map(t => {
        if (t.id !== topicId) return t
        const completed = t.completed.includes(subIdx)
          ? t.completed.filter(i => i !== subIdx)
          : [...t.completed, subIdx]
        return { ...t, completed }
      })
    }))
    trackTopicCompleted(topicId, course.id)
  }

  const overallProgress = course.topics.reduce((acc, t) => acc + t.completed.length, 0)
  const totalSubs = course.topics.reduce((acc, t) => acc + t.subtopics.length, 0)
  const progressPct = Math.round((overallProgress / totalSubs) * 100)

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content" style={{ padding:'2rem', background:'var(--color-bg)' }}>

        {/* Greeting */}
        <div style={{ marginBottom:'2rem' }}>
          <h2 style={{ marginBottom:'0.25rem' }}>
            Hola, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p style={{ fontSize:'0.875rem' }}>
            {INSTRUMENT_LABELS[user?.instrument]} · {LEVEL_LABELS[user?.level]} · {user?.modality === 'virtual' ? '💻 Virtual' : '📍 Presencial'}
          </p>
        </div>

        {/* Next session banner */}
        <div style={{
          background:'rgba(106,159,216,0.07)', border:'1px solid rgba(106,159,216,0.2)',
          borderRadius:'var(--radius-lg)', padding:'1rem 1.25rem',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          marginBottom:'2rem', flexWrap:'wrap', gap:'1rem'
        }}>
          <div>
            <div style={{ fontSize:'0.78rem', color:'var(--color-info)', marginBottom:'2px', fontWeight:500 }}>
              PRÓXIMA CLASE
            </div>
            <div style={{ fontWeight:600 }}>{MOCK_NEXT_SESSION.date} a las {MOCK_NEXT_SESSION.time}</div>
            <div style={{ fontSize:'0.83rem', color:'var(--color-text-secondary)', marginTop:'2px' }}>
              {MOCK_NEXT_SESSION.topic}
            </div>
          </div>
          <a href={MOCK_NEXT_SESSION.link} target="_blank" rel="noreferrer"
            className="btn btn-sm"
            onClick={() => trackEvent('session_joined', { modality:'virtual' })}
            style={{ background:'var(--color-info)', color:'#fff', border:'none' }}>
            Unirse a Meet 💻
          </a>
        </div>

        <div className="grid-2" style={{ marginBottom:'2rem' }}>

          {/* Progress overview */}
          <div className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1rem' }}>
              <div>
                <h3 style={{ fontSize:'0.95rem', marginBottom:'0.25rem' }}>Mi progreso</h3>
                <p style={{ fontSize:'0.8rem' }}>{course.title}</p>
              </div>
              <div style={{ fontSize:'1.75rem', fontWeight:700, color:'var(--color-accent)' }}>{progressPct}%</div>
            </div>
            <div className="progress-bar" style={{ height:10, marginBottom:'0.5rem' }}>
              <div className="progress-fill" style={{ width:`${progressPct}%` }} />
            </div>
            <p style={{ fontSize:'0.78rem' }}>
              {overallProgress} de {totalSubs} subtemas completados
            </p>

            {/* Mini instrument badge */}
            <div style={{ marginTop:'1rem', display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
              <span className="badge" style={{ background:`${INSTRUMENT_COLORS[user?.instrument] || 'var(--color-accent)'}18`, color: INSTRUMENT_COLORS[user?.instrument] || 'var(--color-accent)' }}>
                {INSTRUMENT_LABELS[user?.instrument]}
              </span>
              <span className="badge badge-accent">{LEVEL_LABELS[user?.level]}</span>
            </div>
          </div>

          {/* Recommendations */}
          <div className="card">
            <h3 style={{ fontSize:'0.95rem', marginBottom:'1rem' }}>Recomendaciones</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
              {MOCK_RECOMMENDATIONS.map(r => (
                <div key={r.title} style={{
                  display:'flex', gap:'0.75rem', padding:'0.75rem',
                  background:'var(--color-bg-elevated)', borderRadius:'var(--radius-md)',
                  borderLeft:`3px solid ${r.priority==='high' ? 'var(--color-accent)' : r.priority==='medium' ? 'var(--color-warning)' : 'var(--color-border)'}`
                }}>
                  <span style={{ fontSize:'1.25rem', flexShrink:0 }}>{r.icon}</span>
                  <div>
                    <div style={{ fontSize:'0.85rem', fontWeight:500, marginBottom:'2px' }}>{r.title}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)' }}>{r.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Course checklist */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'0.5rem' }}>
            <h3 style={{ fontSize:'0.95rem' }}>Temario del curso</h3>
            <Link to={`/portal/curso/${course.id}`} className="btn btn-ghost btn-sm">
              Ver curso completo →
            </Link>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
            {course.topics.map(topic => {
              const isComplete = topic.completed.length === topic.subtopics.length
              const isOpen = expanded === topic.id
              const topicPct = topic.subtopics.length
                ? Math.round((topic.completed.length / topic.subtopics.length) * 100) : 0

              return (
                <div key={topic.id} style={{ border:'1px solid var(--color-border)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
                  {/* Topic header */}
                  <button
                    onClick={() => setExpanded(isOpen ? null : topic.id)}
                    style={{
                      width:'100%', display:'flex', alignItems:'center', gap:'0.75rem',
                      padding:'0.75rem 1rem', background: isComplete ? 'rgba(92,184,138,0.05)' : 'var(--color-bg-elevated)',
                      border:'none', cursor:'pointer', color:'var(--color-text-primary)', textAlign:'left'
                    }}
                  >
                    <div style={{
                      width:20, height:20, borderRadius:'50%', flexShrink:0,
                      background: isComplete ? 'var(--color-success)' : 'var(--color-bg-input)',
                      border: isComplete ? 'none' : '2px solid var(--color-border)',
                      display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem'
                    }}>
                      {isComplete && '✓'}
                    </div>
                    <span style={{ flex:1, fontWeight:500, fontSize:'0.875rem' }}>{topic.title}</span>
                    <span style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)' }}>
                      {topic.completed.length}/{topic.subtopics.length}
                    </span>
                    <div className="progress-bar" style={{ width:60 }}>
                      <div className="progress-fill" style={{ width:`${topicPct}%`, background: isComplete ? 'var(--color-success)' : undefined }} />
                    </div>
                    <span style={{ fontSize:'0.8rem', color:'var(--color-text-secondary)', transition:'transform 0.2s', display:'inline-block', transform: isOpen ? 'rotate(180deg)' : 'none' }}>▾</span>
                  </button>

                  {/* Subtopics */}
                  {isOpen && (
                    <div style={{ padding:'0.5rem 1rem 0.75rem', borderTop:'1px solid var(--color-border)', display:'flex', flexDirection:'column', gap:'0.4rem' }}>
                      {topic.subtopics.map((sub, idx) => {
                        const done = topic.completed.includes(idx)
                        return (
                          <label key={sub} style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', padding:'0.35rem 0.5rem', borderRadius:'var(--radius-sm)', transition:'background 0.15s' }}
                            onMouseEnter={e => e.currentTarget.style.background='var(--color-bg-elevated)'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            <input type="checkbox" checked={done}
                              onChange={() => handleToggleSubtopic(topic.id, idx)}
                              style={{ accentColor:'var(--color-accent)', width:14, height:14 }} />
                            <span style={{ fontSize:'0.845rem', textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--color-text-muted)' : 'var(--color-text-secondary)' }}>
                              {sub}
                            </span>
                            {done && <span style={{ marginLeft:'auto', fontSize:'0.7rem', color:'var(--color-success)' }}>✓</span>}
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
