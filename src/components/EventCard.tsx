'use client';

import { Calendar, MapPin, Users } from 'lucide-react';
import { Evento } from '@/types';

interface EventCardProps {
  evento: Evento;
  onConfirmAsistencia?: (eventoId: string) => void;
  usuarioConfirmo?: boolean;
  isLoading?: boolean;
}

export default function EventCard({
  evento,
  onConfirmAsistencia,
  usuarioConfirmo = false,
  isLoading = false,
}: EventCardProps) {
  const fechaInicio = new Date(evento.fecha_evento_inicio);
  const estaActivo = evento.estado === 'activo';
  const estaProximo = fechaInicio.getTime() > Date.now();

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-lg overflow-hidden hover:border-green-500 transition-all hover:shadow-lg hover:shadow-green-500/20">
      {evento.imagen_url && (
        <div className="w-full h-48 overflow-hidden bg-slate-700">
          <img
            src={evento.imagen_url}
            alt={evento.titulo}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Estado y tipo */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 text-xs font-semibold rounded ${
              estaActivo
                ? 'bg-green-500/20 text-green-400'
                : estaProximo
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-slate-500/20 text-slate-400'
            }`}
          >
            {evento.estado === 'activo'
              ? 'En vivo'
              : evento.estado === 'planificado' && estaProximo
                ? 'Próximo'
                : evento.estado}
          </span>
          <span className="px-2 py-1 text-xs font-semibold bg-slate-700 text-slate-300 rounded">
            {evento.tipo}
          </span>
        </div>

        {/* Título */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{evento.titulo}</h3>

        {/* Descripción */}
        <p className="text-sm text-slate-400 mb-4 line-clamp-2">{evento.descripcion}</p>

        {/* Detalles */}
        <div className="space-y-2 mb-4">
          {/* Fecha */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <Calendar className="w-4 h-4 text-green-400" />
            <span>
              {fechaInicio.toLocaleDateString('es-ES', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}{' '}
              a las{' '}
              {fechaInicio.toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-green-400" />
            <span className="truncate">{evento.ubicacion}</span>
          </div>

          {/* Asistentes */}
          {evento.asistentes_count !== undefined && (
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Users className="w-4 h-4 text-green-400" />
              <span>
                {evento.asistentes_count}{' '}
                {evento.asistentes_count === 1 ? 'asistente' : 'asistentes'}
                {evento.capacidad_maxima ? ` / ${evento.capacidad_maxima}` : ''}
              </span>
            </div>
          )}
        </div>

        {/* Botón de acción */}
        {onConfirmAsistencia && (
          <button
            onClick={() => onConfirmAsistencia(evento.evento_id)}
            disabled={isLoading || usuarioConfirmo}
            className={`w-full py-2 rounded-lg font-semibold transition-all ${
              usuarioConfirmo
                ? 'bg-slate-700 text-slate-400 cursor-default'
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {isLoading
              ? 'Confirmando...'
              : usuarioConfirmo
                ? '✓ Asistencia confirmada'
                : 'Confirmar asistencia'}
          </button>
        )}
      </div>
    </div>
  );
}
