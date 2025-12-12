'use client';

import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { useState, FormEvent } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    // Simulate form submission
    setTimeout(() => {
      setSubmitMessage({ text: '¡Mensaje enviado! Nos pondremos en contacto contigo pronto.', type: 'success' });
      setFormData({ name: '', email: '', message: '' });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contacto" className="py-20 bg-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Contáctanos
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Información de Contacto</h3>
              <p className="text-slate-300 mb-8">
                Estamos comprometidos en ayudarte. Si tienes alguna pregunta o necesitas asistencia,
                no dudes en contactarnos.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Mail className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Email</h4>
                  <p className="text-slate-400">contacto@ayudasocial.org</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Phone className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Teléfono</h4>
                  <p className="text-slate-400">+123 456 7890</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-1">Dirección</h4>
                  <p className="text-slate-400">Manta, Ecuador</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="ejemplo@correo.com"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Mensaje
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                />
              </div>

              {submitMessage && (
                <div
                  className={`p-4 rounded-lg ${
                    submitMessage.type === 'error'
                      ? 'bg-red-500/10 text-red-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {submitMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
