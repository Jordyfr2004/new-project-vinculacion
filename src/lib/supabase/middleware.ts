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

    // Nota: No redirigimos en middleware para evitar bloqueos cuando la sesión
    // solo existe en localStorage (cliente). La protección de rutas se maneja
    // en el cliente con hooks como useProtectedRoute.
    await supabase.auth.getUser();
    return supabaseResponse;
}