import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Helper para obtener usuario desde sesión o token
async function getAuthUser(request: NextRequest, supabase: any) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    return session.user;
  } else if (token) {
    const { data: { user } } = await supabase.auth.getUser(token);
    return user;
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            // No need to set cookies for API routes
          },
        },
      }
    );

    // Obtener usuario autenticado
    const user = await getAuthUser(request, supabase);

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetro para filtrar solo no leídas
    const soloNoLeidas = request.nextUrl.searchParams.get('noLeidas') === 'true';

    // Obtener notificaciones del usuario
    let query = supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', user.id);

    if (soloNoLeidas) {
      query = query.eq('leida', false);
    }

    const { data: notificaciones, error } = await query.order('fecha_creacion', {
      ascending: false,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(notificaciones, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching notificaciones:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
