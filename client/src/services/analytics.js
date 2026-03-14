/**
 * MusicLearn Analytics Service
 * Wraps GA4 gtag for custom event tracking
 * Includes onboarding funnel, course interaction, and user behavior
 */

const GA_ID = 'G-XXXXXXXXXX' // Replace with real GA4 Measurement ID

// Safely call gtag
function gtag(...args) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args)
  }
}

// ---- Onboarding Funnel ----

export function trackOnboardingStart() {
  gtag('event', 'onboarding_start', {
    event_category: 'onboarding',
    step: 1,
    timestamp: Date.now()
  })
  sessionStorage.setItem('ml_onboarding_start', Date.now())
}

export function trackInstrumentSelected(instrument) {
  gtag('event', 'instrument_selected', {
    event_category: 'onboarding',
    instrument,
    step: 2
  })
}

export function trackLevelSelected(level, instrument) {
  gtag('event', 'level_selected', {
    event_category: 'onboarding',
    level,
    instrument,
    step: 3
  })
}

export function trackModalitySelected(modality) {
  gtag('event', 'modality_selected', {
    event_category: 'onboarding',
    modality,
    step: 4
  })
}

export function trackProfileCompleted() {
  const start = sessionStorage.getItem('ml_onboarding_start')
  const time_ms = start ? Date.now() - parseInt(start) : null
  gtag('event', 'profile_completed', {
    event_category: 'onboarding',
    step: 5,
    time_ms
  })
}

export function trackOnboardingComplete(data) {
  const start = sessionStorage.getItem('ml_onboarding_start')
  const total_time_ms = start ? Date.now() - parseInt(start) : null
  gtag('event', 'onboarding_complete', {
    event_category: 'onboarding',
    ...data,
    total_time_ms
  })
  sessionStorage.removeItem('ml_onboarding_start')
}

export function trackStepAbandoned(step, time_on_step_ms) {
  gtag('event', 'step_abandoned', {
    event_category: 'onboarding',
    step,
    time_on_step_ms
  })
}

// ---- Course Interaction ----

export function trackCourseStarted(courseId, instrument, level) {
  gtag('event', 'course_started', {
    event_category: 'learning',
    course_id: courseId,
    instrument,
    level
  })
}

export function trackTopicCompleted(topicId, courseId) {
  gtag('event', 'topic_completed', {
    event_category: 'learning',
    topic_id: topicId,
    course_id: courseId
  })
}

export function trackClassBooked(modality, instrument) {
  gtag('event', 'class_booked', {
    event_category: 'conversion',
    modality,
    instrument
  })
}

export function trackReportDownloaded(studentId, type) {
  gtag('event', 'report_downloaded', {
    event_category: 'teacher',
    student_id: studentId,
    type
  })
}

export function trackChatMessage(role) {
  gtag('event', 'chat_message_sent', {
    event_category: 'engagement',
    role
  })
}

export function trackSessionJoined(modality) {
  gtag('event', 'session_joined', {
    event_category: 'engagement',
    modality
  })
}

// ---- Generic event ----

export function trackEvent(name, params = {}) {
  gtag('event', name, params)
}
