/**
 * MusicLearn — Servicio de Investigación de Usabilidad
 * Basado en metodología del Caso Fintech:
 * - Test de usabilidad (tiempo por paso, abandono)
 * - Thinking Aloud (comentarios abiertos por paso)
 * - Encuesta interceptada (al abandonar o al terminar)
 * - NPS final
 *
 * Datos guardados en localStorage para demo sin backend
 * En producción: enviar a /api/research/session
 */

const STORAGE_KEY = 'ml_research_sessions'
const SESSION_KEY = 'ml_current_session'

// ─── Inicializar sesión de investigación ───
export function initResearchSession(userId = null) {
  const session = {
    id: `session_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    startedAt: Date.now(),
    userAgent: navigator.userAgent,
    screenW: window.innerWidth,
    deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop',
    steps: [],
    abandonedAt: null,
    completedAt: null,
    nps: null,
    surveyAnswers: {},
    totalTimeMs: null,
  }
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

function getSession() {
  const raw = sessionStorage.getItem(SESSION_KEY)
  return raw ? JSON.parse(raw) : null
}

function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

// ─── Registrar entrada a un paso ───
export function trackStepEnter(stepNumber, stepName) {
  const session = getSession()
  if (!session) return
  // Cerrar paso anterior
  const prev = session.steps.find(s => s.step === stepNumber - 1 && !s.exitedAt)
  if (prev) {
    prev.exitedAt = Date.now()
    prev.timeMs = prev.exitedAt - prev.enteredAt
  }
  session.steps.push({
    step: stepNumber,
    name: stepName,
    enteredAt: Date.now(),
    exitedAt: null,
    timeMs: null,
    completed: false,
    clicks: 0,
    comment: null,
  })
  saveSession(session)
}

// ─── Registrar clic en un paso ───
export function trackStepClick(stepNumber) {
  const session = getSession()
  if (!session) return
  const step = session.steps.find(s => s.step === stepNumber)
  if (step) step.clicks++
  saveSession(session)
}

// ─── Registrar completar un paso ───
export function trackStepComplete(stepNumber, data = {}) {
  const session = getSession()
  if (!session) return
  const step = session.steps.find(s => s.step === stepNumber)
  if (step) {
    step.exitedAt = Date.now()
    step.timeMs = step.exitedAt - step.enteredAt
    step.completed = true
    step.data = data
  }
  saveSession(session)
}

// ─── Registrar comentario Thinking Aloud por paso ───
export function trackStepComment(stepNumber, comment) {
  const session = getSession()
  if (!session) return
  const step = session.steps.find(s => s.step === stepNumber)
  if (step) step.comment = comment
  saveSession(session)
}

// ─── Registrar abandono ───
export function trackAbandonment(stepNumber, reason = null) {
  const session = getSession()
  if (!session) return
  // Cerrar paso actual
  const step = session.steps.find(s => s.step === stepNumber)
  if (step && !step.exitedAt) {
    step.exitedAt = Date.now()
    step.timeMs = step.exitedAt - step.enteredAt
    step.completed = false
    step.abandonReason = reason
  }
  session.abandonedAt = Date.now()
  session.totalTimeMs = session.abandonedAt - session.startedAt
  saveSession(session)
  persistSession(session)
}

// ─── Guardar respuestas encuesta interceptada ───
export function saveSurveyAnswers(answers) {
  const session = getSession()
  if (!session) return
  session.surveyAnswers = { ...session.surveyAnswers, ...answers }
  saveSession(session)
}

// ─── Guardar NPS ───
export function saveNPS(score) {
  const session = getSession()
  if (!session) return
  session.nps = score
  saveSession(session)
}

// ─── Completar sesión ───
export function completeResearchSession(finalData = {}) {
  const session = getSession()
  if (!session) return
  // Cerrar último paso
  const lastStep = session.steps.findLast?.(s => !s.exitedAt) || session.steps[session.steps.length - 1]
  if (lastStep && !lastStep.exitedAt) {
    lastStep.exitedAt = Date.now()
    lastStep.timeMs = lastStep.exitedAt - lastStep.enteredAt
    lastStep.completed = true
  }
  session.completedAt = Date.now()
  session.totalTimeMs = session.completedAt - session.startedAt
  session.finalData = finalData
  saveSession(session)
  persistSession(session)
  return session
}

// ─── Persistir sesión en localStorage (historial) ───
function persistSession(session) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const all = raw ? JSON.parse(raw) : []
    // Evitar duplicados
    const idx = all.findIndex(s => s.id === session.id)
    if (idx >= 0) all[idx] = session
    else all.push(session)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch (e) {
    console.warn('Research storage error:', e)
  }
}

// ─── Leer todas las sesiones ───
export function getAllSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// ─── Limpiar todas las sesiones ───
export function clearAllSessions() {
  localStorage.removeItem(STORAGE_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

// ─── Exportar sesiones como JSON ───
export function exportSessionsJSON() {
  const sessions = getAllSessions()
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `musiclearn_research_${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Calcular métricas agregadas ───
export function calcMetrics(sessions) {
  if (!sessions.length) return null

  const completed  = sessions.filter(s => s.completedAt)
  const abandoned  = sessions.filter(s => s.abandonedAt && !s.completedAt)
  const convRate   = Math.round((completed.length / sessions.length) * 100)

  // Tiempo promedio total (solo completados)
  const avgTime = completed.length
    ? Math.round(completed.reduce((acc, s) => acc + (s.totalTimeMs || 0), 0) / completed.length / 1000)
    : null

  // Abandono por paso
  const stepAbandons = {}
  abandoned.forEach(s => {
    const lastStep = s.steps.filter(st => !st.completed).sort((a,b) => b.step - a.step)[0]
    if (lastStep) {
      stepAbandons[lastStep.step] = (stepAbandons[lastStep.step] || 0) + 1
    }
  })

  // Tiempo promedio por paso
  const stepTimes = {}
  sessions.forEach(s => {
    s.steps.forEach(st => {
      if (st.timeMs) {
        if (!stepTimes[st.step]) stepTimes[st.step] = []
        stepTimes[st.step].push(st.timeMs)
      }
    })
  })
  const avgStepTime = {}
  Object.entries(stepTimes).forEach(([step, times]) => {
    avgStepTime[step] = Math.round(times.reduce((a,b)=>a+b,0) / times.length / 1000)
  })

  // NPS
  const npsScores = sessions.filter(s => s.nps !== null).map(s => s.nps)
  const avgNPS = npsScores.length
    ? Math.round(npsScores.reduce((a,b)=>a+b,0) / npsScores.length * 10) / 10
    : null

  // Dispositivos
  const devices = sessions.reduce((acc, s) => {
    acc[s.deviceType || 'desktop'] = (acc[s.deviceType || 'desktop'] || 0) + 1
    return acc
  }, {})

  // Respuestas encuesta
  const surveyQ1 = sessions.map(s => s.surveyAnswers?.q1).filter(Boolean)
  const surveyQ2 = sessions.map(s => s.surveyAnswers?.q2).filter(Boolean)

  return { total: sessions.length, completed: completed.length, abandoned: abandoned.length, convRate, avgTime, stepAbandons, avgStepTime, avgNPS, devices, surveyQ1, surveyQ2 }
}
