import React, { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Sidebar from '../components/shared/Sidebar'
import { trackTopicCompleted, trackCourseStarted } from '../services/analytics'

const MOCK_COURSE = {
  id:'c1', title:'Guitarra Acústica', level:'Intermedio', instrument:'guitar',
  description:'Domina los fundamentos de la guitarra acústica: acordes, ritmos, escalas y canciones completas.',
  topics: [
    {
      id:'t1', title:'Acordes abiertos', order:1,
      subtopics:[
        { id:'s1', title:'Do mayor — posición básica', type:'video', completed:true },
        { id:'s2', title:'Re mayor — digitación', type:'video', completed:true },
        { id:'s3', title:'Mi mayor', type:'video', completed:true },
        { id:'s4', title:'Fa mayor — intro', type:'pdf', completed:true },
        { id:'s5', title:'Sol mayor', type:'video', completed:true },
        { id:'s6', title:'La mayor', type:'video', completed:true },
      ]
    },
    {
      id:'t2', title:'Posición de mano', order:2,
      subtopics:[
        { id:'s7', title:'Mano izquierda — colocación', type:'video', completed:true },
        { id:'s8', title:'Mano derecha — postura', type:'video', completed:true },
        { id:'s9', title:'Postura del cuerpo', type:'pdf', completed:true },
      ]
    },
    {
      id:'t3', title:'Rasgueos básicos', order:3,
      subtopics:[
        { id:'s10', title:'Rasgueo hacia abajo — patrón 1', type:'video', completed:true },
        { id:'s11', title:'Rasgueo hacia arriba — patrón 2', type:'video', completed:true },
        { id:'s12', title:'Patrón combinado 4/4', type:'exercise', completed:true },
      ]
    },
    {
      id:'t4', title:'Escala pentatónica', order:4,
      subtopics:[
        { id:'s13', title:'Qué es una escala pentatónica', type:'video', completed:false },
        { id:'s14', title:'Posición 1 — La menor', type:'video', completed:false },
        { id:'s15', title:'Posición 2 — Extensión', type:'video', completed:false },
        { id:'s16', title:'Aplicación en una canción', type:'exercise', completed:false },
      ]
    },
    {
      id:'t5', title:'Barre chords', order:5,
      subtopics:[
        { id:'s17', title:'Por qué cuesta el barre', type:'video', completed:false },
        { id:'s18', title:'Fa mayor barre — paso a paso', type:'video', completed:false },
        { id:'s19', title:'Si bemol mayor', type:'video', completed:false },
        { id:'s20', title:'El acorde movible', type:'exercise', completed:false },
      ]
    }
  ]
}

const TYPE_ICONS = { video:'▶', pdf:'📄', exercise:'💪' }
const TYPE_LABELS = { video:'Video', pdf:'PDF', exercise:'Ejercicio' }

export default function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(MOCK_COURSE)
  const [activeTopicId, setActiveTopicId] = useState('t4')

  const activeTopic = course.topics.find(t => t.id === activeTopicId)
  const totalSubs = course.topics.reduce((acc, t) => acc + t.subtopics.length, 0)
  const completedSubs = course.topics.reduce((acc, t) => acc + t.subtopics.filter(s => s.completed).length, 0)
  const progressPct = Math.round((completedSubs / totalSubs) * 100)

  const toggleSubtopic = (topicId, subId) => {
    setCourse(prev => ({
      ...prev,
      topics: prev.topics.map(t => {
        if (t.id !== topicId) return t
        return {
          ...t,
          subtopics: t.subtopics.map(s => s.id === subId ? { ...s, completed: !s.completed } : s)
        }
      })
    }))
    trackTopicCompleted(subId, id)
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main style={{ flex:1, display:'flex', overflow:'hidden', background:'var(--color-bg)' }}>

        {/* Topic list sidebar */}
        <div style={{ width:260, flexShrink:0, borderRight:'1px solid var(--color-border)', background:'var(--color-bg-card)', display:'flex', flexDirection:'column', overflowY:'auto' }}>
          <div style={{ padding:'1.25rem 1rem', borderBottom:'1px solid var(--color-border)' }}>
            <Link to="/portal" style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', display:'flex', alignItems:'center', gap:4, marginBottom:'0.75rem' }}>
              ← Mi portal
            </Link>
            <h3 style={{ fontSize:'0.9rem', marginBottom:'0.5rem' }}>{course.title}</h3>
            <div style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', marginBottom:'0.75rem' }}>{course.level}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width:`${progressPct}%` }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.75rem', marginTop:'4px' }}>
              <span style={{ color:'var(--color-text-muted)' }}>{completedSubs}/{totalSubs} subtemas</span>
              <span style={{ color:'var(--color-accent)' }}>{progressPct}%</span>
            </div>
          </div>

          <nav style={{ padding:'0.5rem 0' }}>
            {course.topics.map(t => {
              const topicCompleted = t.subtopics.every(s => s.completed)
              const topicProgress = Math.round((t.subtopics.filter(s=>s.completed).length / t.subtopics.length) * 100)
              const isActive = activeTopicId === t.id
              return (
                <button key={t.id} onClick={() => setActiveTopicId(t.id)}
                  style={{
                    width:'100%', display:'flex', alignItems:'center', gap:'0.6rem',
                    padding:'0.7rem 1rem', border:'none', cursor:'pointer', textAlign:'left',
                    background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
                    color:'var(--color-text-primary)', transition:'background 0.15s'
                  }}>
                  <div style={{ width:18, height:18, borderRadius:'50%', flexShrink:0, border: topicCompleted ? 'none' : '2px solid var(--color-border)', background: topicCompleted ? 'var(--color-success)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', color:'#fff' }}>
                    {topicCompleted && '✓'}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'0.83rem', fontWeight: isActive ? 500 : 400, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{t.title}</div>
                    {!topicCompleted && topicProgress > 0 && (
                      <div className="progress-bar" style={{ marginTop:3 }}>
                        <div className="progress-fill" style={{ width:`${topicProgress}%` }} />
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content area */}
        <div style={{ flex:1, overflowY:'auto', padding:'2rem' }}>
          {activeTopic && (
            <>
              <div style={{ marginBottom:'1.5rem' }}>
                <h2 style={{ marginBottom:'0.5rem', fontSize:'1.4rem' }}>{activeTopic.title}</h2>
                <p style={{ fontSize:'0.875rem' }}>
                  {activeTopic.subtopics.filter(s=>s.completed).length} de {activeTopic.subtopics.length} subtemas completados
                </p>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'0.6rem' }}>
                {activeTopic.subtopics.map((sub, idx) => (
                  <div key={sub.id} style={{
                    display:'flex', alignItems:'center', gap:'1rem',
                    padding:'1rem 1.25rem',
                    border:`1px solid ${sub.completed ? 'rgba(92,184,138,0.25)' : 'var(--color-border)'}`,
                    borderRadius:'var(--radius-md)',
                    background: sub.completed ? 'rgba(92,184,138,0.04)' : 'var(--color-bg-card)',
                    transition:'all 0.2s'
                  }}>
                    <input type="checkbox" checked={sub.completed}
                      onChange={() => toggleSubtopic(activeTopic.id, sub.id)}
                      style={{ accentColor:'var(--color-accent)', width:16, height:16, flexShrink:0 }} />

                    <span style={{ fontSize:'1.2rem' }}>{TYPE_ICONS[sub.type]}</span>

                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:500, fontSize:'0.9rem', textDecoration: sub.completed ? 'line-through' : 'none', color: sub.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)' }}>
                        {sub.title}
                      </div>
                      <div style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginTop:'2px' }}>
                        {TYPE_LABELS[sub.type]}
                      </div>
                    </div>

                    {sub.completed && (
                      <span className="badge badge-success" style={{ fontSize:'0.72rem' }}>✓ Completado</span>
                    )}

                    {!sub.completed && (
                      <button className="btn btn-sm btn-outline" style={{ fontSize:'0.75rem' }}>
                        Abrir
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
