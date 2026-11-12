import type { NextRequest } from "next/server"
import { actualizarSesion } from "@/shared/auth/supabase-proxy"

export async function proxy(solicitud: NextRequest) {
  return actualizarSesion(solicitud)
}

export const config = {
  matcher: [
    // Todo excepto archivos estáticos e imágenes.
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
}
