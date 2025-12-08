'use client';

import { Heart, Package, Users, CheckCircle } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Heart,
      title: 'Regístrate',
      description: 'Crea tu cuenta como donante o receptor. El proceso es rápido y sencillo.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Package,
      title: 'Donación',
      description: 'Los donantes registran sus donaciones de alimentos. Nosotros los organizamos y almacenamos.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Users,
      title: 'Distribución',
      description: 'Los administradores asignan los alimentos a las familias que más lo necesitan.',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: CheckCircle,
      title: 'Impacto',
      description: 'Seguimiento del impacto de cada donación y familias ayudadas.',
      color: 'from-orange-500 to-red-600',
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-slate-800/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Cómo <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Funciona</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Un proceso simple y transparente que conecta a donantes con familias necesitadas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="relative group"
              >
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 h-full hover:border-green-500/50 transition-all duration-300 hover:transform hover:scale-105">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Connector Line (hidden on last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-700 to-transparent transform -translate-y-1/2">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
