'use client';

import React, { useState } from "react";

export default function DonantesPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)",
        fontFamily: "Poppins, sans-serif",
        color: "#fff",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* 🔹 Contenedor principal */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          width: "100%",
          maxWidth: "950px",
          backgroundColor: "rgba(255,255,255,0.08)",
          borderRadius: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
          overflow: "hidden",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* 🔸 Lado izquierdo - texto */}
        <div
          style={{
            flex: 1,
            minWidth: "300px",
            padding: "3rem 2rem",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            background: "linear-gradient(180deg, rgba(79,70,229,0.8), rgba(17,24,39,0.9))",
          }}
        >
          <h2
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              color: "#e9d5ff",
              marginBottom: "1rem",
              textShadow: "0 0 10px rgba(167,139,250,0.5)",
            }}
          >
            Bienvenido a SolidarityHub 💜
          </h2>
          <p style={{ lineHeight: 1.7, opacity: 0.9, fontSize: "1.05rem" }}>
            Conéctate con una comunidad solidaria que busca hacer el bien.  
            Inicia sesión para descubrir oportunidades de ayuda y hacer la diferencia.
          </p>
        </div>

        {/* 🔹 Lado derecho - login */}
        <div
          style={{
            flex: 1,
            minWidth: "320px",
            padding: "3rem 2rem",
            backgroundColor: "rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              color: "#c4b5fd",
              marginBottom: "2rem",
              fontWeight: "bold",
            }}
          >
            Iniciar sesión
          </h2>

          {/* Formulario visual */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <input type="email" placeholder="Correo electrónico" style={inputStyle} disabled />
            <input type="password" placeholder="Contraseña" style={inputStyle} disabled />
          </div>

          <p
            style={{
              textAlign: "center",
              fontSize: ".95rem",
              color: "#d1d5db",
              marginBottom: "1.5rem",
            }}
          >
            ¿No tienes cuenta?{" "}
            <span
              style={{
                color: "#a78bfa",
                cursor: "pointer",
                textDecoration: "underline",
                transition: "color 0.3s ease",
              }}
              onClick={() => setShowModal(true)}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#a78bfa")}
            >
              Regístrate
            </span>
          </p>

          <button
            style={buttonStyle}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "linear-gradient(90deg, #7c3aed, #9f67ff)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "linear-gradient(90deg, #6d28d9, #8b5cf6)")
            }
          >
            Iniciar sesión
          </button>
        </div>
      </div>

      {/* 🔸 Modal de registro */}
      {showModal && (
        <div style={overlayStyle} onClick={() => setShowModal(false)}>
          <div
            style={modalStyle}
            onClick={(e) => e.stopPropagation()} // evita cerrar al hacer click dentro del modal
          >
            <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "#c4b5fd" }}>
              Registro de Donantes
            </h2>

            <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Fila 1: nombres y apellidos */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <input type="text" placeholder="Nombres" style={{ ...inputStyle, flex: 1 }} />
                <input type="text" placeholder="Apellidos" style={{ ...inputStyle, flex: 1 }} />
              </div>

              {/* Fila 2: teléfono y tipo de donante */}
              <div style={{ display: "flex", gap: "1rem" }}>
                <input type="text" placeholder="Teléfono" style={{ ...inputStyle, flex: 1 }} />
                <select style={{ ...inputStyle, flex: 1, color: "#ccc" }}>
                  <option value="">Tipo de donante</option>
                  <option value="natural">Natural</option>
                  <option value="juridica">Jurídica</option>
                </select>
              </div>

              {/* Fila 3 y 4 */}
              <input type="email" placeholder="Correo electrónico" style={inputStyle} />
              <input type="password" placeholder="Contraseña" style={inputStyle} />

              {/* Botón */}
              <button
                type="button"
                style={buttonStyle}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "linear-gradient(90deg, #7c3aed, #9f67ff)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "linear-gradient(90deg, #6d28d9, #8b5cf6)")
                }
              >
                Registrar
              </button>

              <p
                onClick={() => setShowModal(false)}
                style={{
                  textAlign: "center",
                  marginTop: "0.5rem",
                  color: "#d1d5db",
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

/* 🎨 Estilos generales */
const inputStyle: React.CSSProperties = {
  padding: ".8rem",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.2)",
  backgroundColor: "rgba(0,0,0,0.3)",
  color: "#fff",
  outline: "none",
  transition: "all 0.3s ease",
};

const buttonStyle: React.CSSProperties = {
  padding: ".9rem",
  borderRadius: "10px",
  border: "none",
  background: "linear-gradient(90deg, #6d28d9, #8b5cf6)",
  color: "#fff",
  fontWeight: "bold",
  cursor: "pointer",
  transition: "all .3s ease",
};

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 100,
  animation: "fadeIn 0.3s ease",
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.08)",
  backdropFilter: "blur(12px)",
  padding: "2rem",
  borderRadius: "16px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
  width: "90%",
  maxWidth: "480px",
  animation: "scaleIn 0.3s ease",
};

