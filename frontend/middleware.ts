import { NextResponse, NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userRole: string = "user"; // 👈 Cambia a "admin" para probar el otro flujo

  const url = req.nextUrl.clone();

  // 🔒 Si NO es admin e intenta acceder a /receptores → lo manda a /unauthorized
  if (url.pathname === "/admin" && userRole !== "admin") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // ✅ Si es admin → lo redirige a /admin
  if (url.pathname === "/admin" && userRole === "admin") {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Si no cumple ninguna condición, deja pasar
  return NextResponse.next();
}

// 📍 Aplica solo al path /receptores
export const config = {
  matcher: ["/admin"],
};


