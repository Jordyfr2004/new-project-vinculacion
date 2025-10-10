"use client";

import { motion } from "framer-motion";

export default function DonantesLogin() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-[#070707] dark:to-[#0a0a0a] text-gray-900 dark:text-gray-100 flex flex-col">
      {/* Header */}
      <header className="w-full py-6 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">V</div>
          <span className="font-semibold text-lg">Vinculación</span>
        </div>
        <a
          href="/"
          className="text-sm font-medium hover:underline text-indigo-600 dark:text-indigo-400"
        >
          Volver al inicio
        </a>
      </header>

      {/* Main content */}
      <main className="flex flex-col md:flex-row items-center justify-center flex-1 gap-12 px-6 py-12 max-w-6xl mx-auto">
        {/* Sección de información */}
        <motion.section
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex-1 space-y-6"
        >
          <h1 className="text-4xl font-extrabold leading-tight">
            Únete como Donante 
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Contribuye a mejorar la calidad de vida de quienes más lo necesitan.  
            Desde esta plataforma podrás ofrecer donaciones, revisar solicitudes
            y dar seguimiento a tus aportes con total transparencia.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#0f0f0f] rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold text-indigo-600">+150</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Donantes activos</p>
            </div>
            <div className="p-4 bg-white dark:bg-[#0f0f0f] rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold text-indigo-600">+400</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Solicitudes cubiertas</p>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
            Cada aporte cuenta. Gestiona tus donaciones fácilmente desde tu cuenta
            y ayuda a conectar recursos con quienes los necesitan.
          </p>
        </motion.section>

        {/* Formulario de login */}
        <motion.section
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white dark:bg-[#0b0b0b] rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold mb-2 text-center">Inicia sesión como Donante</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
            Accede a tu cuenta para gestionar tus donaciones
          </p>

          <form className="space-y-5">
            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                Correo electrónico
              </label>
              <input
                type="email"
                placeholder="ejemplo@correo.com"
                className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-600 dark:text-gray-300">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="********"
                className="w-full px-4 py-2 border rounded-lg bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="accent-indigo-600" /> Recordarme
              </label>
              <a href="#" className="hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
            >
              Iniciar sesión
            </button>

            <div className="text-center text-sm mt-5 text-gray-500 dark:text-gray-400">
              ¿No tienes una cuenta?{" "}
              <a href="/registro-donante" className="text-indigo-600 hover:underline">
                Regístrate aquí
              </a>
            </div>
          </form>
        </motion.section>
      </main>

      {/* Información adicional */}
      <section className="border-t border-gray-200 dark:border-gray-800 py-16 px-6 max-w-6xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">¿Por qué donar con nosotros?</h2>
        <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-300 mb-10">
          Nuestra plataforma conecta a donantes comprometidos con receptores verificados.
          A través de un sistema transparente, garantizamos que cada ayuda llegue a quien realmente lo necesita.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#0b0b0b] rounded-xl shadow">
            <h3 className="font-semibold mb-2 text-indigo-600">🌱 Impacto real</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Cada donación es registrada y monitoreada para asegurar su correcta entrega.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-[#0b0b0b] rounded-xl shadow">
            <h3 className="font-semibold mb-2 text-indigo-600">🤝 Comunidad solidaria</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Únete a cientos de personas que contribuyen al bienestar social de su comunidad.
            </p>
          </div>
          <div className="p-6 bg-white dark:bg-[#0b0b0b] rounded-xl shadow">
            <h3 className="font-semibold mb-2 text-indigo-600">🔒 Confianza y seguridad</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Todos los datos y transacciones se manejan con los más altos estándares de seguridad.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Vinculación — Conectando corazones y esperanza.
      </footer>
    </div>
  );
}
