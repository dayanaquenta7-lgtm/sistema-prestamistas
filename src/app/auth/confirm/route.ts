import type { EmailOtpType } from "@supabase/supabase-js"
import { NextResponse, type NextRequest } from "next/server"
import { RUTA_LOGIN, destinoConfirmacion } from "@/shared/auth/rutas"
import { crearClienteSupabase } from "@/shared/auth/supabase-servidor"

const TIPOS_PERMITIDOS: readonly EmailOtpType[] = ["signup", "email", "recovery"]

// Excepción documentada en CLAUDE.md (sección 3): verifica el enlace del correo
// y establece la cookie de sesión. Sin lógica de negocio ni escrituras en la BD.
export async function GET(solicitud: NextRequest) {
  const { searchParams } = solicitud.nextUrl
  const tokenHash = searchParams.get("token_hash")
  const tipo = searchParams.get("type")
  const destino = destinoConfirmacion(searchParams.get("next"))

  const tipoValido = TIPOS_PERMITIDOS.find((permitido) => permitido === tipo)
  if (tokenHash && tipoValido) {
    const supabase = await crearClienteSupabase()
    const { error } = await supabase.auth.verifyOtp({ type: tipoValido, token_hash: tokenHash })
    if (!error) {
      return NextResponse.redirect(new URL(destino, solicitud.url))
    }
  }

  const login = new URL(RUTA_LOGIN, solicitud.url)
  login.searchParams.set("error", "enlace")
  return NextResponse.redirect(login)
}
