import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// Función para calcular el estado automático basado en fechas
function calcularEstadoAutomatico(evento: any): string {
  // Si está cancelado, mantenerlo cancelado
  if (evento.estado === 'cancelado') {
    return 'cancelado';
  }

  const ahora = new Date();
  const fechaInicio = new Date(evento.fecha_evento_inicio);
  const fechaFin = evento.fecha_evento_fin ? new Date(evento.fecha_evento_fin) : null;

  // Si ya terminó el evento
  if (fechaFin && ahora > fechaFin) {
    return 'completado';
  }

  // Si el evento ya comenzó pero no ha terminado
  if (ahora >= fechaInicio) {
    return 'activo';
  }

  // Si aún no ha comenzado
  return 'planificado';
}

export async function GET(request: NextRequest) {
  try {
    const allCookies = request.cookies.getAll();

    // Intentar obtener token del header Authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return allCookies;
          },
          setAll(cookiesToSet) {
            // No need to set cookies for API routes
          },
        },
      }
    );

    // Obtener usuario autenticado
    let user = null;
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      user = session.user;
    } else if (token) {
      // Si no hay sesión pero hay token, intentar obtener usuario vía token
      const { data: { user: tokenUser }, error: tokenError } = await supabase.auth.getUser(token);
      if (tokenUser && !tokenError) {
        user = tokenUser;
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'No autorizado - No hay sesión activa' }, { status: 401 });
    }

    // Obtener rol del usuario
    const { data: userData } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (!userData) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener parámetros de filtro
    const estado = request.nextUrl.searchParams.get('estado');
    const tipo = request.nextUrl.searchParams.get('tipo');

    let query = supabase.from('eventos').select(`
      evento_id,
      titulo,
      descripcion,
      fecha_evento_inicio,
      fecha_evento_fin,
      fecha_mostrar_desde,
      fecha_mostrar_hasta,
      ubicacion,
      tipo,
      estado,
      imagen_url,
      es_publico,
      dirigido_a,
      capacidad_maxima,
      created_by,
      created_at,
      updated_at
    `);

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    const { data: eventos, error } = await query.order('fecha_evento_inicio', {
      ascending: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Crear cliente con service role para actualizar estados
    const supabaseAdmin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return [];
          },
          setAll() {},
        },
      }
    );

    // Actualizar estados automáticamente y obtener conteo de asistentes
    const eventosActualizados = await Promise.all(
      (eventos || []).map(async (evento: any) => {
        const estadoCalculado = calcularEstadoAutomatico(evento);
        
        // Si el estado cambió, actualizarlo en la BD
        if (estadoCalculado !== evento.estado) {
          await supabaseAdmin
            .from('eventos')
            .update({ estado: estadoCalculado })
            .eq('evento_id', evento.evento_id);
          
          evento.estado = estadoCalculado;
        }

        // Obtener conteo de asistentes
        const { count } = await supabase
          .from('evento_asistencia')
          .select('*', { count: 'exact', head: true })
          .eq('evento_id', evento.evento_id)
          .eq('confirmado', true);
        
        return {
          ...evento,
          asistentes_count: count || 0
        };
      })
    );

    // Filtrar eventos que el usuario puede ver
    const eventosFiltered = eventosActualizados.filter((evento: any) => {
      // Admin puede ver todos
      if (userData.rol === 'admin') return true;
      
      if (evento.es_publico) return true;
      // Si el evento está dirigido al rol del usuario
      const dirigidoA = Array.isArray(evento.dirigido_a) ? evento.dirigido_a : (evento.dirigido_a || []);
      return dirigidoA.includes(userData.rol);
    });

    return NextResponse.json(eventosFiltered, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching eventos:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

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
    let user = null;
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      user = session.user;
    } else if (token) {
      const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
      if (tokenUser) {
        user = tokenUser;
      }
    }

    if (!user) {
      console.error('POST /api/eventos - No session or token');
      return NextResponse.json({ error: 'No autorizado - No hay sesión activa' }, { status: 401 });
    }

    // Verificar que sea admin
    const { data: userData, error: userCheckError } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .single();

    if (userCheckError || !userData) {
      console.error('User fetch error:', userCheckError);
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    if (userData.rol !== 'admin') {
      console.error('User is not admin:', userData.rol);
      return NextResponse.json({ error: `Solo admin puede crear eventos. Tu rol es: ${userData.rol}` }, { status: 403 });
    }

    const body = await request.json();
    const { 
      titulo, 
      descripcion, 
      fecha_evento_inicio, 
      fecha_evento_fin, 
      fecha_mostrar_desde,
      fecha_mostrar_hasta,
      ubicacion, 
      tipo, 
      dirigido_a, 
      capacidad_maxima, 
      imagen_url 
    } = body;

    // Validaciones
    if (!titulo || titulo.trim().length < 5) {
      return NextResponse.json({ error: 'El título debe tener al menos 5 caracteres' }, { status: 400 });
    }

    if (!descripcion || descripcion.trim().length < 10) {
      return NextResponse.json({ error: 'La descripción debe tener al menos 10 caracteres' }, { status: 400 });
    }

    if (!ubicacion || ubicacion.trim().length === 0) {
      return NextResponse.json({ error: 'La ubicación es requerida' }, { status: 400 });
    }

    if (!fecha_evento_inicio) {
      return NextResponse.json({ error: 'La fecha de inicio del evento es requerida' }, { status: 400 });
    }

    if (fecha_evento_fin && new Date(fecha_evento_fin) <= new Date(fecha_evento_inicio)) {
      return NextResponse.json({ error: 'La fecha de fin debe ser posterior a la fecha de inicio' }, { status: 400 });
    }

    // Crear evento usando service role para saltarse RLS
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
      .insert([
        {
          titulo: titulo.trim(),
          descripcion: descripcion.trim(),
          fecha_evento_inicio,
          fecha_evento_fin: fecha_evento_fin || null,
          fecha_mostrar_desde,
          fecha_mostrar_hasta: fecha_mostrar_hasta || null,
          ubicacion: ubicacion.trim(),
          tipo: tipo || 'general',
          dirigido_a: dirigido_a || ['donante', 'receptor'],
          capacidad_maxima: capacidad_maxima || null,
          imagen_url: imagen_url || null,
          es_publico: true,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating evento:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(evento, { status: 201 });
  } catch (error: any) {
    console.error('Error creating evento:', error);
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 });
  }
}
