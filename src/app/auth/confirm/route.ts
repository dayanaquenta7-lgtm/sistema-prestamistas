import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { motivoFalloConfirmacion } from "@/shared/auth/confirmacion"
import { RUTA_LOGIN, destinoConfirmacion } from "@/shared/auth/rutas"
import { crearClienteSupabase } from "@/shared/auth/supabase-servidor"

const TIPOS_PERMITIDOS: readonly EmailOtpType[] = ["signup", "email", "recovery"]

/**
 * Plantillas por defecto de Supabase: flujo PKCE con "code". Con SMTP propio y plantillas
 * personalizadas: enlace con token_hash (ver docs/pendientes.md, Sprint 5).
 * Devuelve el código de error de Supabase, "sin_parametros" o null si se creó la sesión.
 */
async function canjearEnlace(parametros: URLSearchParams): Promise<string | null> {
  const codigo = parametros.get("code")
  const tokenHash = parametros.get("token_hash")
  const tipo = TIPOS_PERMITIDOS.find((permitido) => permitido === parametros.get("type"))

  if (!codigo && !(tokenHash && tipo)) return "sin_parametros"

  const supabase = await crearClienteSupabase()
  const { error } = codigo
    ? await supabase.auth.exchangeCodeForSession(codigo)
    : await supabase.auth.verifyOtp({ type: tipo as EmailOtpType, token_hash: tokenHash as string })
  return error ? (error.code ?? "desconocido") : null
}

// Excepción documentada en CLAUDE.md (sección 3): canjea el enlace del correo por una sesión
// y establece la cookie. Sin lógica de negocio ni escrituras en la BD.
export async function GET(solicitud: NextRequest) {
  const { searchParams } = solicitud.nextUrl
  const destino = destinoConfirmacion(searchParams.get("next"))

  const codigoError = await canjearEnlace(searchParams)
  if (codigoError === null) {
    return NextResponse.redirect(new URL(destino, solicitud.url))
  }

  const login = new URL(RUTA_LOGIN, solicitud.url)
  login.searchParams.set("error", motivoFalloConfirmacion(codigoError, destino))
  return NextResponse.redirect(login)
}
