'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para obtener el rol del usuario autenticado desde la tabla "users".
 * Retorna el rol actual ('admin', 'donante', 'receptor') y el estado de carga.
 */
export function useUserRole() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('rol')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !userData) {
        setRole(null);
      } else {
        setRole(userData.rol);
      }

      setLoading(false);
    };

    fetchRole();
  }, []);

  return { role, loading };
}
