'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Home, Users, Heart, Settings, MessageCircle, Bell } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { useProtectedRoute } from '@/hooks/useProtectedRoutes';
import { useUserRole } from '@/hooks/useUserRoles';

export default function FeedPage() {
  const router = useRouter();
  const loading = useProtectedRoute();
  const { role } = useUserRole();

  // 🔹 Función para cerrar sesión completamente
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut(); // cierra sesión y elimina token
      localStorage.removeItem('supabase.auth.token'); // limpia token local (opcional)
      router.push('/'); // redirige al inicio
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: '#020617',
          color: '#22c55e',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        Verificando sesión...
      </div>
    );
  }

  return (
    <div
      style={{
        height: '100vh',
        overflow: 'hidden',
        background: 'radial-gradient(circle at top left, #0f172a, #020617 60%)',
        color: '#f8fafc',
        fontFamily: 'Poppins, sans-serif',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 🔹 Navbar superior */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem 3rem',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)',
          flexShrink: 0,
        }}
      >
        <h1 style={{ fontWeight: 700, fontSize: '1.5rem', color: '#22c55e' }}>
          SolidarityHub<span style={{ color: '#9ca3af' }}> Feed</span>
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Bell size={20} style={{ cursor: 'pointer', opacity: 0.9 }} />
          <MessageCircle size={20} style={{ cursor: 'pointer', opacity: 0.9 }} />
          <button
            style={{
              background: 'linear-gradient(90deg, #ef4444, #dc2626)',
              border: 'none',
              padding: '.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              color: '#fff',
              transition: 'all 0.3s ease',
            }}
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* 🔸 Contenido principal */}
      <main
        style={{
          display: 'flex',
          flex: 1,
          padding: '2rem',
          gap: '2rem',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar izquierda */}
        <aside
          style={{
            width: '250px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            height: 'fit-content',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}
        >
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <SidebarItem icon={<Home size={20} />} text="Inicio" active />
            {role === 'admin' && (
              <>
                <SidebarItem icon={<Heart size={20} />} text="Campañas" />
                <SidebarItem icon={<Users size={20} />} text="Receptores" />
                <SidebarItem icon={<Users size={20} />} text="Donantes" />
              </>
            )}
            <SidebarItem icon={<Settings size={20} />} text="Configuración" />
          </ul>
        </aside>

        {/* Feed principal — desplazable */}
        <section
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            overflowY: 'auto',
            maxHeight: '100%',
            paddingRight: '8px',
            scrollbarWidth: 'thin',
            scrollbarColor: '#22c55e transparent',
          }}
        >
          <PostCard
            name="Fundación Esperanza"
            time="Hace 2 horas"
            content="Gracias a todos por ayudar en nuestra campaña de alimentos. ❤️ Cada aporte cuenta."
            image="https://source.unsplash.com/featured/?charity,people"
          />
          <PostCard
            name="María López"
            time="Hace 4 horas"
            content="Acabo de donar útiles escolares para los niños de Manta. ¡Sumémonos todos!"
          />
          <PostCard
            name="Proyecto Vida Verde"
            time="Ayer"
            content="🌱 Nueva jornada de reforestación en Montecristi. ¡Gracias a los 45 voluntarios que participaron!"
            image="https://source.unsplash.com/featured/?trees,volunteers"
          />
        </section>

        {/* Sidebar derecha */}
        <aside
          style={{
            width: '280px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
            height: 'fit-content',
            flexShrink: 0,
            alignSelf: 'flex-start',
          }}
        >
          <h3 style={{ color: '#22c55e', marginBottom: '1rem' }}>Usuarios activos 🌿</h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '.8rem',
            }}
          >
            {['María López', 'Carlos Vega', 'Ana Ruiz', 'Proyecto Vida Verde'].map((user) => (
              <li key={user} style={{ opacity: 0.85 }}>
                🟢 {user}
              </li>
            ))}
          </ul>

          <hr style={{ margin: '1.5rem 0', borderColor: 'rgba(255,255,255,0.1)' }} />

          <h3 style={{ color: '#22c55e', marginBottom: '1rem' }}>Tendencias solidarias 💡</h3>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '.8rem',
            }}
          >
            <li>#ManosQueAyudan</li>
            <li>#Reforestación2025</li>
            <li>#DonacionesULEAM</li>
          </ul>
        </aside>
      </main>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1rem',
          backgroundColor: '#020617',
          color: '#9ca3af',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          flexShrink: 0,
        }}
      >
        © {new Date().getFullYear()} SolidarityHub — Conectando corazones 🌱
      </footer>

      {/* 🔹 Scrollbar personalizada */}
      <style jsx>{`
        section::-webkit-scrollbar {
          width: 8px;
        }
        section::-webkit-scrollbar-thumb {
          background-color: rgba(34, 197, 94, 0.6);
          border-radius: 10px;
        }
        section::-webkit-scrollbar-thumb:hover {
          background-color: rgba(34, 197, 94, 0.8);
        }
        section::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

/* 🧩 Componente: Item de Sidebar */
function SidebarItem({
  icon,
  text,
  active = false,
}: {
  icon: React.ReactNode;
  text: string;
  active?: boolean;
}) {
  return (
    <li
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        cursor: 'pointer',
        color: active ? '#22c55e' : '#f8fafc',
        fontWeight: active ? 600 : 400,
        opacity: active ? 1 : 0.85,
      }}
    >
      {icon}
      {text}
    </li>
  );
}

/* 🧩 Componente: PostCard */
function PostCard({
  name,
  time,
  content,
  image,
}: {
  name: string;
  time: string;
  content: string;
  image?: string;
}) {
  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '.8rem',
        }}
      >
        <div
          style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            background: 'linear-gradient(90deg, #22c55e, #16a34a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          {name.charAt(0)}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 600 }}>{name}</p>
          <p style={{ margin: 0, fontSize: '.85rem', opacity: 0.6 }}>{time}</p>
        </div>
      </div>

      <p style={{ opacity: 0.9, marginBottom: '1rem' }}>{content}</p>

      {image && (
        <img
          src={image}
          alt="post"
          style={{
            width: '100%',
            borderRadius: '12px',
            maxHeight: '400px',
            objectFit: 'cover',
            marginBottom: '.8rem',
          }}
        />
      )}

      <div style={{ display: 'flex', gap: '2rem', opacity: 0.85 }}>
        <span>👍 Me gusta</span>
        <span>💬 Comentar</span>
        <span>↗️ Compartir</span>
      </div>
    </div>
  );
}

