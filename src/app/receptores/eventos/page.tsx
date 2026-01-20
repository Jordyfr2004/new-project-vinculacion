'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Evento } from '@/types';
import Header from '@/components/Header';
import EventCard from '@/components/EventCard';
import { Calendar, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function EventosReceptorPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmadoIds, setConfirmadoIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthAndLoadEvents();
  }, []);

  const checkAuthAndLoadEvents = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.push('/');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('rol')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!userData || userData.rol !== 'receptor') {
        router.push('/');
        return;
      }

      setUser(authUser);
      fetchEventos(authUser.id);
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    }
  };

  const fetchEventos = async (userId: string) => {
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
        
        // Filtrar eventos por ventana de visibilidad
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
        
        // Ordenar por fecha del evento (más próximos primero)
        eventosVisibles.sort((a: Evento, b: Evento) => {
          const fechaA = new Date(a.fecha_evento_inicio).getTime();
          const fechaB = new Date(b.fecha_evento_inicio).getTime();
          return fechaA - fechaB;
        });
        
        setEventos(eventosVisibles);

        // Cargar asistencias confirmadas del usuario
        if (eventosVisibles.length > 0) {
          const eventosIds = eventosVisibles.map((e: Evento) => e.evento_id);
          const { data: asistencias } = await supabase
            .from('evento_asistencia')
            .select('evento_id')
            .eq('usuario_id', userId)
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
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Error al confirmar asistencia');
      }
    } catch (error) {
      console.error('Error confirming asistencia:', error);
      alert('Error al confirmar asistencia');
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.push('/receptores')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Panel
          </Button>
          
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold">Todos los Eventos</h1>
          </div>
          <p className="text-slate-400">
            Explora y confirma tu asistencia a los eventos disponibles
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-slate-400">Cargando eventos...</p>
            </div>
          </div>
        ) : eventos.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
            <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No hay eventos disponibles
            </h3>
            <p className="text-slate-400">
              No hay eventos programados en este momento. Vuelve más tarde para ver nuevos eventos.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-400">
                {eventos.length} evento{eventos.length === 1 ? '' : 's'} disponible{eventos.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          </>
        )}
      </main>
    </div>
  );
}
