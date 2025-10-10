export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-[#070707] dark:to-[#0a0a0a] text-gray-900 dark:text-gray-100">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 text-white rounded flex items-center justify-center font-bold">V</div>
          <span className="font-semibold text-lg">Vinculacion</span>
        </div>
        <nav className="hidden md:flex gap-6 items-center">
          <a className="hover:underline" href="#features">Características</a>
          <a className="hover:underline" href="#how">Cómo funciona</a>
          <a className="hover:underline" href="#contact">Contacto</a>
          <a className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" href="/login">Ingresar</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <section className="space-y-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            Plataforma para vinculación de donantes y receptores
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Administra donaciones y solicitudes de forma simple. Conecta donantes con receptores y gestiona solicitudes desde un panel centralizado.
          </p>

          <div className="flex gap-4 items-center">
            <a className="px-5 py-3 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700" href="/donantes">Ver donantes</a>
            <a className="px-5 py-3 border rounded hover:bg-gray-100 dark:hover:bg-[#111]" href="/receptores">Ver receptores</a>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-3 bg-white dark:bg-[#0f0f0f] rounded shadow text-center">
              <div className="text-xl font-bold">120+</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Donantes</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#0f0f0f] rounded shadow text-center">
              <div className="text-xl font-bold">85</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Receptores</div>
            </div>
            <div className="p-3 bg-white dark:bg-[#0f0f0f] rounded shadow text-center">
              <div className="text-xl font-bold">310</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Solicitudes</div>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-[#0b0b0b] rounded-lg p-6 shadow">
          <form className="space-y-4">
            <h3 className="text-xl font-semibold">Inicia Sesion</h3>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">correo electronico</label>
              <input className="mt-1 block w-full rounded border px-3 py-2 bg-transparent" placeholder="Ej. 12345678" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-300">contraseña</label>
              <input className="mt-1 block w-full rounded border px-3 py-2 bg-transparent" placeholder="Ej. 12345678" />
            </div>
            <div className="flex gap-3">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded">Enviar solicitud</button>
              <button className="px-4 py-2 border rounded">Limpiar</button>
            </div>
          </form>
        </section>
      </main>

      <section id="features" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Características</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-[#0b0b0b] rounded shadow">
            <h4 className="font-semibold mb-2">Gestión centralizada</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Administra usuarios, solicitudes y donaciones desde un mismo lugar.</p>
          </div>
          <div className="p-6 bg-white dark:bg-[#0b0b0b] rounded shadow">
            <h4 className="font-semibold mb-2">Relaciones seguras</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Control de accesos y trazabilidad de cada solicitud y donación.</p>
          </div>
          <div className="p-6 bg-white dark:bg-[#0b0b0b] rounded shadow">
            <h4 className="font-semibold mb-2">Fácil integración</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">Conecta con tus sistemas existentes y exporta reportes.</p>
          </div>
        </div>
      </section>

      <section id="how" className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-semibold mb-6">Cómo funciona</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
          <li>Registras donantes y receptores.</li>
          <li>Los receptores generan solicitudes.</li>
          <li>El administrador vincula donantes a solicitudes según disponibilidad.</li>
        </ol>
      </section>

      <footer id="contact" className="max-w-6xl mx-auto px-6 py-8 border-t border-gray-200 dark:border-gray-800 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Vinculacion. Todos los derechos reservados.</div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacidad</a>
            <a href="#" className="hover:underline">Términos</a>
            <a href="#" className="hover:underline">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
