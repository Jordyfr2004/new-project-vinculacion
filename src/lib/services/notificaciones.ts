import { supabase } from '@/lib/supabase/client';
import { Notificacion, TipoNotificacion, PrioridadNotificacion } from '@/types';

export const notificacionesService = {
  // GET: Obtener notificaciones del usuario actual
  async getNotificacionesUsuario(usuarioId: string, soloNoLeidas: boolean = false): Promise<Notificacion[]> {
    try {
      let query = supabase
        .from('notificaciones')
        .select(
          `
          notificacion_id,
          usuario_id,
          tipo,
          titulo,
          descripcion,
          accion_url,
          leida,
          prioridad,
          fecha_creacion,
          fecha_lectura,
          created_at,
          updated_at
        `
        )
        .eq('usuario_id', usuarioId);

      if (soloNoLeidas) {
        query = query.eq('leida', false);
      }

      query = query.order('fecha_creacion', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching notificaciones:', error);
      throw error;
    }
  },

  // GET: Contar notificaciones no leídas
  async countNotificacionesNoLeidas(usuarioId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notificaciones')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', usuarioId)
        .eq('leida', false);

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error counting notificaciones:', error);
      return 0;
    }
  },

  // POST: Crear notificación (llamado por API o triggers)
  async createNotificacion(notificacion: Omit<Notificacion, 'notificacion_id' | 'created_at' | 'updated_at'>): Promise<Notificacion> {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .insert([
          {
            ...notificacion,
            leida: notificacion.leida ?? false,
            prioridad: notificacion.prioridad ?? 'normal',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error creating notificacion:', error);
      throw error;
    }
  },

  // PATCH: Marcar notificación como leída
  async marcarComoLeida(notificacionId: string): Promise<Notificacion> {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .update({
          leida: true,
          fecha_lectura: new Date().toISOString(),
        })
        .eq('notificacion_id', notificacionId)
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error marking notificacion as leida:', error);
      throw error;
    }
  },

  // PATCH: Marcar todas las notificaciones como leídas
  async marcarTodasComoLeidas(usuarioId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({
          leida: true,
          fecha_lectura: new Date().toISOString(),
        })
        .eq('usuario_id', usuarioId)
        .eq('leida', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notificaciones as leidas:', error);
      throw error;
    }
  },

  // DELETE: Eliminar notificación
  async deleteNotificacion(notificacionId: string): Promise<void> {
    try {
      // Obtener sesión actual para verificar autenticación
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No hay sesión activa');
      }

      // Usar API para eliminar (evita problemas con RLS)
      const response = await fetch(`/api/notificaciones/${notificacionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar notificación');
      }
    } catch (error) {
      console.error('Error deleting notificacion:', error);
      throw error;
    }
  },

  // DELETE: Eliminar todas las notificaciones de un usuario
  async deleteTodasNotificaciones(usuarioId: string): Promise<void> {
    try {
      const { error } = await supabase.from('notificaciones').delete().eq('usuario_id', usuarioId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting all notificaciones:', error);
      throw error;
    }
  },

  // GET: Obtener notificaciones por tipo
  async getNotificacionesPorTipo(usuarioId: string, tipo: TipoNotificacion): Promise<Notificacion[]> {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('usuario_id', usuarioId)
        .eq('tipo', tipo)
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching notificaciones por tipo:', error);
      throw error;
    }
  },

  // POST: Crear notificación masiva para múltiples usuarios (admin only)
  async crearNotificacionMasiva(
    usuarioIds: string[],
    notificacion: Omit<Notificacion, 'notificacion_id' | 'usuario_id' | 'created_at' | 'updated_at'>
  ): Promise<Notificacion[]> {
    try {
      const notificaciones = usuarioIds.map((userId) => ({
        ...notificacion,
        usuario_id: userId,
        leida: false,
      }));

      const { data, error } = await supabase
        .from('notificaciones')
        .insert(notificaciones)
        .select();

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error creating notificacion masiva:', error);
      throw error;
    }
  },
};
