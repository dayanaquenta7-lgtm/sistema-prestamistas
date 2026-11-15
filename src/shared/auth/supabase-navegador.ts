import { createBrowserClient } from "@supabase/ssr"

/** Cliente de Supabase para Client Components (por ejemplo, subir archivos a Storage). */
export function crearClienteSupabaseNavegador() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !clave) {
    throw new Error("Faltan las variables públicas de Supabase")
  }
  return createBrowserClient(url, clave)
}
