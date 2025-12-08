import { supabase } from '@/lib/supabase/client';
import type { Solicitud, SolicitudDetalle, EstadoSolicitud, PrioridadSolicitud } from '@/types';

export const solicitudesService = {
  async getSolicitudes(receptorId?: string): Promise<Solicitud[]> {
    let query = supabase
      .from('solicitudes')
      .select(`
        *,
        receptor:users!solicitudes_receptor_id_fkey(*),
        detalles:solicitudes_detalle(
          *,
          producto:productos(*)
        )
      `)
      .order('fecha_solicitud', { ascending: false });

    if (receptorId) {
      query = query.eq('receptor_id', receptorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getSolicitud(id: string): Promise<Solicitud | null> {
    const { data, error } = await supabase
      .from('solicitudes')
      .select(`
        *,
        receptor:users!solicitudes_receptor_id_fkey(*),
        detalles:solicitudes_detalle(
          *,
          producto:productos(*)
        )
      `)
      .eq('solicitud_id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createSolicitud(
    solicitud: Omit<Solicitud, 'solicitud_id' | 'created_at' | 'updated_at' | 'fecha_solicitud'>,
    detalles: Omit<SolicitudDetalle, 'detalle_id' | 'solicitud_id' | 'cantidad_asignada'>[]
  ): Promise<Solicitud> {
    // Validaciones
    if (!solicitud.receptor_id) {
      throw new Error('El ID del receptor es requerido');
    }

    // Verificar que el receptor existe y tiene rol correcto
    const { data: receptorExists, error: receptorError } = await supabase
      .from('users')
      .select('id, rol')
      .eq('id', solicitud.receptor_id)
      .eq('rol', 'receptor')
      .maybeSingle();

    if (receptorError) {
      throw new Error(`Error al verificar el receptor: ${receptorError.message}`);
    }

    if (!receptorExists) {
      throw new Error('El receptor no existe en el sistema o no tiene el rol correcto. Por favor, contacta al administrador.');
    }

    // El motivo es opcional en el schema, pero validamos si se proporciona
    if (solicitud.motivo && solicitud.motivo.trim().length > 0 && solicitud.motivo.trim().length < 10) {
      throw new Error('El motivo debe tener al menos 10 caracteres si se proporciona');
    }

    if (!detalles || detalles.length === 0) {
      throw new Error('Debes agregar al menos un producto a la solicitud');
    }

    // Validar cada detalle
    for (const detalle of detalles) {
      if (!detalle.producto_id) {
        throw new Error('Todos los productos deben estar seleccionados');
      }
      if (!detalle.cantidad_solicitada || detalle.cantidad_solicitada <= 0) {
        throw new Error('Todas las cantidades solicitadas deben ser mayores a 0');
      }
      if (!detalle.unidad_medida) {
        throw new Error('Todas las unidades de medida deben estar especificadas');
      }
    }

    // Crear la solicitud
    const { data: solicitudData, error: solicitudError } = await supabase
      .from('solicitudes')
      .insert([solicitud])
      .select()
      .maybeSingle();
    
    if (solicitudError) throw solicitudError;
    if (!solicitudData) throw new Error('No se pudo crear la solicitud');

    // Crear los detalles
    const detallesData = detalles.map(detalle => ({
      ...detalle,
      solicitud_id: solicitudData.solicitud_id,
      cantidad_asignada: 0,
    }));

    const { error: detallesError } = await supabase
      .from('solicitudes_detalle')
      .insert(detallesData);
    
    if (detallesError) throw detallesError;

    // Retornar la solicitud completa
    return this.getSolicitud(solicitudData.solicitud_id) as Promise<Solicitud>;
  },

  async updateSolicitud(id: string, updates: Partial<Solicitud>): Promise<Solicitud> {
    const { data, error } = await supabase
      .from('solicitudes')
      .update(updates)
      .eq('solicitud_id', id)
      .select(`
        *,
        receptor:users!solicitudes_receptor_id_fkey(*),
        detalles:solicitudes_detalle(
          *,
          producto:productos(*)
        )
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo actualizar la solicitud');
    return data;
  },

  async updateEstadoSolicitud(id: string, estado: EstadoSolicitud): Promise<Solicitud> {
    return this.updateSolicitud(id, { estado });
  },

  async getSolicitudesPorEstado(estado: EstadoSolicitud): Promise<Solicitud[]> {
    const { data, error } = await supabase
      .from('solicitudes')
      .select(`
        *,
        receptor:users!solicitudes_receptor_id_fkey(*),
        detalles:solicitudes_detalle(
          *,
          producto:productos(*)
        )
      `)
      .eq('estado', estado)
      .order('prioridad', { ascending: false })
      .order('fecha_solicitud', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },
};
