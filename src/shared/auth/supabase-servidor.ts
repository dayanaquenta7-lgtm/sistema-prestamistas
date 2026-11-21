import "server-only"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { env } from "@/shared/env"

/** Cliente de Supabase para Server Components, Server Actions y Route Handlers. Uno por solicitud. */
export async function crearClienteSupabase() {
  const almacenCookies = await cookies()
  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY } = env()

  return createServerClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll() {
        return almacenCookies.getAll()
      },
      setAll(cookiesPorGuardar) {
        try {
          for (const { name, value, options } of cookiesPorGuardar) {
            almacenCookies.set(name, value, options)
          }
        } catch {
          // Los Server Components no pueden escribir cookies; el proxy renueva la sesión.
        }
      },
    },
  })
}
