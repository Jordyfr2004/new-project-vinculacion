import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch (error) {
              // Handle cookie setting errors silently in POST
            }
          },
        },
      }
    );

    const body = await request.json();
    const {
      email,
      password,
      nombres,
      apellidos,
      telefono,
      rol,
      ci,
      tipo_donante,
    } = body;

    // 1. Create auth user
    const { data: authUser, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authUser?.user) {
      return NextResponse.json(
        { error: 'No se pudo obtener el usuario de autenticación' },
        { status: 400 }
      );
    }

    // 2. Create user record in public.users with all required fields
    const newUser: any = {
      id: authUser.user.id,
      email: email.trim().toLowerCase(),
      rol: rol,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      telefono: telefono.replace(/\s/g, ''),
      acepta_terminos: true,
      fecha_aceptacion_terminos: new Date().toISOString(),
      consentimiento_datos: true,
      fecha_consentimiento: new Date().toISOString(),
      activo: true,
    };

    if (rol === 'receptor') {
      newUser.ci = ci.trim();
      newUser.estado_receptor = 'activo';
    } else if (rol === 'donante') {
      newUser.tipo_donante = tipo_donante;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([newUser])
      .select('id')
      .maybeSingle();

    if (userError) {
      // If user creation fails in public.users, we should delete the auth user
      await supabase.auth.admin.deleteUser(authUser.user.id);
      
      if (userError.code === '23505') {
        return NextResponse.json(
          { error: 'Registro duplicado (correo o cédula ya existe)' },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: userError.message || 'Error al crear el registro de usuario' },
        { status: 400 }
      );
    }

    if (!userData) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return NextResponse.json(
        { error: 'No se pudo crear el registro de usuario' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Usuario registrado correctamente',
        user: {
          id: authUser.user.id,
          email: email,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
