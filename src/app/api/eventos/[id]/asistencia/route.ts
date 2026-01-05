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

export async function POST(
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

    const { id: eventoId } = await params;

    // Confirmar asistencia (upsert para evitar duplicados)
    const { data: asistencia, error } = await supabase
      .from('evento_asistencia')
      .upsert(
        [
          {
            evento_id: eventoId,
            usuario_id: user.id,
            confirmado: true,
            fecha_confirmacion: new Date().toISOString(),
          },
        ],
        { onConflict: 'evento_id,usuario_id' }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(asistencia, { status: 201 });
  } catch (error: any) {
    console.error('Error confirming asistencia:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
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

    // Obtener asistentes del evento
    const { data: asistentes, error } = await supabase
      .from('evento_asistencia')
      .select(
        `
        asistencia_id,
        evento_id,
        usuario_id,
        users!usuario_id(id, nombres, apellidos, email),
        confirmado,
        fecha_confirmacion,
        asistio,
        created_at,
        updated_at
      `
      )
      .eq('evento_id', eventoId)
      .eq('confirmado', true)
      .order('fecha_confirmacion', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(asistentes || [], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching asistentes:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
