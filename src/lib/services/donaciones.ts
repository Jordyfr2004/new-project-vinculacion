import { supabase } from '@/lib/supabase/client';
import type { Donacion, DonacionDetalle, EstadoDonacion } from '@/types';

export const donacionesService = {
  async getDonaciones(donanteId?: string): Promise<Donacion[]> {
    let query = supabase
      .from('donaciones')
      .select(`
        *,
        donante:users!donaciones_donante_id_fkey(*),
        detalles:donaciones_detalle(
          *,
          producto:productos(*)
        )
      `)
      .order('fecha_donacion', { ascending: false });

    if (donanteId) {
      query = query.eq('donante_id', donanteId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getDonacion(id: string): Promise<Donacion | null> {
    const { data, error } = await supabase
      .from('donaciones')
      .select(`
        *,
        donante:users!donaciones_donante_id_fkey(*),
        detalles:donaciones_detalle(
          *,
          producto:productos(*)
        )
      `)
      .eq('donacion_id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createDonacion(
    donacion: Omit<Donacion, 'donacion_id' | 'created_at' | 'updated_at' | 'fecha_donacion'>,
    detalles: Omit<DonacionDetalle, 'detalle_id' | 'donacion_id'>[]
  ): Promise<Donacion> {
    // Validaciones
    if (!donacion.donante_id) {
      throw new Error('El ID del donante es requerido');
    }

    // Verificar que el donante existe y tiene rol correcto
    const { data: donanteExists, error: donanteError } = await supabase
      .from('users')
      .select('id, rol')
      .eq('id', donacion.donante_id)
      .eq('rol', 'donante')
      .maybeSingle();

    if (donanteError) {
      throw new Error(`Error al verificar el donante: ${donanteError.message}`);
    }

    if (!donanteExists) {
      throw new Error('El donante no existe en el sistema o no tiene el rol correcto. Por favor, contacta al administrador.');
    }

    if (!detalles || detalles.length === 0) {
      throw new Error('Debes agregar al menos un producto a la donación');
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

    // Crear la donación
    const { data: donacionData, error: donacionError } = await supabase
      .from('donaciones')
      .insert([donacion])
      .select()
      .maybeSingle();
    
    if (donacionError) throw donacionError;
    if (!donacionData) throw new Error('No se pudo crear la donación');

    // Crear los detalles
    const detallesData = detalles.map(detalle => ({
      ...detalle,
      donacion_id: donacionData.donacion_id,
    }));

    const { error: detallesError } = await supabase
      .from('donaciones_detalle')
      .insert(detallesData);
    
    if (detallesError) throw detallesError;

    // Retornar la donación completa
    return this.getDonacion(donacionData.donacion_id) as Promise<Donacion>;
  },

  async updateDonacion(id: string, updates: Partial<Donacion>): Promise<Donacion> {
    const { data, error } = await supabase
      .from('donaciones')
      .update(updates)
      .eq('donacion_id', id)
      .select(`
        *,
        donante:users!donaciones_donante_id_fkey(*),
        detalles:donaciones_detalle(
          *,
          producto:productos(*)
        )
      `)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('No se pudo actualizar la donación');
    return data;
  },

  async updateEstadoDonacion(id: string, estado: EstadoDonacion): Promise<Donacion> {
    const donacion = await this.getDonacion(id);
    if (!donacion) {
      throw new Error('Donación no encontrada');
    }

    // Si se está procesando, crear lotes para cada producto
    if (estado === 'procesada' && donacion.estado !== 'procesada') {
      // Los lotes se crearán automáticamente o manualmente
      // Por ahora, el trigger actualiza el stock
      // En el futuro se pueden crear lotes aquí si es necesario
    }

    return this.updateDonacion(id, { estado });
  },

  async getDonacionesPorEstado(estado: EstadoDonacion): Promise<Donacion[]> {
    const { data, error } = await supabase
      .from('donaciones')
      .select(`
        *,
        donante:users!donaciones_donante_id_fkey(*),
        detalles:donaciones_detalle(
          *,
          producto:productos(*)
        )
      `)
      .eq('estado', estado)
      .order('fecha_donacion', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },
};
