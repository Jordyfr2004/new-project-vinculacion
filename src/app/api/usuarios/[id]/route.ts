import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Obtener el token del usuario autenticado
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Crear cliente de Supabase con service_role para operaciones admin
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { id: userId } = await params;

    // Eliminar de auth.users (si existe)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    // Ignorar error si el usuario no existe en auth
    if (authError && authError.status !== 404) {
      console.error('Error eliminando de auth:', authError);
      throw authError;
    }

    // Eliminar de la tabla users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (dbError) {
      console.error('Error eliminando de users:', dbError);
      throw dbError;
    }

    return NextResponse.json({ 
      message: 'Usuario eliminado correctamente' 
    });

  } catch (error: any) {
    console.error('Error en DELETE usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
