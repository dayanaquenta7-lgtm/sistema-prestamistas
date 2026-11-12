"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import {
  RUTA_COMPLETAR_REGISTRO,
  RUTA_INICIO_PANEL,
  RUTA_LOGIN,
  RUTA_RESTABLECER_CONTRASENA,
} from "@/shared/auth/rutas"
import { leerUsuario } from "@/shared/auth/sesion"
import { crearClienteSupabase } from "@/shared/auth/supabase-servidor"
import { exito, fallo, type Resultado } from "@/shared/lib/resultado"
import { validar } from "@/shared/lib/validar"
import {
  esquemaCompletarRegistro,
  esquemaInicioSesion,
  esquemaRecuperarContrasena,
  esquemaRegistro,
  esquemaRestablecerContrasena,
} from "../esquemas/acceso"
import { crearNegocioInicial, type ResultadoNegocioInicial } from "./crear-negocio-inicial"
import { mensajeErrorAuth } from "./mensajes-auth"

const CODIGOS_LIMITE = new Set(["over_email_send_rate_limit", "over_request_rate_limit"])

async function urlConfirmacion(siguiente: string): Promise<string> {
  const encabezados = await headers()
  const origen =
    encabezados.get("origin") ??
    `${encabezados.get("x-forwarded-proto") ?? "https"}://${encabezados.get("host") ?? ""}`
  return `${origen}/auth/confirm?next=${encodeURIComponent(siguiente)}`
}

export async function iniciarSesion(entrada: unknown): Promise<Resultado> {
  const validacion = validar(esquemaInicioSesion, entrada)
  if (!validacion.ok) return validacion

  const supabase = await crearClienteSupabase()
  const { error } = await supabase.auth.signInWithPassword({
    email: validacion.datos.correo,
    password: validacion.datos.contrasena,
  })
  if (error) return fallo(mensajeErrorAuth(error.code))

  redirect(RUTA_INICIO_PANEL)
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
  if (error?.code && CODIGOS_LIMITE.has(error.code)) return fallo(mensajeErrorAuth(error.code))
  // Mismo mensaje exista o no la cuenta.
  return exito()
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
