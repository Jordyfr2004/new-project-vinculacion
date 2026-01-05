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

export async function GET(
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

    const { id: eventoId } = await params;

    const { data: evento, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('evento_id', eventoId)
      .single();

    if (error || !evento) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    return NextResponse.json(evento, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching evento:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
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

    // Verificar que sea admin
    const { data: userData } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!userData || userData.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede actualizar eventos' }, { status: 403 });
    }

    const { id: eventoId } = await params;
    const body = await request.json();

    // Validar estado si se proporciona
    const estadosValidos = ['planificado', 'activo', 'completado', 'cancelado'];
    if (body.estado && !estadosValidos.includes(body.estado)) {
      return NextResponse.json({ 
        error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
      }, { status: 400 });
    }

    // Validar tipo si se proporciona
    const tiposValidos = ['donacion', 'taller', 'capacitacion', 'recogida', 'general'];
    if (body.tipo && !tiposValidos.includes(body.tipo)) {
      return NextResponse.json({ 
        error: `Tipo inválido. Debe ser uno de: ${tiposValidos.join(', ')}` 
      }, { status: 400 });
    }

    // Usar service role para saltarse RLS
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

    const { data: evento, error } = await supabaseAdmin
      .from('eventos')
      .update(body)
      .eq('evento_id', eventoId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(evento, { status: 200 });
  } catch (error: any) {
    console.error('Error updating evento:', error);
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

    // Verificar que sea admin
    const { data: userData } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!userData || userData.rol !== 'admin') {
      return NextResponse.json({ error: 'Solo admin puede eliminar eventos' }, { status: 403 });
    }

    const { id: eventoId } = await params;

    // Usar service role para saltarse RLS
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

    const { error } = await supabaseAdmin.from('eventos').delete().eq('evento_id', eventoId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting evento:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
