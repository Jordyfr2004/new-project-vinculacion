'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  // Estados de registro
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [Ci, setCi] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Registro receptor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Registrando usuario...');
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{ email, password, rol: 'receptor' }])
        .select('id')
        .single();

      if (userError) throw userError;

      const { error: receptorError } = await supabase.from('receptores').insert([
        {
          receptor_id: userData.id,
          nombres,
          apellidos,
          telefono,
          Ci,
        },
      ]);

      if (receptorError) throw receptorError;

      setMessage('✅ Usuario registrado correctamente.');
      setNombres('');
      setApellidos('');
      setTelefono('');
      setCi('');
      setEmail('');
      setPassword('');
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      setMessage('❌ Error al registrar: ' + err.message);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top left, #0f172a, #020617 60%)',
        color: '#f8fafc',
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
          padding: '1rem 3rem',
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <h1
          style={{
            fontWeight: 700,
            fontSize: '1.5rem',
            color: '#22c55e',
            letterSpacing: '.5px',
          }}
        >
          SolidarityHub<span style={{ color: '#9ca3af' }}>.</span>
        </h1>

        <ul
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2rem',
            listStyle: 'none',
            fontSize: '.95rem',
          }}
        >
          {['Inicio', 'Proyectos', 'Campañas', 'Historias', 'Acerca', 'Contacto'].map((item) => (
            <li
              key={item}
              style={{
                cursor: 'pointer',
                opacity: 0.9,
                transition: 'color .3s, transform .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#22c55e';
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
            >
              {item}
            </li>
          ))}
          <button
            style={{
              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              border: 'none',
              padding: '.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#fff',
              transition: 'all .3s',
            }}
            onClick={() => router.push('/donantes')}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Donar 💚
          </button>
        </ul>
      </nav>

      {/* 🧭 Hero principal */}
      <section
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          padding: '6rem 2rem',
          gap: '4rem',
        }}
      >
        {/* Texto Hero */}
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '600px' }}>
          <h2
            style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            Conectando corazones en el mundo 🌍
          </h2>
          <p
            style={{
              lineHeight: 1.7,
              opacity: 0.9,
              fontSize: '1.1rem',
              color: '#d1d5db',
              marginBottom: '2rem',
            }}
          >
            Únete a una red global de solidaridad. Apoya campañas, comparte historias de impacto y ayuda a quienes más lo necesitan. Cada acción cuenta.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              style={{
                background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                border: 'none',
                padding: '0.9rem 1.8rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#fff',
                cursor: 'pointer',
                transition: 'all .3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              Explorar campañas
            </button>

            <button
              style={{
                border: '1px solid #22c55e',
                background: 'transparent',
                padding: '0.9rem 1.8rem',
                borderRadius: '10px',
                color: '#22c55e',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .3s',
              }}
              onClick={() => setShowModal(true)}
            >
              Unirme a la comunidad
            </button>
          </div>
        </div>

        {/* Formulario login moderno */}
        <form
          style={{
            flex: 1,
            minWidth: '320px',
            maxWidth: '400px',
            backgroundColor: 'rgba(17,24,39,0.85)',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '2rem',
            borderRadius: '20px',
            boxShadow: '0 0 20px rgba(34,197,94,0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h3
            style={{
              textAlign: 'center',
              marginBottom: '1.5rem',
              color: '#22c55e',
              fontWeight: 'bold',
            }}
          >
            Iniciar sesión
          </h3>

          <label style={{ display: 'block', textAlign: 'left', marginBottom: '.5rem' }}>Correo</label>
          <input type="email" placeholder="ejemplo@correo.com" style={inputStyleDark} required />

          <label style={{ display: 'block', textAlign: 'left', marginBottom: '.5rem' }}>Contraseña</label>
          <input type="password" placeholder="••••••••" style={inputStyleDark} required />

          <p
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              color: '#86efac',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
            onClick={() => setShowModal(true)}
          >
            ¿No tienes cuenta? Regístrate
          </p>

          <button type="submit" style={buttonStyleNeon}>
            Iniciar sesión
          </button>
        </form>
      </section>

      {/* 🌍 Sección “Impacto Global” */}
      <section
        style={{
          backgroundColor: '#0f172a',
          padding: '4rem 2rem',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: '#22c55e' }}>Nuestro impacto</h2>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '2rem',
          }}
        >
          {[
            { label: '15,000+', desc: 'Usuarios activos' },
            { label: '3,200+', desc: 'Donaciones realizadas' },
            { label: '280+', desc: 'Proyectos en curso' },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '2rem',
                minWidth: '180px',
                color: '#f8fafc',
                boxShadow: '0 0 15px rgba(34,197,94,0.1)',
              }}
            >
              <h3 style={{ color: '#22c55e', fontSize: '1.5rem' }}>{stat.label}</h3>
              <p style={{ opacity: 0.8 }}>{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🌱 Modal Registro */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: 'center', marginBottom: '1rem', color: '#22c55e' }}>
              Registro de Receptores
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={rowStyle}>
                <input
                  type="text"
                  placeholder="Nombres"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  style={{ ...inputStyleDark, flex: 1 }}
                  required
                />
                <input
                  type="text"
                  placeholder="Apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  style={{ ...inputStyleDark, flex: 1 }}
                  required
                />
              </div>

              <div style={rowStyle}>
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={{ ...inputStyleDark, flex: 1 }}
                  required
                />
                <input
                  type="text"
                  placeholder="Cédula"
                  value={Ci}
                  onChange={(e) => setCi(e.target.value)}
                  style={{ ...inputStyleDark, flex: 1 }}
                  required
                />
              </div>

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyleDark}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyleDark}
                required
              />

              <button type="submit" style={buttonStyleNeon}>
                Registrar
              </button>

              {message && (
                <p style={{ textAlign: 'center', color: '#86efac', fontWeight: 'bold' }}>{message}</p>
              )}

              <p
                onClick={() => setShowModal(false)}
                style={{
                  textAlign: 'center',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                Cerrar
              </p>
            </form>
          </div>
        </div>
      )}

      {/* 🌌 Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#020617',
          color: '#9ca3af',
          fontSize: '.9rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        © {new Date().getFullYear()} SolidarityHub — Inspirando ayuda, creando esperanza 🌱
      </footer>
    </div>
  );
}

/* 🎨 Estilos reutilizables */
const inputStyleDark: React.CSSProperties = {
  width: '100%',
  padding: '.8rem',
  borderRadius: '8px',
  border: '1px solid rgba(255,255,255,0.1)',
  backgroundColor: 'rgba(255,255,255,0.05)',
  color: '#fff',
  transition: 'all 0.3s ease',
  boxSizing: 'border-box',
};

const buttonStyleNeon: React.CSSProperties = {
  width: '100%',
  padding: '.8rem',
  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
  border: 'none',
  borderRadius: '10px',
  color: '#fff',
  fontWeight: 'bold',
  cursor: 'pointer',
  marginTop: '1rem',
  transition: 'all 0.3s ease',
  boxShadow: '0 0 15px rgba(34,197,94,0.2)',
};

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 100,
  backdropFilter: 'blur(6px)',
};

const modalStyle: React.CSSProperties = {
  backgroundColor: 'rgba(15,23,42,0.9)',
  padding: '2rem',
  borderRadius: '16px',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 0 30px rgba(34,197,94,0.2)',
  width: '90%',
  maxWidth: '480px',
  color: '#fff',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: '1rem',
  width: '100%',
};


