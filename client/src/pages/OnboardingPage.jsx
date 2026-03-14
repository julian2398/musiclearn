import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  initResearchSession, trackStepEnter, trackStepClick,
  trackStepComplete, trackStepComment, trackAbandonment,
  saveSurveyAnswers, saveNPS, completeResearchSession
} from '../services/researchService'

const TOTAL_STEPS = 7
const STEP_NAMES = { 1:'Bienvenida', 2:'Instrumento', 3:'Nivel musical', 4:'Modalidad', 5:'Datos perfil', 6:'Logro', 7:'Primera meta' }
const INSTRUMENTS = [
  { id:'guitar', label:'Guitarra', icon:'🎸', color:'var(--color-guitar)' },
  { id:'bass',   label:'Bajo',     icon:'🎵', color:'var(--color-bass)'   },
  { id:'piano',  label:'Piano',    icon:'🎹', color:'var(--color-piano)'  },
  { id:'vocal',  label:'Vocal',    icon:'🎤', color:'var(--color-vocal)'  },
]
const LEVELS = [
  { id:'beginner',     label:'Principiante', desc:'Nunca he tocado este instrumento', icon:'🌱' },
  { id:'intermediate', label:'Intermedio',   desc:'Conozco los fundamentos básicos',  icon:'🌿' },
  { id:'advanced',     label:'Avanzado',     desc:'Tengo experiencia y quiero mejorar', icon:'🌳' },
]
const MODALITIES = [
  { id:'virtual',    label:'Virtual',    desc:'Google Meet desde tu casa', icon:'💻' },
  { id:'presential', label:'Presencial', desc:'En Bogotá, norte o centro', icon:'📍' },
]
const GOALS = {
  guitar: ['Tocar mis primeros 3 acordes','Aprender una canción completa','Dominar la escala pentatónica'],
  bass:   ['Entender el groove básico','Tocar con backing track','Aprender técnica slap'],
  piano:  ['Leer notas en el pentagrama','Tocar con las dos manos','Aprender mi primera pieza'],
  vocal:  ['Mejorar mi respiración','Cantar afinado en mi registro','Proyectar mi voz con seguridad'],
}

export default function OnboardingPage() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ instrument:'', level:'', modality:'', goal:'', phone:'', bio:'' })
  const [loading, setLoading] = useState(false)
  const [showAbandon, setShowAbandon] = useState(false)
  const [showNPS, setShowNPS] = useState(false)

  useEffect(() => {
    initResearchSession(user?.id)
    trackStepEnter(1, STEP_NAMES[1])
    const handleUnload = () => { if (step < TOTAL_STEPS) trackAbandonment(step, 'page_unload') }
    window.addEventListener('beforeunload', handleUnload)
    return () => window.removeEventListener('beforeunload', handleUnload)
  }, [])

  useEffect(() => { if (step > 1) trackStepEnter(step, STEP_NAMES[step]) }, [step])

  const next = () => { trackStepComplete(step); setStep(s => s + 1) }
  const prev = () => { trackStepClick(step); setStep(s => s - 1) }

  const handleFinish = async () => {
    setLoading(true)
    try {
      await updateProfile({ ...data, onboarding_complete: true })
      trackStepComplete(7, data)
      setShowNPS(true)
    } catch { toast.error('Error al guardar'); setLoading(false) }
  }

  const handleNPS = (score, comment) => {
    saveNPS(score)
    saveSurveyAnswers({ nps_comment: comment })
    completeResearchSession({ instrument: data.instrument, level: data.level })
    toast.success('¡Perfil completado!')
    navigate(user?.role === 'teacher' ? '/dashboard' : '/portal')
  }

  const pct = ((step - 1) / (TOTAL_STEPS - 1)) * 100

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(200,149,108,0.07), transparent)' }}>
      <div style={{ padding:'1.25rem 2rem', display:'flex', alignItems:'center', gap:'1rem', borderBottom:'1px solid var(--color-border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'1.2rem' }}>🎵</span>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700 }}>MusicLearn</span>
        </div>
        <div style={{ flex:1, maxWidth:400 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)' }}>Paso {step} de {TOTAL_STEPS} — {STEP_NAMES[step]}</span>
            <span style={{ fontSize:'0.78rem', color:'var(--color-accent)' }}>{Math.round(pct)}%</span>
          </div>
          <div className="progress-bar"><div className="progress-fill" style={{ width:`${pct}%` }} /></div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowAbandon(true)} style={{ fontSize:'0.78rem', color:'var(--color-text-muted)', marginLeft:'auto' }}>
          Salir
        </button>
      </div>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' }}>
        <div style={{ width:'100%', maxWidth:560, animation:'fadeIn 0.35s ease' }} key={step}>
          {step === 1 && <StepWelcome user={user} onNext={next} />}
          {step === 2 && <StepPicker options={INSTRUMENTS} selected={data.instrument} title="¿Qué instrumento quieres aprender?" subtitle="Puedes cambiarlo después" onSelect={v => setData(p=>({...p,instrument:v}))} onNext={next} onPrev={prev} canNext={!!data.instrument} />}
          {step === 3 && <StepWithTA stepNum={3} title="¿Cuál es tu nivel musical?"><StepCards options={LEVELS} selected={data.level} onSelect={v => setData(p=>({...p,level:v}))} onNext={next} onPrev={prev} canNext={!!data.level} /></StepWithTA>}
          {step === 4 && <StepWithTA stepNum={4} title="¿Cómo prefieres tomar clases?"><StepCards options={MODALITIES} selected={data.modality} onSelect={v => setData(p=>({...p,modality:v}))} onNext={next} onPrev={prev} canNext={!!data.modality} /></StepWithTA>}
          {step === 5 && <StepProfile data={data} onChange={d => setData(p=>({...p,...d}))} onNext={next} onPrev={prev} />}
          {step === 6 && <StepAchievement user={user} instrument={data.instrument} onNext={next} />}
          {step === 7 && <StepGoal goals={GOALS[data.instrument]||[]} selected={data.goal} onSelect={v => setData(p=>({...p,goal:v}))} onFinish={handleFinish} onPrev={prev} loading={loading} />}
        </div>
      </div>

      {showAbandon && <AbandonSurvey step={step} stepName={STEP_NAMES[step]} onConfirm={ans => { saveSurveyAnswers(ans); trackAbandonment(step, ans.q1); navigate('/') }} onCancel={() => setShowAbandon(false)} />}
      {showNPS && <NPSSurvey onSubmit={handleNPS} />}
    </div>
  )
}

function StepWithTA({ stepNum, title, children }) {
  const [ta, setTA] = useState('')
  return (
    <div>
      <h2 style={{ marginBottom:'1.5rem' }}>{title}</h2>
      {children}
      <div style={{ marginTop:'1.25rem', padding:'0.9rem 1rem', background:'var(--color-bg-elevated)', borderRadius:'var(--radius-md)', border:'1px dashed var(--color-border)' }}>
        <div style={{ fontSize:'0.72rem', color:'var(--color-text-muted)', marginBottom:'0.4rem' }}>💭 Thinking Aloud — ¿Qué piensas en este paso? (opcional)</div>
        <textarea className="form-input" rows={2} placeholder="Escribe lo que se te pase por la mente..." value={ta} onChange={e => { setTA(e.target.value); trackStepComment(stepNum, e.target.value) }} style={{ fontSize:'0.83rem', resize:'none' }} />
      </div>
    </div>
  )
}

function AbandonSurvey({ step, stepName, onConfirm, onCancel }) {
  const [q1, setQ1] = useState('')
  const [q2, setQ2] = useState('')
  const [q3, setQ3] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
      <div className="card-elevated" style={{ width:'100%', maxWidth:480, padding:'2rem' }}>
        <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'2rem', marginBottom:'0.5rem' }}>🤔</div>
          <h3 style={{ fontSize:'1.05rem', marginBottom:'0.25rem' }}>Antes de irte…</h3>
          <p style={{ fontSize:'0.83rem', color:'var(--color-text-secondary)' }}>Estás en el paso <strong style={{ color:'var(--color-accent)' }}>{step} — {stepName}</strong>. Tu opinión nos ayuda a mejorar.</p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="form-group">
            <label className="form-label">1. ¿Qué te impidió continuar?</label>
            {['No entendí qué se pedía','El proceso es muy largo','No me sentí seguro/a con esta información','No estoy listo/a para registrarme','Otro motivo'].map(opt => (
              <label key={opt} onClick={() => setQ1(opt)} style={{ display:'flex', alignItems:'center', gap:'0.6rem', cursor:'pointer', fontSize:'0.875rem', padding:'6px 8px', marginBottom:4, borderRadius:'var(--radius-sm)', background: q1===opt ? 'rgba(200,149,108,0.1)' : 'transparent', border:`1px solid ${q1===opt ? 'var(--color-accent)' : 'transparent'}`, transition:'all 0.15s' }}>
                <input type="radio" name="q1" checked={q1===opt} onChange={()=>setQ1(opt)} style={{ accentColor:'var(--color-accent)' }} /> {opt}
              </label>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">2. ¿Qué tan claro fue el proceso? (1 = confuso · 5 = muy claro)</label>
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.25rem' }}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={() => setQ2(String(n))} style={{ width:40, height:40, borderRadius:'var(--radius-sm)', border:`2px solid ${q2===String(n)?'var(--color-accent)':'var(--color-border)'}`, background: q2===String(n)?'rgba(200,149,108,0.15)':'var(--color-bg-elevated)', color: q2===String(n)?'var(--color-accent)':'var(--color-text-secondary)', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>{n}</button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">3. ¿Qué mejorarías de este paso? (opcional)</label>
            <textarea className="form-input" rows={2} placeholder="Tu sugerencia..." value={q3} onChange={e=>setQ3(e.target.value)} style={{ resize:'none' }} />
          </div>
          <div style={{ display:'flex', gap:'0.75rem' }}>
            <button className="btn btn-ghost" style={{ flex:1 }} onClick={onCancel}>← Seguir completando</button>
            <button className="btn btn-primary" style={{ flex:1 }} onClick={() => onConfirm({ q1, q2, q3, abandoned_step:step, abandoned_step_name:stepName })}>Enviar y salir</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NPSSurvey({ onSubmit }) {
  const [score, setScore] = useState(null)
  const [comment, setComment] = useState('')
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.88)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:'1rem' }}>
      <div className="card-elevated" style={{ width:'100%', maxWidth:480, padding:'2rem', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>🎉</div>
        <h3 style={{ fontSize:'1.1rem', marginBottom:'0.25rem' }}>¡Perfil completado!</h3>
        <p style={{ fontSize:'0.875rem', color:'var(--color-text-secondary)', marginBottom:'1.75rem' }}>Una última pregunta antes de entrar a tu portal:</p>
        <p style={{ fontWeight:500, marginBottom:'1rem', fontSize:'0.95rem' }}>¿Qué tan probable es que recomiendes MusicLearn a un amigo?</p>
        <div style={{ display:'flex', gap:'0.3rem', justifyContent:'center', flexWrap:'wrap', marginBottom:'0.5rem' }}>
          {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
            <button key={n} onClick={() => setScore(n)} style={{ width:36, height:36, borderRadius:'var(--radius-sm)', border:`2px solid ${score===n?'var(--color-accent)':'var(--color-border)'}`, background: score===n?'rgba(200,149,108,0.2)':'var(--color-bg-elevated)', color: score===n?'var(--color-accent)':'var(--color-text-secondary)', fontWeight:600, cursor:'pointer', fontSize:'0.78rem', transition:'all 0.15s' }}>{n}</button>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--color-text-muted)', marginBottom:'1.25rem', padding:'0 4px' }}>
          <span>Nada probable</span><span>Muy probable</span>
        </div>
        <div className="form-group" style={{ textAlign:'left', marginBottom:'1.25rem' }}>
          <label className="form-label">¿Qué fue lo más difícil del proceso? (opcional)</label>
          <textarea className="form-input" rows={2} value={comment} onChange={e=>setComment(e.target.value)} style={{ resize:'none' }} />
        </div>
        <button className="btn btn-primary" style={{ width:'100%' }} onClick={() => onSubmit(score, comment)} disabled={score===null}>
          Entrar a mi portal 🚀
        </button>
        <a
          href="https://forms.gle/DwCFcMPEJissX5mm8"
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline"
          style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem', color:'var(--color-accent)', borderColor:'var(--color-accent)', textDecoration:'none', display:'flex' }}
          onClick={() => onSubmit(score ?? 0, comment)}
        >
          📋 Completar encuesta de usabilidad
        </a>
        <button className="btn btn-ghost btn-sm" style={{ marginTop:'0.5rem', width:'100%', fontSize:'0.78rem' }} onClick={() => onSubmit(null, '')}>
          Omitir encuesta
        </button>
      </div>
    </div>
  )
}

function StepWelcome({ user, onNext }) {
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎵</div>
      <h1 style={{ fontSize:'2rem', marginBottom:'0.75rem' }}>¡Hola, {user?.name?.split(' ')[0]}!</h1>
      <p style={{ marginBottom:'2rem', maxWidth:420, margin:'0 auto 2rem' }}>En los próximos minutos personalizamos tu experiencia musical. Solo 7 pasos rápidos.</p>
      <div style={{ display:'flex', justifyContent:'center', gap:'0.75rem', flexWrap:'wrap', marginBottom:'2.5rem' }}>
        {['🎸 Guitarra','🎵 Bajo','🎹 Piano','🎤 Vocal'].map(t=><span key={t} className="badge badge-accent" style={{ fontSize:'0.85rem', padding:'6px 14px' }}>{t}</span>)}
      </div>
      <button className="btn btn-primary btn-lg" onClick={onNext}>Empezar 🚀</button>
    </div>
  )
}

function StepPicker({ title, subtitle, options, selected, onSelect, onNext, onPrev, canNext }) {
  return (
    <div>
      <h2 style={{ marginBottom:'0.4rem' }}>{title}</h2>
      {subtitle && <p style={{ marginBottom:'1.75rem', fontSize:'0.875rem' }}>{subtitle}</p>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'1rem', marginBottom:'2rem' }}>
        {options.map(opt=>(
          <button key={opt.id} onClick={()=>onSelect(opt.id)} style={{ background: selected===opt.id?`${opt.color}18`:'var(--color-bg-card)', border:`2px solid ${selected===opt.id?opt.color:'var(--color-border)'}`, borderRadius:'var(--radius-lg)', padding:'1.5rem 1rem', cursor:'pointer', transition:'all 0.2s', textAlign:'center', color:'var(--color-text-primary)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.5rem' }}>{opt.icon}</div>
            <div style={{ fontWeight:600, fontSize:'1rem', color: selected===opt.id?opt.color:'inherit' }}>{opt.label}</div>
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:'0.75rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Atrás</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={onNext} disabled={!canNext}>Continuar →</button>
      </div>
    </div>
  )
}

function StepCards({ options, selected, onSelect, onNext, onPrev, canNext }) {
  return (
    <div>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'1.5rem' }}>
        {options.map(opt=>(
          <button key={opt.id} onClick={()=>onSelect(opt.id)} style={{ display:'flex', alignItems:'center', gap:'1rem', background: selected===opt.id?'rgba(200,149,108,0.1)':'var(--color-bg-card)', border:`2px solid ${selected===opt.id?'var(--color-accent)':'var(--color-border)'}`, borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', cursor:'pointer', transition:'all 0.2s', color:'var(--color-text-primary)', textAlign:'left', width:'100%' }}>
            <span style={{ fontSize:'1.75rem' }}>{opt.icon}</span>
            <div><div style={{ fontWeight:600, marginBottom:2 }}>{opt.label}</div>{opt.desc&&<div style={{ fontSize:'0.82rem', color:'var(--color-text-secondary)' }}>{opt.desc}</div>}</div>
            {selected===opt.id&&<div style={{ marginLeft:'auto', color:'var(--color-accent)' }}>✓</div>}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:'0.75rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Atrás</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={onNext} disabled={!canNext}>Continuar →</button>
      </div>
    </div>
  )
}

function StepProfile({ data, onChange, onNext, onPrev }) {
  return (
    <div>
      <h2 style={{ marginBottom:'0.5rem' }}>Cuéntanos un poco más</h2>
      <p style={{ marginBottom:'1.75rem', fontSize:'0.875rem' }}>Esta información ayuda a personalizar tu experiencia</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'1rem', marginBottom:'2rem' }}>
        <div className="form-group"><label className="form-label">Teléfono / WhatsApp (opcional)</label><input type="tel" className="form-input" placeholder="+57 300 123 4567" value={data.phone} onChange={e=>onChange({phone:e.target.value})} /></div>
        <div className="form-group"><label className="form-label">¿Por qué quieres aprender música? (opcional)</label><textarea className="form-input" rows={3} placeholder="Ej. Siempre quise tocar una canción para mi familia..." value={data.bio} onChange={e=>onChange({bio:e.target.value})} style={{ resize:'vertical', minHeight:80 }} /></div>
      </div>
      <div style={{ display:'flex', gap:'0.75rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Atrás</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={onNext}>Continuar</button>
      </div>
    </div>
  )
}

function StepAchievement({ user, instrument, onNext }) {
  const icons = { guitar:'🎸', bass:'🎵', piano:'🎹', vocal:'🎤' }
  return (
    <div style={{ textAlign:'center' }}>
      <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🏆</div>
      <div className="badge badge-accent" style={{ marginBottom:'1rem', fontSize:'0.9rem', padding:'8px 18px' }}>¡Logro desbloqueado!</div>
      <h2 style={{ marginBottom:'0.5rem' }}>{icons[instrument]} Músico en formación</h2>
      <p style={{ margin:'0.5rem auto 2rem', maxWidth:400 }}>Perfil completado. El profesor ya tiene todo lo que necesita para preparar tus clases.</p>
      <button className="btn btn-primary btn-lg" onClick={onNext}>Ver mi primera meta 🎯</button>
    </div>
  )
}

function StepGoal({ goals, selected, onSelect, onFinish, onPrev, loading }) {
  return (
    <div>
      <h2 style={{ marginBottom:'0.5rem' }}>Tu primera meta musical</h2>
      <p style={{ marginBottom:'1.75rem', fontSize:'0.875rem' }}>Elige la meta que más te motiva</p>
      <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginBottom:'2rem' }}>
        {goals.map(g=>(
          <button key={g} onClick={()=>onSelect(g)} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background: selected===g?'rgba(200,149,108,0.1)':'var(--color-bg-card)', border:`2px solid ${selected===g?'var(--color-accent)':'var(--color-border)'}`, borderRadius:'var(--radius-md)', padding:'1rem 1.25rem', cursor:'pointer', transition:'all 0.2s', color:'var(--color-text-primary)', textAlign:'left', width:'100%', fontSize:'0.9rem' }}>
            <span>🎯</span>{g}{selected===g&&<span style={{ marginLeft:'auto', color:'var(--color-accent)' }}>✓</span>}
          </button>
        ))}
      </div>
      <div style={{ display:'flex', gap:'0.75rem' }}>
        <button className="btn btn-ghost" onClick={onPrev}>← Atrás</button>
        <button className="btn btn-primary" style={{ flex:1 }} onClick={onFinish} disabled={loading||!selected}>{loading?<span className="spinner"/>:'¡Ir a mi portal 🚀'}</button>
      </div>
    </div>
  )
}