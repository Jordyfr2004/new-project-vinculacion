"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { motion } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState(""); // ✅ Puede ser email o cédula
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: identificador, password }), // backend usa 'email' aunque sea cédula
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Error en el login");

      // ✅ Guardar token
      Cookies.set("token", data.access_token, { expires: 1, sameSite: 'Lax'});

      // ✅ Redirigir según rol
      if (data.rol === "admin") router.push("/admin");
      else if (data.rol === "donante") router.push("/donantes");
      else if (data.rol === "receptor") router.push("/receptores");
      else router.push("/");

    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-[#070707] dark:to-[#0a0a0a] text-gray-900 dark:text-gray-100"
    >
      {/* HEADER */}
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded flex items-center justify-center font-bold shadow-md">V</div>
          <span className="font-semibold text-lg">Vinculación</span>
        </div>
      </header>

      {/* HERO + LOGIN */}
      <main className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* IZQUIERDA */}
        <motion.section
          className="space-y-6"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Plataforma de ayuda social y solidaria 💙
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
            Conéctate, dona y ayuda a mejorar vidas. <br />
            Tu apoyo genera un cambio real. 🌍
          </p>
        </motion.section>

        {/* LOGIN */}
        <motion.section
          id="login"
          className="bg-white dark:bg-[#0b0b0b] rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <form className="space-y-5" onSubmit={handleLogin}>
            <h3 className="text-2xl font-semibold text-center text-indigo-600">
              Inicia sesión
            </h3>

            {error && (
              <p className="text-center text-red-500 text-sm">{error}</p>
            )}

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">
                Cédula o Email
              </label>
              <input
                type="text" // ✅ permite letras o números sin formato email
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="Ej. 0923456789 o admin@mail.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                placeholder="••••••••"
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
            >
              Ingresar
            </motion.button>
          </form>
        </motion.section>
      </main>
    </motion.div>
  );
}


