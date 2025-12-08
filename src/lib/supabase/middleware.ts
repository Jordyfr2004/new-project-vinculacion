import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";



export async function updateSession(request: NextRequest){
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet){
                    for (const { name, value} of cookiesToSet){
                        request.cookies.set(name, value);
                    }
                    supabaseResponse = NextResponse.next({ request});
                    for (const { name, value, options} of cookiesToSet){
                        supabaseResponse.cookies.set(name, value, options);
                    }
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Proteger rutas de admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        // Verificar rol de admin
        const { data: userData } = await supabase
            .from('users')
            .select('rol')
            .eq('id', user.id)
            .maybeSingle();

        if (!userData || userData.rol !== 'admin') {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    // Proteger rutas de donante
    if (request.nextUrl.pathname.startsWith('/donantes')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        const { data: userData } = await supabase
            .from('users')
            .select('rol')
            .eq('id', user.id)
            .maybeSingle();

        if (!userData || userData.rol !== 'donante') {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    // Proteger rutas de receptor
    if (request.nextUrl.pathname.startsWith('/receptores')) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }

        const { data: userData } = await supabase
            .from('users')
            .select('rol')
            .eq('id', user.id)
            .maybeSingle();

        if (!userData || userData.rol !== 'receptor') {
            const url = request.nextUrl.clone();
            url.pathname = '/';
            return NextResponse.redirect(url);
        }
    }

    return supabaseResponse;
}