import { supabase } from '@/lib/supabase/client';
import { Evento, EventoAsistencia, TipoEvento, EstadoEvento } from '@/types';

/**
 * Validaciones de eventos
 */
const validations = {
  titulo: (titulo: string) => {
    if (!titulo?.trim() || titulo.trim().length < 5) return 'El título debe tener al menos 5 caracteres';
    if (titulo.length > 100) return 'El título no puede exceder 100 caracteres';
    return null;
  },
  descripcion: (descripcion: string) => {
    if (!descripcion?.trim() || descripcion.trim().length < 10) return 'La descripción debe tener al menos 10 caracteres';
    if (descripcion.length > 1000) return 'La descripción no puede exceder 1000 caracteres';
    return null;
  },
  ubicacion: (ubicacion: string) => {
    if (!ubicacion?.trim()) return 'La ubicación es requerida';
    if (ubicacion.length > 255) return 'La ubicación no puede exceder 255 caracteres';
    return null;
  },
  fechas: (fechaInicio: string, fechaFin?: string) => {
    if (!fechaInicio) return 'La fecha de inicio es requerida';
    const inicio = new Date(fechaInicio);
    if (isNaN(inicio.getTime())) return 'La fecha de inicio es inválida';
    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (isNaN(fin.getTime())) return 'La fecha de fin es inválida';
      if (fin <= inicio) return 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
    return null;
  },
};

export const eventosService = {
  /**
   * Obtener todos los eventos con filtros
   */
  async getEventos(filtros?: {
    estado?: EstadoEvento;
    tipo?: TipoEvento;
  }): Promise<Evento[]> {
    try {
      let query = supabase
        .from('eventos')
        .select(`
          evento_id,
          titulo,
          descripcion,
          fecha_evento_inicio,
          fecha_evento_fin,
          fecha_mostrar_desde,
          fecha_mostrar_hasta,
          ubicacion,
          tipo,
          estado,
          imagen_url,
          es_publico,
          dirigido_a,
          capacidad_maxima,
          created_by,
          created_at,
          updated_at,
          fecha_inicio,
          fecha_fin
        `);

      if (filtros?.estado) query = query.eq('estado', filtros.estado);
      if (filtros?.tipo) query = query.eq('tipo', filtros.tipo);

      query = query.order('fecha_evento_inicio', { ascending: true });

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching eventos:', error);
      throw error;
    }
  },

  /**
   * Obtener evento por ID
   */
  async getEventoDetail(eventoId: string): Promise<Evento | null> {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          evento_id,
          titulo,
          descripcion,
          fecha_evento_inicio,
          fecha_evento_fin,
          fecha_mostrar_desde,
          fecha_mostrar_hasta,
          ubicacion,
          tipo,
          estado,
          imagen_url,
          es_publico,
          dirigido_a,
          capacidad_maxima,
          created_by,
          created_at,
          updated_at,
          fecha_inicio,
          fecha_fin
        `)
        .eq('evento_id', eventoId)
        .maybeSingle();

      if (error) throw error;
      return data || null;
    } catch (error) {
      console.error('Error fetching evento detail:', error);
      throw error;
    }
  },

  /**
   * Obtener eventos para un usuario basado en su rol y dirigido_a
   */
  async getEventosParaUsuario(rolUsuario: string): Promise<Evento[]> {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          evento_id,
          titulo,
          descripcion,
          fecha_evento_inicio,
          fecha_evento_fin,
          fecha_mostrar_desde,
          fecha_mostrar_hasta,
          ubicacion,
          tipo,
          estado,
          imagen_url,
          es_publico,
          dirigido_a,
          capacidad_maxima,
          created_by,
          created_at,
          updated_at,
          fecha_inicio,
          fecha_fin
        `)
        .order('fecha_evento_inicio', { ascending: true });

      if (error) throw error;

      // Filtrar en memoria basado en accesibilidad
      return (data || []).filter(evento => {
        if (evento.es_publico) return true;
        const dirigidoA = Array.isArray(evento.dirigido_a) 
          ? evento.dirigido_a 
          : JSON.parse(evento.dirigido_a || '[]');
        return dirigidoA.includes(rolUsuario);
      });
    } catch (error) {
      console.error('Error fetching eventos para usuario:', error);
      throw error;
    }
  },

  /**
   * Crear evento (solo admin)
   */
  async createEvento(evento: Omit<Evento, 'evento_id' | 'created_at' | 'updated_at'>): Promise<Evento> {
    try {
      // Validaciones
      const errors = [
        validations.titulo(evento.titulo),
        validations.descripcion(evento.descripcion),
        validations.ubicacion(evento.ubicacion),
        validations.fechas(evento.fecha_evento_inicio, evento.fecha_evento_fin),
      ].filter(Boolean);

      if (errors.length > 0) {
        throw new Error(errors[0] ?? 'Datos inválidos');
      }

      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating evento:', error);
      throw error;
    }
  },

  /**
   * Actualizar evento
   */
  async updateEvento(
    eventoId: string,
    updates: Partial<Omit<Evento, 'evento_id' | 'created_by' | 'created_at'>>
  ): Promise<Evento> {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('evento_id', eventoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating evento:', error);
      throw error;
    }
  },

  /**
   * Eliminar evento
   */
  async deleteEvento(eventoId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('evento_id', eventoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting evento:', error);
      throw error;
    }
  },

  /**
   * Confirmar asistencia a evento
   */
  async confirmarAsistencia(eventoId: string, usuarioId: string): Promise<EventoAsistencia> {
    try {
      const { data, error } = await supabase
        .from('evento_asistencia')
        .upsert([
          {
            evento_id: eventoId,
            usuario_id: usuarioId,
            confirmado: true,
            fecha_confirmacion: new Date().toISOString(),
          },
        ], { onConflict: 'evento_id,usuario_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error confirming asistencia:', error);
      throw error;
    }
  },

  /**
   * Verificar si usuario confirmó asistencia
   */
  async usuarioConfirmoAsistencia(eventoId: string, usuarioId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('evento_asistencia')
        .select('confirmado')
        .eq('evento_id', eventoId)
        .eq('usuario_id', usuarioId)
        .maybeSingle();

      if (error) throw error;
      return data?.confirmado ?? false;
    } catch (error) {
      console.error('Error verificando confirmación:', error);
      return false;
    }
  },
};
