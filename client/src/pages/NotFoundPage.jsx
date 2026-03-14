import React from 'react'
import { Link } from 'react-router-dom'
export default function NotFoundPage() {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'2rem' }}>
      <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🎵</div>
      <h1 style={{ fontSize:'3rem', marginBottom:'0.5rem' }}>404</h1>
      <p style={{ marginBottom:'2rem' }}>Esta página no existe. Quizás la nota se perdió.</p>
      <Link to="/" className="btn btn-primary">Volver al inicio</Link>
    </div>
  )
}
