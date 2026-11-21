/** Mensaje único para un enlace que no sirve: no revela si no existe, se usó, se revocó o venció. */
export const MENSAJE_INVITACION_NO_DISPONIBLE =
  "Este enlace de invitación no es válido o ya no está disponible. Pide uno nuevo a quien te invitó."

export const MENSAJE_REGISTRO_INVITADO =
  "Tu cuenta se creó desde una invitación. Abre otra vez el enlace que te enviaron para unirte al negocio."

/** Textos de la gestión de usuarios e invitaciones. */
export const MENSAJES_USUARIOS = {
  errorGuardar: "No pudimos guardar los cambios. Inténtalo de nuevo en unos minutos.",
  errorAceptar: "No pudimos aceptar la invitación. Inténtalo de nuevo en unos minutos.",
  invitacionNoPendiente: "Esta invitación ya no está pendiente.",
  miembroNoEncontrado: "No encontramos a este usuario en tu negocio.",
  esDueno: "Este enlace es para invitar a otra persona a tu negocio. Compártelo con tu ayudante.",
  yaMiembroActivo: "Ya formas parte de este negocio.",
  yaMiembroInactivo: "Tu acceso a este negocio está desactivado. Pide al dueño que lo reactive.",
  exitoRevocar: "Invitación revocada.",
  exitoActivar: "Ayudante activado.",
  exitoDesactivar: "Ayudante desactivado. Pierde el acceso de inmediato.",
  exitoPermiso: "Permiso actualizado.",
  negocioNoDisponible: "No tienes acceso a ese negocio.",
} as const
