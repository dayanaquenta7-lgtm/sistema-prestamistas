export type ClaseErrorEnvio = "exito" | "limite-correo" | "limite-solicitudes"

/**
 * Clasifica el error de un envío de correo de Supabase Auth (recuperación, reenvío de
 * confirmación) sin revelar si la cuenta existe:
 * - over_email_send_rate_limit se cuenta por usuario: mostrarlo revelaría que el correo
 *   está registrado, así que se responde como éxito.
 * - over_request_rate_limit se cuenta por IP: se puede mostrar.
 * - Cualquier otro error (cuenta inexistente, ya confirmada) se responde como éxito.
 */
export function clasificarErrorEnvio(codigo: string | undefined): ClaseErrorEnvio {
  if (codigo === "over_email_send_rate_limit") return "limite-correo"
  if (codigo === "over_request_rate_limit") return "limite-solicitudes"
  return "exito"
}
