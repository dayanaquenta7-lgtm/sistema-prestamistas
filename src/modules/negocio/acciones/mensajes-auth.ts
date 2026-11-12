/** Traduce los errores de Supabase Auth a mensajes para un usuario no técnico. */
export function mensajeErrorAuth(codigo: string | undefined): string {
  switch (codigo) {
    case "invalid_credentials":
      return "Correo o contraseña incorrectos."
    case "email_not_confirmed":
      return "Todavía no confirmaste tu correo. Revisa tu bandeja de entrada y abre el enlace que te enviamos."
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Hiciste demasiados intentos. Espera unos minutos y vuelve a intentarlo."
    case "weak_password":
      return "La contraseña es muy débil. Usa al menos 8 caracteres combinando letras y números."
    case "same_password":
      return "La nueva contraseña debe ser distinta de la anterior."
    default:
      return "No pudimos completar la operación. Inténtalo de nuevo en unos minutos."
  }
}
