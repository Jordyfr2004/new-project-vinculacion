'use client';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';

/**
 * Hook para proteger rutas privadas.
 * Redirige al inicio si no hay sesión activa o si el rol no tiene permiso.
 *
 * @returns {boolean} loading - Indica si aún se está verificando la sesión.
 */
export function useProtectedRoute() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión actual al cargar
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/'); // 🔒 No hay sesión → redirige
        return;
      }

      // ✅ Aquí session existe, por lo tanto:
      const userId = session.user.id;

      // Verificar el rol del usuario
      const { data: userData, error } = await supabase
        .from('users')
        .select('rol')
        .eq('id', userId)
        .maybeSingle();

      if (error || !userData) {
        router.push('/');
        return;
      }

      const userRole = userData.rol;

      // Autorización por ruta
      if (pathname.startsWith('/admin') && userRole !== 'admin') {
        router.push('/');
        return;
      }

      if (pathname.startsWith('/public') && userRole === 'admin') {
        router.push('/admin');
        return;
      }

      setLoading(false);
    };

    checkSession();

    // Escuchar cambios de sesión (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push('/');
      else checkSession(); // 🔁 Revalida sesión y rol dinámicamente
    });

    // Limpieza del listener al desmontar el componente
    return () => subscription.unsubscribe();

  }, [router, pathname]);

  return loading; // Retorna el estado de carga
}
