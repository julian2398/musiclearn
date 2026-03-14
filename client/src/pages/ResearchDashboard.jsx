import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getAllSessions, calcMetrics, exportSessionsJSON, clearAllSessions } from '../services/researchService'
import toast from 'react-hot-toast'

const STEP_NAMES = { 1:'Bienvenida', 2:'Instrumento', 3:'Nivel musical', 4:'Modalidad', 5:'Datos perfil', 6:'Logro', 7:'Primera meta' }

export default function ResearchDashboard() {
  const [sessions, setSessions] = useState([])
  const [metrics, setMetrics]   = useState(null)
  const [view, setView]         = useState('overview') // overview | sessions | survey

  useEffect(() => { load() }, [])

  const load = () => {
    const s = getAllSessions()
    setSessions(s)
    setMetrics(calcMetrics(s))
  }

  const handleExport = () => {
    exportSessionsJSON()
    toast.success('JSON exportado correctamente')
  }

  const handleClear = () => {
    if (!window.confirm('¿Seguro que quieres borrar todos los datos de investigación?')) return
    clearAllSessions()
    setSessions([])
    setMetrics(null)
    toast.success('Datos borrados')
  }

  const fmtTime = (ms) => {
    if (!ms) return '—'
    if (ms < 60000) return `${Math.round(ms/1000)}s`
    return `${Math.floor(ms/60000)}m ${Math.round((ms%60000)/1000)}s`
  }

  return (
    <div style={{ minHeight:'100vh', background:'var(--color-bg)', padding:'2rem' }}>

      {/* Header */}
      <div style={{ maxWidth:1100, margin:'0 auto' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:'0.25rem' }}>
              <span style={{ fontSize:'1.2rem' }}>🔬</span>
              <h2 style={{ fontSize:'1.25rem' }}>Dashboard de Investigación UX</h2>
            </div>
            <p style={{ fontSize:'0.82rem' }}>
              Test de usabilidad · Thinking Aloud · Encuesta interceptada · NPS — Onboarding MusicLearn
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.5rem', flexWrap:'wrap' }}>
            <button className="btn btn-outline btn-sm" onClick={load}>↺ Actualizar</button>
            <button className="btn btn-outline btn-sm" onClick={handleExport} disabled={!sessions.length}>📥 Exportar JSON</button>
            <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ color:'var(--color-danger)' }}>🗑 Limpiar</button>
            <Link to="/" className="btn btn-ghost btn-sm">← Inicio</Link>
          </div>
        </div>

        {/* No data */}
        {!sessions.length && (
          <div className="card" style={{ textAlign:'center', padding:'3rem' }}>
            <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>📊</div>
            <h3 style={{ marginBottom:'0.5rem' }}>Aún no hay sesiones registradas</h3>
            <p style={{ fontSize:'0.875rem', marginBottom:'1.5rem' }}>
              Pide a tus 20 usuarios que se registren en la plataforma y completen (o abandonen) el onboarding.<br/>
              Cada sesión se guarda automáticamente aquí.
            </p>
            <Link to="/register" className="btn btn-primary">Probar el onboarding →</Link>
          </div>
        )}

        {sessions.length > 0 && (
          <>
            {/* Tabs */}
            <div style={{ display:'flex', gap:'0.25rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--color-border)', paddingBottom:'0' }}>
              {[['overview','📊 Resumen'],['sessions','👥 Sesiones'],['survey','💬 Encuestas']].map(([id,label]) => (
                <button key={id} onClick={() => setView(id)}
                  style={{ padding:'0.6rem 1.1rem', border:'none', background:'transparent', cursor:'pointer', fontSize:'0.875rem', color: view===id ? 'var(--color-accent)' : 'var(--color-text-secondary)', borderBottom: view===id ? '2px solid var(--color-accent)' : '2px solid transparent', transition:'all 0.15s', fontFamily:'var(--font-body)' }}>
                  {label}
                </button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {view === 'overview' && metrics && (
              <>
                {/* KPI row */}
                <div className="grid-4" style={{ marginBottom:'1.5rem' }}>
                  <KPI icon="👥" label="Sesiones totales" value={metrics.total} />
                  <KPI icon="✅" label="Completaron" value={metrics.completed} sub={`${metrics.convRate}% conversión`} subColor={metrics.convRate>=60?'var(--color-success)':'var(--color-danger)'} />
                  <KPI icon="🚪" label="Abandonaron" value={metrics.abandoned} sub={`${100-metrics.convRate}% tasa abandono`} subColor="var(--color-warning)" />
                  <KPI icon="⭐" label="NPS promedio" value={metrics.avgNPS !== null ? metrics.avgNPS : '—'} sub={metrics.avgNPS !== null ? npsCategory(metrics.avgNPS) : 'Sin datos'} subColor={metrics.avgNPS >= 7 ? 'var(--color-success)' : 'var(--color-warning)'} />
                </div>

                <div className="grid-2" style={{ marginBottom:'1.5rem' }}>

                  {/* Abandono por paso */}
                  <div className="card">
                    <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Abandono por paso</h3>
                    {Object.keys(STEP_NAMES).map(s => {
                      const count = metrics.stepAbandons[s] || 0
                      const pct = metrics.abandoned ? Math.round((count/metrics.abandoned)*100) : 0
                      return (
                        <div key={s} style={{ marginBottom:'0.75rem' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                            <span style={{ fontSize:'0.82rem', color:'var(--color-text-secondary)' }}>Paso {s} — {STEP_NAMES[s]}</span>
                            <span style={{ fontSize:'0.82rem', fontWeight:500, color: count > 0 ? 'var(--color-warning)' : 'var(--color-text-muted)' }}>{count} usuario{count!==1?'s':''} ({pct}%)</span>
                          </div>
                          <div className="progress-bar">
                            <div style={{ height:'100%', width:`${pct}%`, background: pct>30?'var(--color-danger)':pct>15?'var(--color-warning)':'var(--color-success)', borderRadius:3, transition:'width 0.6s ease' }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Tiempo promedio por paso */}
                  <div className="card">
                    <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Tiempo promedio por paso</h3>
                    {Object.keys(STEP_NAMES).map(s => {
                      const t = metrics.avgStepTime[s]
                      return (
                        <div key={s} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.5rem 0', borderBottom:'1px solid var(--color-border)' }}>
                          <span style={{ fontSize:'0.82rem', color:'var(--color-text-secondary)' }}>Paso {s} — {STEP_NAMES[s]}</span>
                          <span style={{ fontSize:'0.82rem', fontWeight:500, color: t>120?'var(--color-danger)':t>60?'var(--color-warning)':'var(--color-text-primary)' }}>
                            {t ? `${t}s` : '—'}
                            {t>120 && ' ⚠️'}
                          </span>
                        </div>
                      )
                    })}
                    <p style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', marginTop:'0.5rem' }}>⚠️ = más de 2 minutos (posible fricción)</p>
                  </div>
                </div>

                {/* Devices + Conversion funnel */}
                <div className="grid-2">
                  <div className="card">
                    <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Embudo de conversión</h3>
                    {[1,2,3,4,5,6,7].map(s => {
                      const reached = sessions.filter(sess => sess.steps.some(st => st.step === s)).length
                      const pct = metrics.total ? Math.round((reached/metrics.total)*100) : 0
                      return (
                        <div key={s} style={{ marginBottom:'0.6rem' }}>
                          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                            <span style={{ fontSize:'0.8rem', color:'var(--color-text-secondary)' }}>Paso {s} — {STEP_NAMES[s]}</span>
                            <span style={{ fontSize:'0.8rem', fontWeight:500 }}>{reached} · {pct}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width:`${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="card">
                    <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Dispositivos</h3>
                    {Object.entries(metrics.devices).map(([d, count]) => (
                      <div key={d} style={{ display:'flex', justifyContent:'space-between', padding:'0.5rem 0', borderBottom:'1px solid var(--color-border)' }}>
                        <span style={{ fontSize:'0.85rem' }}>{d === 'mobile' ? '📱 Móvil' : '💻 Escritorio'}</span>
                        <span style={{ fontSize:'0.85rem', fontWeight:500 }}>{count} ({Math.round((count/metrics.total)*100)}%)</span>
                      </div>
                    ))}
                    <div style={{ marginTop:'1rem' }}>
                      <h4 style={{ fontSize:'0.82rem', fontWeight:500, marginBottom:'0.5rem', color:'var(--color-text-secondary)' }}>Tiempo total promedio</h4>
                      <div style={{ fontSize:'1.5rem', fontWeight:600, color:'var(--color-accent)' }}>
                        {fmtTime(sessions.filter(s=>s.completedAt).reduce((acc,s)=>acc+(s.totalTimeMs||0),0) / (metrics.completed||1))}
                      </div>
                      <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)' }}>Para usuarios que completaron</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── SESIONES ── */}
            {view === 'sessions' && (
              <div className="card">
                <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Todas las sesiones ({sessions.length})</h3>
                <div style={{ overflowX:'auto' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom:'1px solid var(--color-border)' }}>
                        {['ID sesión','Inicio','Duración','Pasos completados','Estado','Dispositivo','NPS'].map(h => (
                          <th key={h} style={{ textAlign:'left', padding:'8px 10px', fontSize:'0.75rem', color:'var(--color-text-secondary)', fontWeight:500 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map(s => {
                        const completed = s.steps.filter(st => st.completed).length
                        const status = s.completedAt ? 'Completó' : s.abandonedAt ? 'Abandonó' : 'En progreso'
                        const statusColor = s.completedAt ? 'var(--color-success)' : s.abandonedAt ? 'var(--color-danger)' : 'var(--color-warning)'
                        return (
                          <tr key={s.id} style={{ borderBottom:'1px solid var(--color-border)' }}>
                            <td style={{ padding:'8px 10px', fontFamily:'var(--font-mono)', fontSize:'0.75rem', color:'var(--color-text-muted)' }}>{s.id.slice(-8)}</td>
                            <td style={{ padding:'8px 10px', color:'var(--color-text-secondary)' }}>{s.startedAt ? new Date(s.startedAt).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : '—'}</td>
                            <td style={{ padding:'8px 10px' }}>{fmtTime(s.totalTimeMs)}</td>
                            <td style={{ padding:'8px 10px' }}>{completed}/7</td>
                            <td style={{ padding:'8px 10px' }}><span style={{ color:statusColor, fontWeight:500 }}>{status}</span></td>
                            <td style={{ padding:'8px 10px', color:'var(--color-text-secondary)' }}>{s.deviceType==='mobile'?'📱':'💻'} {s.deviceType}</td>
                            <td style={{ padding:'8px 10px', fontWeight:500, color: s.nps>=7?'var(--color-success)':s.nps!==null?'var(--color-warning)':'var(--color-text-muted)' }}>{s.nps !== null && s.nps !== undefined ? s.nps : '—'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── ENCUESTAS ── */}
            {view === 'survey' && (
              <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>

                {/* Razones de abandono */}
                <div className="card">
                  <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Razones de abandono (Pregunta 1)</h3>
                  {(() => {
                    const answers = sessions.map(s=>s.surveyAnswers?.q1).filter(Boolean)
                    if (!answers.length) return <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Sin respuestas aún</p>
                    const counts = answers.reduce((acc,a) => { acc[a]=(acc[a]||0)+1; return acc }, {})
                    const total = answers.length
                    return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([ans, count]) => (
                      <div key={ans} style={{ marginBottom:'0.75rem' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                          <span style={{ fontSize:'0.83rem', color:'var(--color-text-secondary)' }}>{ans}</span>
                          <span style={{ fontSize:'0.83rem', fontWeight:500 }}>{count} ({Math.round((count/total)*100)}%)</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width:`${Math.round((count/total)*100)}%`, background:'var(--color-warning)' }} />
                        </div>
                      </div>
                    ))
                  })()}
                </div>

                {/* Claridad del proceso */}
                <div className="card">
                  <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Claridad del proceso (Pregunta 2 — escala 1-5)</h3>
                  {(() => {
                    const answers = sessions.map(s=>s.surveyAnswers?.q2).filter(Boolean)
                    if (!answers.length) return <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Sin respuestas aún</p>
                    const avg = (answers.reduce((a,b)=>a+parseInt(b),0)/answers.length).toFixed(1)
                    const counts = [1,2,3,4,5].map(n => ({ n, count: answers.filter(a=>parseInt(a)===n).length }))
                    return (
                      <>
                        <div style={{ fontSize:'2rem', fontWeight:700, color:'var(--color-accent)', marginBottom:'1rem' }}>{avg} / 5</div>
                        {counts.map(({ n, count }) => (
                          <div key={n} style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                            <span style={{ width:16, fontSize:'0.82rem', color:'var(--color-text-secondary)' }}>{n}</span>
                            <div className="progress-bar" style={{ flex:1 }}>
                              <div className="progress-fill" style={{ width:`${answers.length?Math.round((count/answers.length)*100):0}%` }} />
                            </div>
                            <span style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', minWidth:24 }}>{count}</span>
                          </div>
                        ))}
                      </>
                    )
                  })()}
                </div>

                {/* Thinking Aloud comments */}
                <div className="card">
                  <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Comentarios Thinking Aloud</h3>
                  {(() => {
                    const comments = sessions.flatMap(s => s.steps.map(st => st.comment ? { step: st.step, stepName: STEP_NAMES[st.step], comment: st.comment } : null).filter(Boolean))
                    if (!comments.length) return <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Sin comentarios aún</p>
                    return comments.map((c, i) => (
                      <div key={i} style={{ padding:'0.75rem', marginBottom:'0.5rem', background:'var(--color-bg-elevated)', borderRadius:'var(--radius-md)', borderLeft:'3px solid var(--color-info)' }}>
                        <div style={{ fontSize:'0.72rem', color:'var(--color-info)', marginBottom:'4px', fontWeight:500 }}>Paso {c.step} — {c.stepName}</div>
                        <div style={{ fontSize:'0.85rem', fontStyle:'italic', color:'var(--color-text-secondary)' }}>"{c.comment}"</div>
                      </div>
                    ))
                  })()}
                </div>

                {/* Sugerencias */}
                <div className="card">
                  <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Sugerencias de mejora (Pregunta 3)</h3>
                  {(() => {
                    const sugs = sessions.map(s => s.surveyAnswers?.q3).filter(Boolean)
                    if (!sugs.length) return <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Sin sugerencias aún</p>
                    return sugs.map((s,i) => (
                      <div key={i} style={{ padding:'0.75rem', marginBottom:'0.5rem', background:'var(--color-bg-elevated)', borderRadius:'var(--radius-md)', borderLeft:'3px solid var(--color-accent)' }}>
                        <div style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)' }}>{s}</div>
                      </div>
                    ))
                  })()}
                </div>

                {/* NPS comments */}
                <div className="card">
                  <h3 style={{ fontSize:'0.9rem', marginBottom:'1rem' }}>Comentarios NPS</h3>
                  {(() => {
                    const comments = sessions.map(s => ({ score: s.nps, comment: s.surveyAnswers?.nps_comment })).filter(c => c.comment)
                    if (!comments.length) return <p style={{ fontSize:'0.85rem', color:'var(--color-text-muted)' }}>Sin comentarios NPS aún</p>
                    return comments.map((c,i) => (
                      <div key={i} style={{ padding:'0.75rem', marginBottom:'0.5rem', background:'var(--color-bg-elevated)', borderRadius:'var(--radius-md)', display:'flex', gap:'0.75rem', alignItems:'flex-start' }}>
                        <span style={{ fontWeight:700, fontSize:'1rem', color: c.score>=7?'var(--color-success)':'var(--color-warning)', flexShrink:0 }}>{c.score ?? '—'}</span>
                        <div style={{ fontSize:'0.85rem', color:'var(--color-text-secondary)', fontStyle:'italic' }}>"{c.comment}"</div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function KPI({ icon, label, value, sub, subColor }) {
  return (
    <div className="card" style={{ padding:'1.25rem' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem' }}>
        <span style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)' }}>{label}</span>
        <span style={{ fontSize:'1.1rem' }}>{icon}</span>
      </div>
      <div style={{ fontSize:'1.8rem', fontWeight:600, marginBottom:'0.25rem' }}>{value}</div>
      {sub && <div style={{ fontSize:'0.75rem', color: subColor || 'var(--color-text-muted)' }}>{sub}</div>}
    </div>
  )
}

function npsCategory(score) {
  if (score >= 9) return 'Promotores 🟢'
  if (score >= 7) return 'Pasivos 🟡'
  return 'Detractores 🔴'
}
