import { supabase } from '../supabase/client';
import type { User } from '@/types';

export const usuariosService = {
  /**
   * Obtener todos los usuarios del sistema
   */
  async getUsuarios(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Actualizar el rol de un usuario
   */
  async actualizarRolUsuario(userId: string, nuevoRol: 'admin' | 'donante' | 'receptor'): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        rol: nuevoRol,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Activar/desactivar un usuario
   */
  async toggleEstadoUsuario(userId: string, activo: boolean): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        activo,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Obtener un usuario por ID
   */
  async getUsuarioPorId(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Eliminar un usuario (soft delete)
   */
  async eliminarUsuario(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        deleted_at: new Date().toISOString(),
        activo: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) throw error;
  }
};
