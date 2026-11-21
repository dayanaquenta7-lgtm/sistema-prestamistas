/** Textos que ve el usuario en el módulo de clientes. */
export const MENSAJES_CLIENTES = {
  revisarDatos: "Revisa los datos ingresados.",
  ciDuplicado: "Ya hay un cliente con ese CI en tu negocio.",
  noEncontrado: "No encontramos este cliente. Puede que el enlace sea incorrecto.",
  soloDuenoTasa: "Solo el dueño del negocio puede definir o cambiar la tasa preferencial.",
  soloDuenoNoPrestar: "Solo el dueño del negocio puede marcar o quitar la marca de no prestar.",
  yaNoPrestar: "Este cliente ya está marcado como no prestar.",
  noEstaNoPrestar: "Este cliente no está marcado como no prestar.",
  errorGuardar: "No pudimos guardar el cliente. Inténtalo de nuevo en unos minutos.",
  errorNoPrestar: "No pudimos actualizar la marca de no prestar. Inténtalo de nuevo en unos minutos.",
  exitoCrear: "Cliente registrado.",
  exitoEditar: "Cambios guardados.",
  exitoMarcarNoPrestar: "Cliente marcado como no prestar.",
  exitoQuitarNoPrestar: "Se quitó la marca de no prestar.",
  errorCargarListado: "No pudimos cargar los clientes.",
  errorCargarFicha: "No pudimos cargar la ficha del cliente.",
  errorCargarDescripcion: "Revisa tu conexión e inténtalo de nuevo.",
} as const
