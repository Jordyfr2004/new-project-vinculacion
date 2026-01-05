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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: notificacionId } = await params;

    // Verificar que la notificación pertenece al usuario
    const { data: notificacion } = await supabase
      .from('notificaciones')
      .select('usuario_id')
      .eq('notificacion_id', notificacionId)
      .single();

    if (!notificacion || notificacion.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Marcar como leída
    const { data: updated, error } = await supabase
      .from('notificaciones')
      .update({
        leida: true,
        fecha_lectura: new Date().toISOString(),
      })
      .eq('notificacion_id', notificacionId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error('Error updating notificacion:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id: notificacionId } = await params;

    // Usar service role para verificar y eliminar (evita problemas con RLS)
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll(cookiesToSet) {
            // No need to set cookies for API routes
          },
        },
      }
    );

    // Verificar que la notificación pertenece al usuario
    const { data: notificacion, error: fetchError } = await supabaseAdmin
      .from('notificaciones')
      .select('usuario_id')
      .eq('notificacion_id', notificacionId)
      .single();

    if (fetchError || !notificacion) {
      return NextResponse.json({ error: 'Notificación no encontrada' }, { status: 404 });
    }

    if (notificacion.usuario_id !== user.id) {
      return NextResponse.json({ error: 'No autorizado para eliminar esta notificación' }, { status: 403 });
    }

    // Eliminar notificación
    const { error } = await supabaseAdmin
      .from('notificaciones')
      .delete()
      .eq('notificacion_id', notificacionId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting notificacion:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
