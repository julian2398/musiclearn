import React, { useState, useEffect, useRef } from 'react'
import Sidebar from '../components/shared/Sidebar'
import { useAuth } from '../context/AuthContext'
import { getSocket } from '../services/socket'
import { trackChatMessage } from '../services/analytics'
import api from '../services/api'

// Mock conversations
const MOCK_CONVERSATIONS = [
  { id:'conv1', name:'Laura Martínez',  avatar:'LM', role:'student', instrument:'guitar', lastMsg:'Gracias profe!', time:'10:23', unread:0 },
  { id:'conv2', name:'Juan Rodríguez',  avatar:'JR', role:'student', instrument:'piano',  lastMsg:'¿A qué hora es la clase?', time:'09:15', unread:2 },
  { id:'conv3', name:'Camila Mejía',    avatar:'CM', role:'student', instrument:'vocal',  lastMsg:'Voy a practicar', time:'Ayer',  unread:0 },
  { id:'conv4', name:'Andrés Suárez',   avatar:'AS', role:'student', instrument:'bass',   lastMsg:'Entendido!', time:'Ayer', unread:1 },
]

const MOCK_MESSAGES = {
  conv1: [
    { id:'m1', sender:'student', text:'Hola profe, practiqué los acordes que me dejó', time:'10:10' },
    { id:'m2', sender:'teacher', text:'¡Excelente Laura! ¿Pudiste tocar la progresión completa?', time:'10:12' },
    { id:'m3', sender:'student', text:'Sí! aunque el cambio de Do a Sol me cuesta un poco', time:'10:15' },
    { id:'m4', sender:'teacher', text:'Normal, ese cambio es el más difícil al principio. Esta semana practiquemos eso específicamente', time:'10:18' },
    { id:'m5', sender:'student', text:'Gracias profe!', time:'10:23' },
  ],
  conv2: [
    { id:'m1', sender:'teacher', text:'Hola Juan, la clase de hoy es a las 5:00 PM por Meet', time:'09:00' },
    { id:'m2', sender:'student', text:'¿A qué hora es la clase?', time:'09:15' },
  ],
  conv3: [
    { id:'m1', sender:'student', text:'Profe, ¿cómo puedo mejorar la respiración?', time:'Ayer' },
    { id:'m2', sender:'teacher', text:'Te envío un ejercicio. Inhala 4 tiempos, sostén 4, exhala 4. Hazlo 10 min diarios', time:'Ayer' },
    { id:'m3', sender:'student', text:'Voy a practicar', time:'Ayer' },
  ],
  conv4: [
    { id:'m1', sender:'teacher', text:'Andrés, recuerda que la próxima clase es presencial, no virtual', time:'Ayer' },
    { id:'m2', sender:'student', text:'Entendido!', time:'Ayer' },
  ],
}

const INSTRUMENT_COLORS = { guitar:'var(--color-guitar)', bass:'var(--color-bass)', piano:'var(--color-piano)', vocal:'var(--color-vocal)' }

export default function ChatPage() {
  const { user } = useAuth()
  const [activeConv, setActiveConv] = useState('conv1')
  const [messages, setMessages]     = useState(MOCK_MESSAGES)
  const [input, setInput]           = useState('')
  const [convs, setConvs]           = useState(MOCK_CONVERSATIONS)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' })
  }, [activeConv, messages])

  useEffect(() => {
    const socket = getSocket()
    socket.on('message', (msg) => {
      setMessages(prev => ({
        ...prev,
        [msg.convId]: [...(prev[msg.convId] || []), msg]
      }))
    })
    return () => socket.off('message')
  }, [])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    const msg = {
      id: Date.now().toString(),
      sender: user?.role || 'teacher',
      text, time: new Date().toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit' })
    }
    setMessages(prev => ({ ...prev, [activeConv]: [...(prev[activeConv] || []), msg] }))
    setConvs(prev => prev.map(c => c.id === activeConv ? { ...c, lastMsg: text, unread:0 } : c))
    setInput('')
    inputRef.current?.focus()
    trackChatMessage(user?.role)
    // In production: socket.emit('message', { convId: activeConv, ...msg })
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const activeConvData = convs.find(c => c.id === activeConv)
  const currentMessages = messages[activeConv] || []

  return (
    <div className="app-layout">
      <Sidebar />
      <main style={{ flex:1, display:'flex', overflow:'hidden', background:'var(--color-bg)' }}>

        {/* Conversation list */}
        <div style={{
          width:280, flexShrink:0, borderRight:'1px solid var(--color-border)',
          display:'flex', flexDirection:'column', background:'var(--color-bg-card)'
        }}>
          <div style={{ padding:'1.25rem 1rem 0.75rem', borderBottom:'1px solid var(--color-border)' }}>
            <h3 style={{ fontSize:'0.9rem' }}>Mensajes</h3>
          </div>
          <div style={{ flex:1, overflowY:'auto' }}>
            {convs.map(conv => (
              <button
                key={conv.id}
                onClick={() => {
                  setActiveConv(conv.id)
                  setConvs(prev => prev.map(c => c.id === conv.id ? { ...c, unread:0 } : c))
                }}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'0.75rem',
                  padding:'0.85rem 1rem', border:'none', cursor:'pointer', textAlign:'left',
                  background: activeConv === conv.id ? 'var(--color-bg-elevated)' : 'transparent',
                  borderLeft: activeConv === conv.id ? '3px solid var(--color-accent)' : '3px solid transparent',
                  transition:'background 0.15s', color:'var(--color-text-primary)'
                }}
              >
                <div className="avatar avatar-sm" style={{ background:'var(--color-bg-elevated)', color: INSTRUMENT_COLORS[conv.instrument], fontWeight:600, flexShrink:0 }}>
                  {conv.avatar}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'0.85rem', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {conv.name}
                    </span>
                    <span style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', flexShrink:0, marginLeft:6 }}>{conv.time}</span>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'0.77rem', color:'var(--color-text-secondary)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>
                      {conv.lastMsg}
                    </span>
                    {conv.unread > 0 && (
                      <span style={{ background:'var(--color-accent)', color:'#fff', borderRadius:10, fontSize:'0.65rem', padding:'1px 5px', fontWeight:700, flexShrink:0 }}>
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message area */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>

          {/* Chat header */}
          <div style={{ padding:'1rem 1.25rem', borderBottom:'1px solid var(--color-border)', display:'flex', alignItems:'center', gap:'0.75rem', background:'var(--color-bg-card)' }}>
            <div className="avatar avatar-sm" style={{ background:'var(--color-bg-elevated)', color: INSTRUMENT_COLORS[activeConvData?.instrument], fontWeight:600 }}>
              {activeConvData?.avatar}
            </div>
            <div>
              <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{activeConvData?.name}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--color-success)' }}>● En línea</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'1.25rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {currentMessages.map(msg => {
              const isMe = msg.sender === user?.role
              return (
                <div key={msg.id} style={{ display:'flex', flexDirection: isMe ? 'row-reverse' : 'row', gap:'0.5rem', alignItems:'flex-end' }}>
                  {!isMe && (
                    <div className="avatar avatar-sm" style={{ background:'var(--color-bg-elevated)', color: INSTRUMENT_COLORS[activeConvData?.instrument], fontWeight:600, flexShrink:0 }}>
                      {activeConvData?.avatar}
                    </div>
                  )}
                  <div style={{
                    maxWidth:'70%', padding:'0.6rem 0.9rem',
                    borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isMe ? 'var(--color-accent)' : 'var(--color-bg-elevated)',
                    color: isMe ? '#fff' : 'var(--color-text-primary)',
                    fontSize:'0.875rem', lineHeight:1.5
                  }}>
                    {msg.text}
                    <div style={{ fontSize:'0.68rem', opacity:0.65, textAlign:'right', marginTop:'2px' }}>{msg.time}</div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding:'1rem 1.25rem', borderTop:'1px solid var(--color-border)', display:'flex', gap:'0.75rem', background:'var(--color-bg-card)' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe un mensaje... (Enter para enviar)"
              rows={1}
              className="form-input"
              style={{ flex:1, resize:'none', minHeight:40, maxHeight:120 }}
            />
            <button className="btn btn-primary" onClick={handleSend} disabled={!input.trim()} style={{ flexShrink:0 }}>
              Enviar
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
