// Validaciones de permisos y autorización

import { supabase } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export const checkPermission = async (
  requiredRole: UserRole | UserRole[],
  userId?: string
): Promise<{ allowed: boolean; userRole?: UserRole; error?: string }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { allowed: false, error: 'Usuario no autenticado' };
    }

    if (userId && user.id !== userId) {
      return { allowed: false, error: 'No tienes permiso para acceder a este recurso' };
    }

    const { data: userData, error } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      return { allowed: false, error: 'Error al verificar permisos' };
    }

    if (!userData) {
      return { allowed: false, error: 'Usuario no encontrado' };
    }

    const userRole = userData.rol as UserRole;
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!requiredRoles.includes(userRole)) {
      return { 
        allowed: false, 
        userRole,
        error: `Se requiere rol: ${requiredRoles.join(' o ')}` 
      };
    }

    return { allowed: true, userRole };
  } catch (error: any) {
    return { allowed: false, error: error.message || 'Error al verificar permisos' };
  }
};

export const canEditDonacion = async (donacionId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: userData } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();

  if (!userData) return false;

  // Admin puede editar cualquier donación
  if (userData.rol === 'admin') return true;

  // Donante solo puede editar sus propias donaciones pendientes
  if (userData.rol === 'donante') {
    const { data: donacion } = await supabase
      .from('donaciones')
      .select('donante_id, estado')
      .eq('donacion_id', donacionId)
      .eq('donante_id', user.id)
      .maybeSingle();

    return donacion !== null && donacion.estado === 'pendiente';
  }

  return false;
};

export const canEditSolicitud = async (solicitudId: string): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: userData } = await supabase
    .from('users')
    .select('rol')
    .eq('id', user.id)
    .maybeSingle();

  if (!userData) return false;

  // Admin puede editar cualquier solicitud
  if (userData.rol === 'admin') return true;

  // Receptor solo puede editar sus propias solicitudes pendientes
  if (userData.rol === 'receptor') {
    const { data: solicitud } = await supabase
      .from('solicitudes')
      .select('receptor_id, estado')
      .eq('solicitud_id', solicitudId)
      .eq('receptor_id', user.id)
      .maybeSingle();

    return solicitud !== null && solicitud.estado === 'pendiente';
  }

  return false;
};
