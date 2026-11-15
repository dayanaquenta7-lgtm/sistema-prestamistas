import "server-only"
import { and, asc, eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import { connection } from "next/server"
import { cache } from "react"
import { z } from "zod"
import { db } from "@/shared/db/cliente"
import { membresias, negocios } from "@/shared/db/schema"
import { cumpleRol, type Rol } from "./permisos"
import { RUTA_COMPLETAR_REGISTRO, RUTA_INICIO_PANEL, RUTA_LOGIN } from "./rutas"
import { crearClienteSupabase } from "./supabase-servidor"

export interface UsuarioSesion {
  id: string
  correo: string
  /** Datos enviados en signUp para precargar "Completar registro". */
  metadatos: { nombre: string; nombreNegocio: string }
}

export interface ContextoNegocio {
  usuario: UsuarioSesion
  negocio: { id: string; nombre: string; moneda: string; zonaHoraria: string }
  rol: Rol
  puedeCrearPrestamos: boolean
}

const esquemaMetadatos = z.object({
  nombre: z.string().catch(""),
  nombre_negocio: z.string().catch(""),
})

/** Usuario con sesión válida, o null. Se resuelve una sola vez por solicitud. */
export const leerUsuario = cache(async (): Promise<UsuarioSesion | null> => {
  // getClaims() usa Date.now() para comprobar el vencimiento de la sesión; sin esto, el
  // prerender del App Shell (partialPrefetching) falla con "unstable value Date.now()".
  await connection()
  const supabase = await crearClienteSupabase()
  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims?.sub) return null

  const { claims } = data
  const metadatos = esquemaMetadatos.parse(claims.user_metadata ?? {})
  return {
    id: claims.sub,
    correo: typeof claims.email === "string" ? claims.email : "",
    metadatos: { nombre: metadatos.nombre, nombreNegocio: metadatos.nombre_negocio },
  }
})

/** Exige sesión (sin exigir negocio). Sin sesión redirige a /login. */
export async function obtenerUsuario(): Promise<UsuarioSesion> {
  const usuario = await leerUsuario()
  if (!usuario) redirect(RUTA_LOGIN)
  return usuario
}

/** Membresía activa más antigua del usuario (orden determinista). */
const leerMembresiaActiva = cache(async (usuarioId: string) => {
  const [fila] = await db()
    .select({
      rol: membresias.rol,
      puedeCrearPrestamos: membresias.puedeCrearPrestamos,
      negocio: {
        id: negocios.id,
        nombre: negocios.nombre,
        moneda: negocios.moneda,
        zonaHoraria: negocios.zonaHoraria,
      },
    })
    .from(membresias)
    .innerJoin(negocios, eq(negocios.id, membresias.negocioId))
    .where(and(eq(membresias.usuarioId, usuarioId), eq(membresias.activo, true)))
    .orderBy(asc(membresias.creadoEn), asc(membresias.id))
    .limit(1)
  return fila ?? null
})

export type EstadoMembresia = "activa" | "inactiva" | "ninguna"

/**
 * Solo un usuario sin ninguna membresía puede crear un negocio. Con una
 * membresía inactiva, su acceso fue desactivado por el dueño.
 */
export async function estadoMembresia(usuarioId: string): Promise<EstadoMembresia> {
  if (await leerMembresiaActiva(usuarioId)) return "activa"
  const [fila] = await db()
    .select({ id: membresias.id })
    .from(membresias)
    .where(eq(membresias.usuarioId, usuarioId))
    .limit(1)
  return fila ? "inactiva" : "ninguna"
}

/**
 * Helper central: usuario, negocio y rol de la sesión. Toda consulta y acción
 * filtra por este negocio; nunca por un negocio_id enviado por el cliente.
 * Sin sesión → /login. Sin membresía activa → /completar-registro.
 */
export async function obtenerContexto(): Promise<ContextoNegocio> {
  const usuario = await obtenerUsuario()
  const membresia = await leerMembresiaActiva(usuario.id)
  if (!membresia) redirect(RUTA_COMPLETAR_REGISTRO)

  return {
    usuario,
    negocio: membresia.negocio,
    rol: membresia.rol,
    puedeCrearPrestamos: membresia.puedeCrearPrestamos,
  }
}

/** Exige un rol. Si no alcanza, redirige al inicio del panel. */
export async function requerirRol(rol: Rol): Promise<ContextoNegocio> {
  const contexto = await obtenerContexto()
  if (!cumpleRol(contexto.rol, rol)) redirect(RUTA_INICIO_PANEL)
  return contexto
}
