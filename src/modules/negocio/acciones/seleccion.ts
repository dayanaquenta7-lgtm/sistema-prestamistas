"use server"

import { redirect } from "next/navigation"
import { z } from "zod"
import { guardarNegocioActivo } from "@/shared/auth/cookie-negocio"
import { RUTA_INICIO_PANEL } from "@/shared/auth/rutas"
import { listarNegociosDisponibles, obtenerUsuario } from "@/shared/auth/sesion"
import { fallo, type Resultado } from "@/shared/lib/resultado"
import { MENSAJES_USUARIOS as M } from "../mensajes-invitacion"

/**
 * Cambia el negocio de la sesión. Solo guarda la cookie si el usuario tiene una
 * membresía activa en ese negocio; obtenerContexto la vuelve a validar en cada solicitud.
 */
export async function cambiarNegocio(negocioId: unknown): Promise<Resultado> {
  const usuario = await obtenerUsuario()
  const id = z.uuid().safeParse(negocioId)
  const disponibles = await listarNegociosDisponibles(usuario.id)
  if (!id.success || !disponibles.some((negocio) => negocio.id === id.data)) return fallo(M.negocioNoDisponible)

  await guardarNegocioActivo(id.data)
  redirect(RUTA_INICIO_PANEL)
}
