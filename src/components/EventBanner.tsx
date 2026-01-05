'use client';

import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Evento } from '@/types';
import EventCard from './EventCard';

interface EventBannerProps {
  titulo?: string;
  maxEventos?: number;
}

export default function EventBanner({ titulo = 'Eventos Próximos', maxEventos = 3 }: Readonly<EventBannerProps>) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [totalEventos, setTotalEventos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmadoIds, setConfirmadoIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchEventos();
  }, []);

  const fetchEventos = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/eventos', { headers });
      if (response.ok) {
        const data = await response.json();
        
        const ahora = Date.now();
        
        // Filtrar eventos por ventana de visibilidad en banner
        // Mostrar si: ahora >= fecha_mostrar_desde AND (no tiene fecha_mostrar_hasta OR ahora < fecha_mostrar_hasta)
        const eventosVisibles = data.filter((e: Evento) => {
          try {
            const fechaMostrarDesde = new Date(e.fecha_mostrar_desde).getTime();
            const fechaMostrarHasta = e.fecha_mostrar_hasta 
              ? new Date(e.fecha_mostrar_hasta).getTime() 
              : null;
            
            const estaEnVentana = ahora >= fechaMostrarDesde && (!fechaMostrarHasta || ahora < fechaMostrarHasta);
            
            return estaEnVentana;
          } catch (error) {
            console.warn('Error parsing dates for evento:', e.evento_id, error);
            return false;
          }
        });
        
        setTotalEventos(eventosVisibles.length);
        const eventosAMostrar = eventosVisibles.slice(0, maxEventos);
        setEventos(eventosAMostrar);

        // Cargar asistencias confirmadas del usuario
        if (session?.user?.id && eventosAMostrar.length > 0) {
          const eventosIds = eventosAMostrar.map((e: Evento) => e.evento_id);
          const { data: asistencias } = await supabase
            .from('evento_asistencia')
            .select('evento_id')
            .eq('usuario_id', session.user.id)
            .eq('confirmado', true)
            .in('evento_id', eventosIds);
          
          if (asistencias) {
            setConfirmadoIds(new Set(asistencias.map(a => a.evento_id)));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching eventos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAsistencia = async (eventoId: string) => {
    try {
      setLoadingId(eventoId);
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/eventos/${eventoId}/asistencia`, {
        method: 'POST',
        headers,
      });

      if (response.ok) {
        setConfirmadoIds((prev) => new Set([...prev, eventoId]));
      }
    } catch (error) {
      console.error('Error confirming asistencia:', error);
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700 rounded-lg p-6">
        <p className="text-slate-400 text-center">Cargando eventos...</p>
      </div>
    );
  }

  if (eventos.length === 0) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          {titulo}
          <span className="text-sm px-3 py-1 bg-green-500/20 text-green-400 rounded-full">
            {eventos.length} evento{eventos.length === 1 ? '' : 's'}
          </span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventos.map((evento) => (
          <EventCard
            key={evento.evento_id}
            evento={evento}
            onConfirmAsistencia={handleConfirmAsistencia}
            usuarioConfirmo={confirmadoIds.has(evento.evento_id)}
            isLoading={loadingId === evento.evento_id}
          />
        ))}
      </div>

      {totalEventos > maxEventos && (
        <div className="mt-6 text-center">
          <a
            href="/receptores?tab=eventos"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all"
          >
            Ver todos los eventos ({totalEventos} disponibles)
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      )}
    </div>
  );
}
