'use client';

import { Mail, Phone, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <section id="contacto" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Contáctanos
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-white mb-4">Información de Contacto</h3>
              <p className="text-slate-300 max-w-xl mx-auto">
                Estamos comprometidos en ayudarte. Si tienes alguna pregunta o necesitas asistencia,
                no dudes en contactarnos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Email */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all hover:transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
                    <Mail className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h4 className="text-white font-semibold text-lg text-center mb-2">Email</h4>
                <p className="text-slate-400 text-center break-words">contacto@ayudasocial.org</p>
              </div>

              {/* Phone */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all hover:transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
                    <Phone className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h4 className="text-white font-semibold text-lg text-center mb-2">Teléfono</h4>
                <p className="text-slate-400 text-center">+123 456 7890</p>
              </div>

              {/* Location */}
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all hover:transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full">
                    <MapPin className="w-8 h-8 text-green-400" />
                  </div>
                </div>
                <h4 className="text-white font-semibold text-lg text-center mb-2">Dirección</h4>
                <p className="text-slate-400 text-center">Manta, Ecuador</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
