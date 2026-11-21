export const RUTA_LOGIN = "/login"
export const RUTA_INICIO_PANEL = "/cobrar-hoy"
export const RUTA_COMPLETAR_REGISTRO = "/completar-registro"
export const RUTA_RESTABLECER_CONTRASENA = "/restablecer-contrasena"
export const RUTA_RECUPERAR_CONTRASENA = "/recuperar-contrasena"
export const RUTA_REENVIAR_CONFIRMACION = "/reenviar-confirmacion"

/** Rutas que no exigen sesión (el proxy no redirige a /login). */
export const RUTAS_PUBLICAS = [
  "/login",
  "/registro",
  "/recuperar-contrasena",
  "/reenviar-confirmacion",
  "/auth/confirm",
  // La página de una invitación decide qué mostrar con o sin sesión.
  "/invitacion",
] as const

/** Destinos fijos permitidos tras /auth/confirm o el inicio de sesión. */
const DESTINOS_PERMITIDOS = [
  RUTA_COMPLETAR_REGISTRO,
  RUTA_RESTABLECER_CONTRASENA,
  RUTA_INICIO_PANEL,
] as const

/** Código de invitación: 32 bytes en base64url (43 caracteres). */
const PATRON_CODIGO_INVITACION = /^[A-Za-z0-9_-]{43}$/
const PATRON_RUTA_INVITACION = /^\/invitacion\/[A-Za-z0-9_-]{43}$/

export function esCodigoInvitacion(codigo: unknown): codigo is string {
  return typeof codigo === "string" && PATRON_CODIGO_INVITACION.test(codigo)
}

export function rutaInvitacion(codigo: string): string {
  return `/invitacion/${codigo}`
}

export function esRutaPublica(ruta: string): boolean {
  return RUTAS_PUBLICAS.some((publica) => ruta === publica || ruta.startsWith(`${publica}/`))
}

/**
 * Valida el destino ("next" de /auth/confirm, "siguiente" del login) contra una
 * lista cerrada, más la página de una invitación con código bien formado, para
 * evitar redirecciones abiertas hacia otros sitios.
 */
export function destinoPermitido(siguiente: string | null | undefined): string {
  if (typeof siguiente === "string" && PATRON_RUTA_INVITACION.test(siguiente)) return siguiente
  const encontrado = DESTINOS_PERMITIDOS.find((destino) => destino === siguiente)
  return encontrado ?? RUTA_INICIO_PANEL
}
