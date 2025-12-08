'use client';

import { Users, Package, Heart, TrendingUp } from 'lucide-react';

interface ImpactProps {
  onDonateClick?: () => void;
}

export default function Impact({ onDonateClick }: ImpactProps) {
  const stats = [
    {
      icon: Users,
      value: '1,500+',
      label: 'Familias Ayudadas',
      description: 'Familias que han recibido apoyo alimentario',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Package,
      value: '10,000+',
      label: 'Kg Donados',
      description: 'Kilogramos de alimentos distribuidos',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Heart,
      value: '500+',
      label: 'Donantes Activos',
      description: 'Personas y organizaciones que donan regularmente',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Satisfacción',
      description: 'Nivel de satisfacción de receptores y donantes',
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section id="impacto" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Nuestro <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Impacto</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Números que reflejan el compromiso de nuestra comunidad
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="group relative bg-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity`} />

                {/* Content */}
                <div className="relative">
                  <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-lg font-semibold text-green-400 mb-2">{stat.label}</div>
                  <div className="text-slate-400 text-sm">{stat.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-slate-800/50 border border-slate-700 rounded-2xl p-8 max-w-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              ¿Quieres ser parte del cambio?
            </h3>
            <p className="text-slate-300 mb-6">
              Únete a nuestra comunidad y ayuda a hacer la diferencia en la vida de muchas familias
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={onDonateClick}
                className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40"
              >
                Quiero Donar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
