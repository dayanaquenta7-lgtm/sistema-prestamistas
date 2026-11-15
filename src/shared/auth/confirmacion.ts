import { RUTA_RECUPERAR_CONTRASENA, RUTA_REENVIAR_CONFIRMACION, RUTA_RESTABLECER_CONTRASENA } from "./rutas"

export type CodigoAvisoLogin = "enlace" | "navegador-registro" | "navegador-recuperacion"

export interface AvisoLogin {
  mensaje: string
  accion?: { href: string; texto: string }
}

/**
 * Mensajes fijos para /login?error=<código>. Nunca se muestra texto tomado de la URL
 * (por ejemplo, error_description de Supabase).
 */
const AVISOS_LOGIN: Record<CodigoAvisoLogin, AvisoLogin> = {
  enlace: { mensaje: "El enlace no es válido o ya venció. Inicia sesión o solicita uno nuevo." },
  "navegador-registro": {
    mensaje:
      "Abre el enlace en el mismo navegador donde hiciste el registro. Si ya no tienes acceso a ese navegador, solicita un correo de confirmación nuevo.",
    accion: { href: RUTA_REENVIAR_CONFIRMACION, texto: "Reenviar correo de confirmación" },
  },
  "navegador-recuperacion": {
    mensaje:
      "Abre el enlace en el mismo navegador donde pediste el cambio de contraseña, o solicita un enlace nuevo desde este navegador.",
    accion: { href: RUTA_RECUPERAR_CONTRASENA, texto: "Solicitar un enlace nuevo" },
  },
}

export function avisoLogin(codigo: unknown): AvisoLogin | undefined {
  return typeof codigo === "string" && Object.hasOwn(AVISOS_LOGIN, codigo)
    ? AVISOS_LOGIN[codigo as CodigoAvisoLogin]
    : undefined
}

/** Código que devuelve Supabase cuando el enlace PKCE se abre en otro navegador (falta el code_verifier). */
const CODIGO_SIN_VERIFICADOR = "pkce_code_verifier_not_found"

export function motivoFalloConfirmacion(codigoError: string | undefined, destino: string): CodigoAvisoLogin {
  if (codigoError !== CODIGO_SIN_VERIFICADOR) return "enlace"
  return destino === RUTA_RESTABLECER_CONTRASENA ? "navegador-recuperacion" : "navegador-registro"
}
