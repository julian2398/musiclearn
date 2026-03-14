import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

const LandingPage      = lazy(() => import('./pages/LandingPage'))
const LoginPage        = lazy(() => import('./pages/LoginPage'))
const RegisterPage     = lazy(() => import('./pages/RegisterPage'))
const OnboardingPage   = lazy(() => import('./pages/OnboardingPage'))
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'))
const StudentPortal    = lazy(() => import('./pages/StudentPortal'))
const CourseDetail     = lazy(() => import('./pages/CourseDetail'))
const StudentDetail    = lazy(() => import('./pages/StudentDetail'))
const CalendarPage     = lazy(() => import('./pages/CalendarPage'))
const ChatPage         = lazy(() => import('./pages/ChatPage'))
const NotFoundPage        = lazy(() => import('./pages/NotFoundPage'))
const ResearchDashboard   = lazy(() => import('./pages/ResearchDashboard'))

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: 'var(--color-bg)'
    }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  )
}

function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingFallback />
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to={user.role === 'teacher' ? '/dashboard' : '/portal'} replace />
  return children
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

        {/* Onboarding (authenticated but incomplete profile) */}
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

        {/* Teacher */}
        <Route path="/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/student/:id" element={<ProtectedRoute role="teacher"><StudentDetail /></ProtectedRoute>} />
        <Route path="/dashboard/calendar" element={<ProtectedRoute role="teacher"><CalendarPage /></ProtectedRoute>} />
        <Route path="/dashboard/chat" element={<ProtectedRoute role="teacher"><ChatPage /></ProtectedRoute>} />

        {/* Student */}
        <Route path="/portal" element={<ProtectedRoute role="student"><StudentPortal /></ProtectedRoute>} />
        <Route path="/portal/curso/:id" element={<ProtectedRoute role="student"><CourseDetail /></ProtectedRoute>} />
        <Route path="/portal/calendar" element={<ProtectedRoute role="student"><CalendarPage /></ProtectedRoute>} />
        <Route path="/portal/chat" element={<ProtectedRoute role="student"><ChatPage /></ProtectedRoute>} />

        <Route path="/research" element={<ResearchDashboard />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}
