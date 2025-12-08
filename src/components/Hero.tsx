'use client';

import { ArrowRight, Heart, Users, Package } from 'lucide-react';
import Link from 'next/link';

interface HeroProps {
  onDonateClick?: () => void;
}

export default function Hero({ onDonateClick }: HeroProps) {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full mb-8">
            <Heart className="w-4 h-4 text-green-400" fill="currentColor" />
            <span className="text-green-400 text-sm font-medium">Solidaridad en Acción</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
              Conectando Corazones
            </span>
            <br />
            <span className="text-white">Con Alimentos</span>
          </h1>

          {/* Description */}
          <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Un sistema que une a donantes generosos con familias que necesitan apoyo. 
            Cada donación marca la diferencia.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={onDonateClick}
              className="group flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-semibold text-lg transition-all shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-105"
            >
              <span>Quiero Donar</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              href="/#como-funciona"
              className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl text-white font-semibold text-lg transition-all hover:scale-105"
            >
              Cómo Funciona
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4 mx-auto">
                <Users className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">1,500+</div>
              <div className="text-slate-400">Familias Ayudadas</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4 mx-auto">
                <Heart className="w-6 h-6 text-green-400" fill="currentColor" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-slate-400">Donantes Activos</div>
            </div>
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-colors">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/10 rounded-lg mb-4 mx-auto">
                <Package className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">10,000+</div>
              <div className="text-slate-400">Kg Donados</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-slate-600 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-green-400 rounded-full mt-2" />
        </div>
      </div>
    </section>
  );
}
