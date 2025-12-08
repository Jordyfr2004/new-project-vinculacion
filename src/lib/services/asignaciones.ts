import { supabase } from '@/lib/supabase/client';
import type { Asignacion, AsignacionDetalle, EstadoAsignacion } from '@/types';

export const asignacionesService = {
  async getAsignaciones(receptorId?: string): Promise<Asignacion[]> {
    let query = supabase
      .from('asignaciones')
      .select(`
        *,
        receptor:users!asignaciones_receptor_id_fkey(*),
        solicitud:solicitudes(*),
        detalles:asignaciones_detalle(
          *,
          producto:productos(*),
          lote:lotes(*)
        )
      `)
      .order('fecha_asignacion', { ascending: false });

    if (receptorId) {
      query = query.eq('receptor_id', receptorId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAsignacion(id: string): Promise<Asignacion | null> {
    const { data, error } = await supabase
      .from('asignaciones')
      .select(`
        *,
        receptor:users!asignaciones_receptor_id_fkey(*),
        solicitud:solicitudes(*),
        detalles:asignaciones_detalle(
          *,
          producto:productos(*),
          lote:lotes(*)
        )
      `)
      .eq('asignacion_id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createAsignacion(
    asignacion: Omit<Asignacion, 'asignacion_id' | 'created_at' | 'updated_at' | 'fecha_asignacion'>,
    detalles: Omit<AsignacionDetalle, 'detalle_id' | 'asignacion_id'>[]
  ): Promise<Asignacion> {
    // Validaciones
    if (!asignacion.solicitud_id) {
      throw new Error('El ID de la solicitud es requerido');
    }

    if (!asignacion.receptor_id) {
      throw new Error('El ID del receptor es requerido');
    }

    if (!detalles || detalles.length === 0) {
      throw new Error('Debes agregar al menos un producto a la asignación');
    }

    // Validar cada detalle
    for (const detalle of detalles) {
      if (!detalle.producto_id) {
        throw new Error('Todos los productos deben estar seleccionados');
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        throw new Error('Todas las cantidades deben ser mayores a 0');
      }
      if (!detalle.unidad_medida) {
        throw new Error('Todas las unidades de medida deben estar especificadas');
      }
    }

    // Crear la asignación
    const { data: asignacionData, error: asignacionError } = await supabase
      .from('asignaciones')
      .insert([asignacion])
      .select()
      .maybeSingle();
    
    if (asignacionError) throw asignacionError;
    if (!asignacionData) throw new Error('No se pudo crear la asignación');

    // Crear los detalles
    const detallesData = detalles.map(detalle => ({
      ...detalle,
      asignacion_id: asignacionData.asignacion_id,
    }));

    const { error: detallesError } = await supabase
      .from('asignaciones_detalle')
      .insert(detallesData);
    
    if (detallesError) throw detallesError;

    // Actualizar estado de lotes si se especificó lote_id
    for (const detalle of detalles) {
      if (detalle.lote_id) {
        await supabase
          .from('lotes')
          .update({ estado: 'asignado' })
          .eq('lote_id', detalle.lote_id);
      }
    }

    // Actualizar cantidad_asignada en solicitudes_detalle y reducir stock
    for (const detalle of detalles) {
      // Actualizar cantidad_asignada en solicitudes_detalle
      const { data: solicitudDetalle } = await supabase
        .from('solicitudes_detalle')
        .select('cantidad_asignada')
        .eq('solicitud_id', asignacion.solicitud_id)
        .eq('producto_id', detalle.producto_id)
        .maybeSingle();

      if (solicitudDetalle) {
        const nuevaCantidadAsignada = (solicitudDetalle.cantidad_asignada || 0) + detalle.cantidad;
        await supabase
          .from('solicitudes_detalle')
          .update({ cantidad_asignada: nuevaCantidadAsignada })
          .eq('solicitud_id', asignacion.solicitud_id)
          .eq('producto_id', detalle.producto_id);
      }

      // Reducir stock del producto (solo si hay suficiente stock)
      const { data: producto } = await supabase
        .from('productos')
        .select('stock_actual')
        .eq('producto_id', detalle.producto_id)
        .maybeSingle();

      if (producto) {
        const stockActual = producto.stock_actual || 0;
        if (stockActual < detalle.cantidad) {
          // Si no hay suficiente stock, asignar solo lo disponible
          const cantidadAAsignar = stockActual;
          const nuevoStock = 0;
          
          // Actualizar la cantidad en la asignación si es necesario
          if (cantidadAAsignar < detalle.cantidad) {
            await supabase
              .from('asignaciones_detalle')
              .update({ cantidad: cantidadAAsignar })
              .eq('asignacion_id', asignacionData.asignacion_id)
              .eq('producto_id', detalle.producto_id);
          }
          
          await supabase
            .from('productos')
            .update({ stock_actual: nuevoStock })
            .eq('producto_id', detalle.producto_id);
        } else {
          // Hay suficiente stock, reducir normalmente
          const nuevoStock = stockActual - detalle.cantidad;
          await supabase
            .from('productos')
            .update({ stock_actual: nuevoStock })
            .eq('producto_id', detalle.producto_id);
        }
      } else {
        throw new Error(`Producto con ID ${detalle.producto_id} no encontrado`);
      }
    }

    // Retornar la asignación completa
    return this.getAsignacion(asignacionData.asignacion_id) as Promise<Asignacion>;
  },

  async updateAsignacion(id: string, updates: Partial<Asignacion>): Promise<Asignacion> {
    const { data, error } = await supabase
      .from('asignaciones')
      .update(updates)
      .eq('asignacion_id', id)
      .select(`
        *,
        receptor:users!asignaciones_receptor_id_fkey(*),
        solicitud:solicitudes(*),
        detalles:asignaciones_detalle(
          *,
          producto:productos(*),
          lote:lotes(*)
        )
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo actualizar la asignación');
    return data;
  },

  async updateEstadoAsignacion(id: string, estado: EstadoAsignacion): Promise<Asignacion> {
    return this.updateAsignacion(id, { estado });
  },

  async getAsignacionesPorEstado(estado: EstadoAsignacion): Promise<Asignacion[]> {
    const { data, error } = await supabase
      .from('asignaciones')
      .select(`
        *,
        receptor:users!asignaciones_receptor_id_fkey(*),
        solicitud:solicitudes(*),
        detalles:asignaciones_detalle(
          *,
          producto:productos(*),
          lote:lotes(*)
        )
      `)
      .eq('estado', estado)
      .order('fecha_asignacion', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
