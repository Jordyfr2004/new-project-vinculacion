'use client';
import { supabase } from "@/lib/supabase/client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function DonantesPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  //  Estados del formulario
  const [tipo_donante, setTipo_donante] = useState("");
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loginPassword, setLoginPassword] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  // 🧩 Función de registro (mantiene Supabase igual)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Registrando donante...");
    try {

      const { data: authUser, error: authError} = await supabase.auth.signUp({
        email,
        password,
      });
      if (authError) throw authError;

      if (!authUser?.user)
        throw new Error("No se pudo crear el usuario de autenticación.");

      const { data: userData, error: userError } = await supabase
        .from("users")
        .insert([{
          id: authUser.user.id,
          email, rol: "donante" }])
        .select("id")
        .single();

      if (userError) throw userError;

      const { error: donanteError } = await supabase.from("donantes").insert([
        {
          donante_id: userData.id,
          tipo_donante,
          nombres,
          apellidos,
          telefono,
        },
      ]);
      if (donanteError) throw donanteError;

      setMensaje(" Donante registrado correctamente.");
      setTipo_donante("");
      setNombres("");
      setApellidos("");
      setTelefono("");
      setEmail("");
      setPassword("");
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      setMensaje("Error al guardar: " + err.message);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje("Iniciando sesión...");
    try {
      const { data: sessionData, error: loginError} = await supabase.auth.signInWithPassword({
        email,
        password: loginPassword,
      });

      if (loginError){
        if (
          loginError.message.includes("Invalid email or password") ||
          loginError.status === 400
        ){
          setMensaje("Credenciales incorrectas. Verifica tu correo o contraseña.");
          setMessageType("error");
          return; // detenemos el flujo, no seguimos
        }
        throw loginError;
      }

      const user = sessionData.user;
      if (!user) throw new Error("No se pudo obtener el usuario autenticado.");

      const { data: userData, error: rolError} = await supabase
        .from("users")
        .select("rol")
        .eq("id", user.id)
        .single();

      if (rolError) throw rolError;

      if (userData.rol !=="donante") router.push("/admin")
        else if (userData.rol ==="donante") router.push("/public");
        else router.push("/")
    } catch (err: any) {
      console.error(err);
      setMensaje("Error al iniciar sesión: " + err.message);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top left, #0f172a, #020617 60%)",
        color: "#f8fafc",
        fontFamily: "Poppins, sans-serif",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "4rem 2rem",
      }}
    >
      {/* Contenedor principal */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          maxWidth: "1000px",
          width: "100%",
          borderRadius: "20px",
          backgroundColor: "rgba(17, 24, 39, 0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 0 25px rgba(34,197,94,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Texto lateral */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            padding: "3rem 2rem",
            background:
              "linear-gradient(135deg, rgba(22,163,74,0.4), rgba(15,23,42,0.9))",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2.2rem",
              fontWeight: "bold",
              color: "#22c55e",
              marginBottom: "1rem",
            }}
          >
            Sé parte del cambio 💚
          </h2>
          <p
            style={{
              lineHeight: 1.7,
              fontSize: "1.05rem",
              color: "#d1d5db",
              marginBottom: "1rem",
            }}
          >
            Conviértete en donante y apoya causas reales que transforman vidas.
            Tu aporte puede brindar esperanza, educación y alimento a quienes
            más lo necesitan.
          </p>
          <ul style={{ marginLeft: "1.2rem", opacity: 0.9 }}>
            <li>🤝 Ayuda a familias en situación vulnerable</li>
            <li>📦 Dona recursos o tiempo de manera segura</li>
            <li>🌍 Forma parte de una comunidad activa</li>
          </ul>
        </div>

        {/* Formulario de login */}
        <div
          style={{
            flex: 1,
            minWidth: "320px",
            padding: "3rem 1.5rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#22c55e",
              marginBottom: "1.2rem",
              fontWeight: "bold",
              //fontSize: "1.4rem",
            }}
          >
            Iniciar sesión como Donante
          </h2>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: ".6rem" }}>
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '.5rem' }}>Correo</label>
            <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
            />
            <label style={{ display: 'block', textAlign: 'left', marginBottom: '.5rem' }}>Contraseña</label>
            <input
            type="password"
            placeholder="Contraseña"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            style={inputStyle}
            required
            />
            <p
              style={{
                textAlign: "center",
                fontSize: ".95rem",
                color: "#9ca3af",
                marginTop: "1.2rem",
              }}
            >
              ¿No tienes cuenta?{" "}
              <span
                style={{
                  color: "#22c55e",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setShowModal(true)}
              >
                Regístrate aquí
              </span>
            </p>

            <button type="submit" style={buttonStyle}>
              Iniciar sesión
            </button>
            {mensaje && (
              <p style={{
                textAlign: 'center',
                color: messageType === 'error' ? '#ef4444' : '#86efac',
                fontWeight: 'bold',
                marginTop: '1rem',
              }}
              >{mensaje}</p>
            )}

          </form>

          
        </div>
      </div>

      {/* Sección adicional informativa */}
      <section
        style={{
          marginTop: "4rem",
          textAlign: "center",
          maxWidth: "900px",
        }}
      >
        <h2
          style={{
            fontSize: "2rem",
            marginBottom: "1rem",
            color: "#22c55e",
          }}
        >
          ¿Por qué donar con nosotros?
        </h2>
        <p style={{ color: "#cbd5e1", lineHeight: 1.6 }}>
          SolidarityHub garantiza transparencia en cada acción. Tu contribución
          llega directamente a proyectos verificados, y podrás seguir su impacto
          en tiempo real. 💫
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "2rem",
            gap: "2rem",
          }}
        >
          {[
            { icon: "🕊️", title: "Transparencia", text: "Cada donación se registra y se muestra en la plataforma." },
            { icon: "🌱", title: "Impacto real", text: "Tus aportes apoyan proyectos sostenibles y medibles." },
            { icon: "🤗", title: "Comunidad", text: "Formarás parte de una red solidaria global." },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "14px",
                padding: "1.5rem",
                width: "260px",
                boxShadow: "0 0 10px rgba(34,197,94,0.1)",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: ".5rem" }}>{item.icon}</div>
              <h3 style={{ color: "#22c55e", marginBottom: ".5rem" }}>{item.title}</h3>
              <p style={{ color: "#d1d5db", fontSize: ".95rem" }}>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de registro */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#22c55e" }}>
              Registro de Donantes
            </h2>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Fila 1 */}
              <div style={rowStyle}>
                <input
                  type="text"
                  placeholder="Nombres"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  required
                />
                <input
                  type="text"
                  placeholder="Apellidos"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  required
                />
              </div>

              {/* Fila 2 */}
              <div style={rowStyle}>
                <input
                  type="text"
                  placeholder="Teléfono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  required
                />
                <select
                  value={tipo_donante}
                  onChange={(e) => setTipo_donante(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  required
                >
                  <option value="" style={{color:'#000'}}>Tipo de donante</option>
                  <option value="natural" style={{color:'#000'}}>Natural</option>
                  <option value="juridica" style={{color:'#000'}}>Jurídica</option>
                </select>
              </div>

              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                required
              />
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                required
              />

              <button type="submit" style={buttonStyle}>
                Registrar
              </button>

              {mensaje && (
                <p
                  style={{
                    textAlign: "center",
                    color: mensaje.includes("Error") ? "#f87171" : "#86efac",
                    fontWeight: "bold",
                  }}
                >
                  {mensaje}
                </p>
              )}

              <p
                onClick={() => setShowModal(false)}
                style={{
                  textAlign: "center",
                  color: "#9ca3af",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Cerrar
              </p>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 Estilos reutilizables */
const inputStyle: React.CSSProperties = {
  padding: ".8rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.1)",
  backgroundColor: "rgba(255,255,255,0.05)",
  color: "#fff",
  outline: "none",
  transition: "all 0.3s ease",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  marginTop: "1.5rem",
  padding: ".9rem",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #22c55e, #16a34a)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all .3s ease",
  boxShadow: "0 0 10px rgba(34,197,94,0.25)",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "rgba(17,24,39,0.95)",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(12px)",
  padding: "2rem",
  borderRadius: "16px",
  boxShadow: "0 0 25px rgba(34,197,94,0.25)",
  width: "90%",
  maxWidth: "480px",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  gap: "1rem",
  width: "100%",
};


