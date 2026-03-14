import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { NotifProvider } from './context/NotifContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotifProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#1a1a24',
                color: '#f0eee8',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '0.875rem',
              },
            }}
          />
        </NotifProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
