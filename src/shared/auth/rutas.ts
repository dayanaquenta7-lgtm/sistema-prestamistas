export const RUTA_LOGIN = "/login"
export const RUTA_INICIO_PANEL = "/cobrar-hoy"
export const RUTA_COMPLETAR_REGISTRO = "/completar-registro"
export const RUTA_RESTABLECER_CONTRASENA = "/restablecer-contrasena"

/** Rutas que no exigen sesión (el proxy no redirige a /login). */
export const RUTAS_PUBLICAS = [
  "/login",
  "/registro",
  "/recuperar-contrasena",
  "/auth/confirm",
] as const

/** Destinos permitidos tras verificar un enlace de correo en /auth/confirm. */
const DESTINOS_CONFIRMACION = [
  RUTA_COMPLETAR_REGISTRO,
  RUTA_RESTABLECER_CONTRASENA,
  RUTA_INICIO_PANEL,
] as const

export function esRutaPublica(ruta: string): boolean {
  return RUTAS_PUBLICAS.some((publica) => ruta === publica || ruta.startsWith(`${publica}/`))
}

/**
 * Valida el parámetro "next" de /auth/confirm contra una lista cerrada para
 * evitar redirecciones abiertas hacia otros sitios.
 */
export function destinoConfirmacion(siguiente: string | null): string {
  const encontrado = DESTINOS_CONFIRMACION.find((destino) => destino === siguiente)
  return encontrado ?? RUTA_INICIO_PANEL
}
