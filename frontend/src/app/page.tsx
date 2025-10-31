'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('users').insert([{ email, password }])
      if (error) throw error
      setMessage('✅ Usuario registrado correctamente.')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      console.error(err)
      setMessage('❌ Error al registrar: ' + err.message)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)',
        color: '#fff',
        fontFamily: 'Poppins, sans-serif',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 🔹 Navbar moderna */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          zIndex: 10,
        }}
      >
        <h1 style={{ fontWeight: 700, fontSize: '1.3rem', color: '#a78bfa' }}>🌎 SolidarityHub</h1>
        <ul style={{ display: 'flex', gap: '1.5rem', listStyle: 'none', fontSize: '.95rem' }}>
          {['Inicio','Colaborar', 'Acerca', 'Campañas', 'Contacto'].map((item) => (
            <li
              key={item}
              style={{
                cursor: 'pointer',
                transition: 'color .3s',
                opacity: 0.85,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#c4b5fd')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#fff')}
            >
              {item}
            </li>
          ))}
        </ul>
      </nav>

      {/* 🔸 Sección principal (Texto + Formulario lado a lado) */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '3rem',
          padding: '4rem 2rem',
        }}
      >
        {/* Texto principal */}
        <div style={{ flex: 1, minWidth: '320px', maxWidth: '550px', animation: 'fadeIn 2s ease' }}>
          <h2
            style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              color: '#c7d2fe',
              textShadow: '0 0 20px rgba(167,139,250,0.5)',
            }}
          >
            Conectando corazones y ayuda 💜
          </h2>
          <p style={{ lineHeight: 1.7, opacity: 0.9, fontSize: '1.1rem' }}>
            Únete a una red de apoyo donde cada aporte cuenta. Esta plataforma te permite participar
            en campañas solidarias y conectar con personas que necesitan una mano amiga.
          </p>

          <button
            style={{
              marginTop: '2rem',
              padding: '0.9rem 1.8rem',
              background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
              border: 'none',
              borderRadius: '12px',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(124,58,237,0.6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)'
            }}
          >
            Explorar más
          </button>
        </div>

        {/* Formulario al lado */}
        <form
          onSubmit={handleSubmit}
          style={{
            flex: 1,
            minWidth: '320px',
            maxWidth: '400px',
            backgroundColor: 'rgba(255,255,255,0.07)',
            padding: '2rem',
            borderRadius: '16px',
            boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)',
            animation: 'fadeIn 2s ease',
          }}
        >
          <h3 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#f3e8ff' }}>
            Registro rápido
          </h3>

          <label style={{ display: 'block', textAlign: 'left', marginBottom: '.5rem' }}>
            Correo
          </label>
          <input
            type="email"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '.8rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: '#fff',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.border = '1px solid #a78bfa')}
            onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)')}
            required
          />

          <label style={{ display: 'block', textAlign: 'left', marginBottom: '.5rem' }}>
            Contraseña
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '.8rem',
              marginBottom: '1.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              backgroundColor: 'rgba(0,0,0,0.3)',
              color: '#fff',
              transition: 'all 0.3s ease',
            }}
            onFocus={(e) => (e.currentTarget.style.border = '1px solid #a78bfa')}
            onBlur={(e) => (e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)')}
            required
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '.8rem',
              background: 'linear-gradient(90deg, #6d28d9, #8b5cf6)',
              border: 'none',
              borderRadius: '10px',
              color: '#fff',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #7c3aed, #9f67ff)'
              e.currentTarget.style.transform = 'scale(1.03)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(90deg, #6d28d9, #8b5cf6)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            Guardar
          </button>

          {message && (
            <p
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                color: message.includes('Error') ? '#ff7070' : '#86efac',
                fontWeight: 'bold',
              }}
            >
              {message}
            </p>
          )}
        </form>
      </section>

      {/* 🔸 Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: 'rgba(0,0,0,0.3)',
          fontSize: '.9rem',
          opacity: 0.8,
        }}
      >
        © {new Date().getFullYear()} SolidarityHub. Todos los derechos reservados.
      </footer>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}


