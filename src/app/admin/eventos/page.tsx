'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, Trash2, Calendar, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { Evento, TipoEvento } from '@/types';
import Header from '@/components/Header';
import Modal from '@/components/ui/Modal';
import Card from '@/components/ui/Card';

export default function AdminEventosPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvento, setSelectedEvento] = useState<Evento | null>(null);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  type FormData = {
    titulo: string;
    descripcion: string;
    fecha_evento_inicio: string;
    fecha_evento_fin: string;
    fecha_mostrar_desde: string;
    fecha_mostrar_hasta: string;
    ubicacion: string;
    tipo: TipoEvento;
    dirigido_a: string[];
    capacidad_maxima: string;
    imagen_url: string;
  };

  const [formData, setFormData] = useState<FormData>({
    titulo: '',
    descripcion: '',
    fecha_evento_inicio: '',
    fecha_evento_fin: '',
    fecha_mostrar_desde: '',
    fecha_mostrar_hasta: '',
    ubicacion: '',
    tipo: 'general',
    dirigido_a: ['donante', 'receptor'],
    capacidad_maxima: '',
    imagen_url: '',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      console.log('🔑 Session en cliente:', session?.user?.id || 'ninguno');
      console.log('🍪 Cookies en cliente:', document.cookie);
      
      if (!session) {
        router.push('/');
        return;
      }

      // Verificar rol
      const { data: userData } = await supabase
        .from('users')
        .select('rol')
        .eq('id', session.user.id)
        .single();

      if (!userData?.rol || userData.rol !== 'admin') {
        router.push('/');
        return;
      }

      setIsAuthenticated(true);
      fetchEventos();
    } catch (error) {
      console.error('Error checking auth:', error);
      router.push('/');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const fetchEventos = async () => {
    try {
      setIsFetching(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch('/api/eventos', {
        credentials: 'include',
        headers,
      });
      
      if (!response.ok) {
        console.error('Error fetching eventos:', response.status, response.statusText);
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Eventos cargados:', data.length, data);
      setEventos(data);
    } catch (error) {
      console.error('❌ Error fetching eventos:', error);
      setMessage({ text: 'Error al cargar eventos', type: 'error' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenModal = (evento?: Evento) => {
    if (evento) {
      setSelectedEvento(evento);
      
      // Helper para parsear fecha ISO a formato datetime-local
      const formatDatetime = (dateString?: string, fallback?: string) => {
        try {
          if (dateString) {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
          }
          if (fallback) {
            const date = new Date(fallback);
            return date.toISOString().slice(0, 16);
          }
          return '';
        } catch {
          return '';
        }
      };

      setFormData({
        titulo: evento.titulo,
        descripcion: evento.descripcion,
        fecha_evento_inicio: formatDatetime(evento.fecha_evento_inicio, evento.fecha_inicio),
        fecha_evento_fin: formatDatetime(evento.fecha_evento_fin, evento.fecha_fin),
        fecha_mostrar_desde: formatDatetime(evento.fecha_mostrar_desde),
        fecha_mostrar_hasta: formatDatetime(evento.fecha_mostrar_hasta),
        ubicacion: evento.ubicacion,
        tipo: evento.tipo,
        dirigido_a: evento.dirigido_a,
        capacidad_maxima: evento.capacidad_maxima?.toString() || '',
        imagen_url: evento.imagen_url || '',
      });
    } else {
      setSelectedEvento(null);
      const ahora = new Date().toISOString().slice(0, 16);
      setFormData({
        titulo: '',
        descripcion: '',
        fecha_evento_inicio: ahora,
        fecha_evento_fin: '',
        fecha_mostrar_desde: ahora,
        fecha_mostrar_hasta: '',
        ubicacion: '',
        tipo: 'general',
        dirigido_a: ['donante', 'receptor'],
        capacidad_maxima: '',
        imagen_url: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvento(null);
    setMessage(null);
  };

  const handleChangeFechaEventoFin = (value: string) => {
    setFormData(prev => ({
      ...prev,
      fecha_evento_fin: value,
      // Auto-sync: la visibilidad termina cuando el evento termina
      fecha_mostrar_hasta: value,
    }));
  };

  const handleChangeFechaEventoInicio = (value: string) => {
    setFormData(prev => {
      const newData = { ...prev, fecha_evento_inicio: value };
      // Si "Mostrar desde" está vacío, usar la fecha de inicio del evento
      if (!prev.fecha_mostrar_desde) {
        newData.fecha_mostrar_desde = value;
      }
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validaciones de coherencia
    const fechaInicio = new Date(formData.fecha_evento_inicio);
    const fechaFin = formData.fecha_evento_fin ? new Date(formData.fecha_evento_fin) : null;
    const fechaMostrarDesde = new Date(formData.fecha_mostrar_desde);
    const fechaMostrarHasta = formData.fecha_mostrar_hasta ? new Date(formData.fecha_mostrar_hasta) : null;

    // Validar que fecha fin sea después de fecha inicio
    if (fechaFin && fechaFin <= fechaInicio) {
      setMessage({ text: 'La fecha de fin debe ser posterior a la fecha de inicio', type: 'error' });
      return;
    }

    // Validar que fecha mostrar hasta sea después de fecha mostrar desde
    if (fechaMostrarHasta && fechaMostrarHasta <= fechaMostrarDesde) {
      setMessage({ text: 'La fecha de dejar de mostrar debe ser posterior a la fecha de inicio de visualización', type: 'error' });
      return;
    }

    // Validar capacidad máxima
    if (formData.capacidad_maxima && Number.parseInt(formData.capacidad_maxima) < 1) {
      setMessage({ text: 'La capacidad máxima debe ser al menos 1', type: 'error' });
      return;
    }

    try {
      const url = selectedEvento ? `/api/eventos/${selectedEvento.evento_id}` : '/api/eventos';
      const method = selectedEvento ? 'PUT' : 'POST';

      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const payload = {
        titulo: formData.titulo.trim(),
        descripcion: formData.descripcion.trim(),
        fecha_evento_inicio: formData.fecha_evento_inicio,
        fecha_evento_fin: formData.fecha_evento_fin || null,
        fecha_mostrar_desde: formData.fecha_mostrar_desde,
        fecha_mostrar_hasta: formData.fecha_mostrar_hasta || null,
        ubicacion: formData.ubicacion.trim(),
        tipo: formData.tipo,
        dirigido_a: formData.dirigido_a,
        capacidad_maxima: formData.capacidad_maxima ? Number.parseInt(formData.capacidad_maxima, 10) : null,
        imagen_url: formData.imagen_url.trim() || null,
      };

      const response = await fetch(url, {
        method,
        headers,
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al guardar evento');
      }

      setMessage({
        text: selectedEvento ? 'Evento actualizado correctamente' : 'Evento creado correctamente',
        type: 'success',
      });

      setTimeout(() => {
        handleCloseModal();
        fetchEventos();
      }, 1500);
    } catch (error: any) {
      console.error('Error detallado:', error);
      setMessage({ text: error.message || 'Error al guardar evento', type: 'error' });
    }
  };

  const handleDelete = async (eventoId: string) => {
    if (!confirm('¿Está seguro de que desea eliminar este evento?')) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = {};
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/eventos/${eventoId}`, { 
        method: 'DELETE',
        credentials: 'include',
        headers,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar evento');
      }

      setMessage({ text: 'Evento eliminado correctamente', type: 'success' });
      fetchEventos();
    } catch (error: any) {
      setMessage({ text: error.message || 'Error al eliminar evento', type: 'error' });
    }
  };

  const handleChangeEstado = async (eventoId: string, nuevoEstado: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
      }

      const response = await fetch(`/api/eventos/${eventoId}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar estado');
      }

      setMessage({ text: 'Estado actualizado correctamente', type: 'success' });
      setTimeout(() => {
        fetchEventos();
      }, 1000);
    } catch (error: any) {
      setMessage({ text: error.message || 'Error al actualizar estado', type: 'error' });
    }
  };

  const getEstadoClasses = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'planificado':
        return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
      case 'completado':
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/30';
      case 'cancelado':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'activo':
        return '🟢 Activo';
      case 'planificado':
        return '📅 Planificado';
      case 'completado':
        return '✅ Completado';
      case 'cancelado':
        return '❌ Cancelado';
      default:
        return estado;
    }
  };

  const getEstadoSelectClasses = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'completado':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'cancelado':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const calcularEstadoAutomatico = (evento: Evento): string => {
    // Si está cancelado, mantenerlo cancelado
    if (evento.estado === 'cancelado') {
      return 'cancelado';
    }

    const ahora = new Date();
    const fechaInicio = new Date(evento.fecha_evento_inicio);
    const fechaFin = evento.fecha_evento_fin ? new Date(evento.fecha_evento_fin) : null;

    // Si ya terminó el evento
    if (fechaFin && ahora > fechaFin) {
      return 'completado';
    }

    // Si el evento ya comenzó pero no ha terminado
    if (ahora >= fechaInicio) {
      return 'activo';
    }

    // Si aún no ha comenzado
    return 'planificado';
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
          <p className="text-slate-300 text-lg">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const eventosFiltrados = filtroEstado
    ? eventos.filter((e) => e.estado === filtroEstado)
    : eventos;

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header de la página */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Gestión de Eventos</h1>
          <p className="text-slate-400">Crea y administra eventos para donantes y receptores</p>
          <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 flex items-center gap-2">
              ⏱️ <span className="font-medium">Actualización automática:</span> Los estados se actualizan según las fechas (Planificado → Activo → Completado)
            </p>
          </div>
        </div>

        {/* Filtros + Crear */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label htmlFor="filtro-estado" className="text-slate-300 font-medium">Filtrar por estado:</label>
            <select
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos los estados</option>
              <option value="planificado">📅 Planificado</option>
              <option value="activo">🟢 Activo</option>
              <option value="completado">✅ Completado</option>
              <option value="cancelado">❌ Cancelado</option>
            </select>
          </div>
          <div className="flex justify-end">
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all shadow-lg shadow-green-500/20 hover:shadow-green-500/30"
            >
              <Plus className="w-5 h-5" />
              Crear Evento
            </button>
          </div>
        </div>

        {/* Grid de eventos */}
        {isFetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-300">Cargando eventos...</p>
            </div>
          </div>
        ) : !eventosFiltrados.length ? (
          <Card>
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No hay eventos disponibles</p>
              <p className="text-slate-500 text-sm mt-2">Crea uno nuevo para comenzar</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosFiltrados.map((evento) => {
              const estadoAutomatico = calcularEstadoAutomatico(evento);
              const estadoDesactualizado = estadoAutomatico !== evento.estado && evento.estado !== 'cancelado';
              
              return (
              <Card key={evento.evento_id} className="hover:shadow-lg hover:shadow-green-500/10 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white">{evento.titulo}</h3>
                    <p className="text-sm text-slate-400 mt-1 capitalize">{evento.tipo}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-3 py-1 text-xs font-semibold rounded ${getEstadoClasses(evento.estado)}`}>
                      {getEstadoTexto(evento.estado)}
                    </span>
                    {estadoDesactualizado && (
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        ⏱️ Auto: {getEstadoTexto(estadoAutomatico)}
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-300 text-sm mb-4 line-clamp-2 min-h-[40px]">{evento.descripcion}</p>

                <div className="space-y-2 mb-6 text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-xs">
                      {new Date(evento.fecha_evento_inicio).toLocaleDateString('es-ES', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="truncate text-xs">{evento.ubicacion}</span>
                  </div>
                  {evento.asistentes_count !== undefined && (
                    <div className="flex items-center gap-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-lg font-bold text-green-400">{evento.asistentes_count}</span>
                      <span className="text-xs text-slate-300">
                        {evento.asistentes_count === 1 ? 'confirmación' : 'confirmaciones'}
                        {evento.capacidad_maxima ? ` / ${evento.capacidad_maxima}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <label htmlFor={`estado-${evento.evento_id}`} className="block text-xs font-medium text-slate-400 mb-1">
                    Estado: 
                    {estadoDesactualizado && (
                      <span className="ml-2 text-yellow-400">(se actualizará automáticamente)</span>
                    )}
                  </label>
                  <select
                    id={`estado-${evento.evento_id}`}
                    value={evento.estado}
                    onChange={(e) => handleChangeEstado(evento.evento_id, e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded font-medium focus:outline-none focus:ring-2 focus:ring-green-500 ${getEstadoSelectClasses(evento.estado)}`}
                  >
                    <option value="planificado">📅 Planificado</option>
                    <option value="activo">🟢 Activo</option>
                    <option value="completado">✅ Completado</option>
                    <option value="cancelado">❌ Cancelado</option>
                  </select>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleOpenModal(evento)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-blue-500/15 text-blue-400 rounded-lg hover:bg-blue-500/25 transition-all text-sm font-medium border border-blue-500/20"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(evento.evento_id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-500/15 text-red-400 rounded-lg hover:bg-red-500/25 transition-all text-sm font-medium border border-red-500/20"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </Card>
              );
            })}
          </div>
        )}

        {/* Modal */}
        <Modal isOpen={showModal} onClose={handleCloseModal}>
          <div className="w-full">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
              {selectedEvento ? 'Editar Evento' : 'Crear Evento'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label htmlFor="form-titulo" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Título</label>
                <input
                  id="form-titulo"
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="form-descripcion" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Descripción</label>
                <textarea
                  id="form-descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  required
                />
              </div>

              <div className="border-t border-slate-700 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">📅 Fechas del Evento</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="form-fecha-inicio" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      Inicio
                      <span className="block text-xs text-slate-500 font-normal mt-0.5">Cuándo comienza</span>
                    </label>
                    <input
                      id="form-fecha-inicio"
                      type="datetime-local"
                      value={formData.fecha_evento_inicio}
                      onChange={(e) => handleChangeFechaEventoInicio(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="form-fecha-fin" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      Fin (opcional)
                      <span className="block text-xs text-slate-500 font-normal mt-0.5">Cuándo termina</span>
                    </label>
                    <input
                      id="form-fecha-fin"
                      type="datetime-local"
                      value={formData.fecha_evento_fin}
                      onChange={(e) => handleChangeFechaEventoFin(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-700 pt-4 sm:pt-6 mt-4 sm:mt-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">📢 Visibilidad en Banner</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label htmlFor="form-mostrar-desde" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      Mostrar desde
                      <span className="block text-xs text-slate-500 font-normal mt-0.5">Cuándo empezar</span>
                    </label>
                    <input
                      id="form-mostrar-desde"
                      type="datetime-local"
                      value={formData.fecha_mostrar_desde}
                      onChange={(e) => setFormData({ ...formData, fecha_mostrar_desde: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="form-mostrar-hasta" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                      Dejar de mostrar
                      <span className="block text-xs text-slate-500 font-normal mt-0.5">Automático (igual al fin del evento)</span>
                    </label>
                    <input
                      id="form-mostrar-hasta"
                      type="datetime-local"
                      value={formData.fecha_mostrar_hasta}
                      disabled
                      className="w-full px-3 sm:px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-sm text-slate-400 cursor-not-allowed opacity-75"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="form-ubicacion" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Ubicación</label>
                <input
                  id="form-ubicacion"
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label htmlFor="form-tipo" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Tipo</label>
                  <select
                    id="form-tipo"
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="general">📢 General</option>
                    <option value="donacion">🎁 Donación</option>
                    <option value="taller">🛠️ Taller</option>
                    <option value="capacitacion">📚 Capacitación</option>
                    <option value="recogida">📦 Recogida</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="form-capacidad" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                    Capacidad Máxima
                  </label>
                  <input
                    id="form-capacidad"
                    type="number"
                    value={formData.capacidad_maxima}
                    onChange={(e) => setFormData({ ...formData, capacidad_maxima: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="form-imagen" className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">URL de Imagen</label>
                <input
                  id="form-imagen"
                  type="url"
                  value={formData.imagen_url}
                  onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    message.type === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex gap-2 sm:gap-4 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-slate-700 hover:bg-slate-600 rounded-lg text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all"
                >
                  {selectedEvento ? 'Actualizar' : 'Crear'} Evento
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </main>
    </div>
  );
}
