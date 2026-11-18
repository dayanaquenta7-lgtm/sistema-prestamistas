"use server"

import { redirect } from "next/navigation"
import {
  destinoPermitido,
  esCodigoInvitacion,
  RUTA_COMPLETAR_REGISTRO,
  RUTA_INICIO_PANEL,
  RUTA_LOGIN,
  RUTA_RESTABLECER_CONTRASENA,
  rutaInvitacion,
} from "@/shared/auth/rutas"
import { leerUsuario } from "@/shared/auth/sesion"
import { crearClienteSupabase } from "@/shared/auth/supabase-servidor"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import { validar } from "@/shared/lib/validar"
import {
  esquemaCompletarRegistro,
  esquemaInicioSesion,
  esquemaRecuperarContrasena,
  esquemaReenviarConfirmacion,
  esquemaRegistro,
  esquemaRegistroInvitado,
  esquemaRestablecerContrasena,
} from "../esquemas/acceso"
import { MENSAJE_INVITACION_NO_DISPONIBLE, MENSAJE_REGISTRO_INVITADO } from "../mensajes-invitacion"
import { crearNegocioInicial, type ResultadoNegocioInicial } from "./crear-negocio-inicial"
import { clasificarErrorEnvio } from "./envio-correo"
import { mensajeErrorAuth } from "./mensajes-auth"
import { urlConfirmacion } from "./origen"

/** Mismo resultado exista o no la cuenta; ver clasificarErrorEnvio. */
function resultadoEnvioCorreo(codigoError: string | undefined, operacion: string): Resultado {
  switch (clasificarErrorEnvio(codigoError)) {
    case "limite-correo":
      // Sin el correo ni otros datos personales: solo para diagnosticar correos que no llegaron.
      console.warn(`[auth] Límite de envío de correos alcanzado (${operacion}); se respondió con el mensaje genérico.`)
      return exito()
    case "limite-solicitudes":
      return fallo(mensajeErrorAuth(codigoError))
    case "exito":
      return exito()
  }
}

/** Tras iniciar sesión va al destino indicado solo si está en la lista permitida (por ejemplo, una invitación). */
export async function iniciarSesion(entrada: unknown, siguiente?: unknown): Promise<Resultado> {
  const validacion = validar(esquemaInicioSesion, entrada)
  if (!validacion.ok) return validacion

  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.signInWithPassword({
    email: validacion.datos.correo,
    password: validacion.datos.contrasena,
  })
  if (error) return fallo(mensajeErrorAuth(error.code))

  redirect(destinoPermitido(typeof siguiente === "string" ? siguiente : null))
}

/**
 * Registro desde un enlace de invitación. El correo de confirmación vuelve a la
 * invitación, donde el usuario la acepta y queda como ayudante, sin pasar por
 * "Completar registro" ni crear un negocio.
 */
export async function registrarseInvitado(codigo: unknown, entrada: unknown): Promise<Resultado> {
  if (!esCodigoInvitacion(codigo)) return fallo(MENSAJE_INVITACION_NO_DISPONIBLE)
  const validacion = validar(esquemaRegistroInvitado, entrada)
  if (!validacion.ok) return validacion

  const { nombre, correo, contrasena } = validacion.datos
  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      emailRedirectTo: await urlConfirmacion(rutaInvitacion(codigo)),
      data: { nombre, tipo_registro: "invitacion" },
    },
  })
  // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
  if (error && error.code !== "user_already_exists") return fallo(mensajeErrorAuth(error.code))
  return exito()
}

/**
 * Solo crea la cuenta en Supabase Auth. El negocio se crea después, con la
 * sesión ya confirmada, en "Completar registro": con la confirmación de correo
 * activa, si el correo ya existe Supabase devuelve un usuario ofuscado cuyo id
 * no sirve para asociar datos.
 */
export async function registrarse(entrada: unknown): Promise<Resultado> {
  const validacion = validar(esquemaRegistro, entrada)
  if (!validacion.ok) return validacion

  const { nombre, nombreNegocio, correo, contrasena } = validacion.datos
  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.signUp({
    email: correo,
    password: contrasena,
    options: {
      emailRedirectTo: await urlConfirmacion(RUTA_COMPLETAR_REGISTRO),
      data: { nombre, nombre_negocio: nombreNegocio },
    },
  })
  // Mismo mensaje exista o no la cuenta, para no revelar qué correos están registrados.
  if (error && error.code !== "user_already_exists") return fallo(mensajeErrorAuth(error.code))
  return exito()
}

export async function completarRegistro(entrada: unknown): Promise<Resultado> {
  const usuario = await leerUsuario()
  if (!usuario) redirect(RUTA_LOGIN)
  // Quien se registró desde una invitación se une a un negocio existente; no crea uno propio.
  if (usuario.metadatos.tipoRegistro === "invitacion") return fallo(MENSAJE_REGISTRO_INVITADO)

  const validacion = validar(esquemaCompletarRegistro, entrada)
  if (!validacion.ok) return validacion

  let resultado: ResultadoNegocioInicial
  try {
    resultado = await crearNegocioInicial(usuario.id, validacion.datos)
  } catch (error) {
    console.error("Error al crear el negocio inicial", error)
    return fallo("No pudimos crear tu negocio. Inténtalo de nuevo en unos minutos.")
  }

  // Con membresía previa (doble envío o acceso desactivado) la página decide qué mostrar.
  redirect(resultado === "creado" ? RUTA_INICIO_PANEL : RUTA_COMPLETAR_REGISTRO)
}

export async function recuperarContrasena(entrada: unknown): Promise<Resultado> {
  const validacion = validar(esquemaRecuperarContrasena, entrada)
  if (!validacion.ok) return validacion

  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(validacion.datos.correo, {
    redirectTo: await urlConfirmacion(RUTA_RESTABLECER_CONTRASENA),
  })
  return resultadoEnvioCorreo(error?.code, "recuperación de contraseña")
}

/** Reenvía el correo de confirmación de registro (flujo PKCE: válido solo en este navegador). */
export async function reenviarConfirmacion(entrada: unknown): Promise<Resultado> {
  const validacion = validar(esquemaReenviarConfirmacion, entrada)
  if (!validacion.ok) return validacion

  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: validacion.datos.correo,
    options: { emailRedirectTo: await urlConfirmacion(RUTA_COMPLETAR_REGISTRO) },
  })
  return resultadoEnvioCorreo(error?.code, "reenvío de confirmación")
}

export async function restablecerContrasena(entrada: unknown): Promise<Resultado> {
  const usuario = await leerUsuario()
  if (!usuario) {
    return fallo("El enlace venció. Solicita uno nuevo desde la opción para recuperar tu contraseña.")
  }

  const validacion = validar(esquemaRestablecerContrasena, entrada)
  if (!validacion.ok) return validacion

  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.updateUser({ password: validacion.datos.contrasena })
  if (error) return fallo(mensajeErrorAuth(error.code))

  redirect(RUTA_INICIO_PANEL)
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await crearClienteSupabase()
  await supabase.auth.signOut()
  redirect(RUTA_LOGIN)
}
