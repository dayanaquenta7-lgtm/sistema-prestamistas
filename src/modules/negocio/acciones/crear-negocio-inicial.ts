import "server-only"
import { eq, sql } from "drizzle-orm"
import { registrarAuditoria } from "@/shared/db/auditoria"
import { db } from "@/shared/db/cliente"
import { membresias, negocios, perfiles } from "@/shared/db/schema"
import type { DatosCompletarRegistro } from "../esquemas/acceso"

export type ResultadoNegocioInicial = "creado" | "ya_tiene_membresia"

/**
 * Crea perfil + negocio + membresía de dueño + auditoría en una transacción.
 * Es idempotente: si el usuario ya tiene alguna membresía (activa o inactiva)
 * no crea nada. El bloqueo consultivo de transacción evita que un doble envío
 * cree dos negocios; se libera solo al terminar la transacción, por eso es
 * compatible con el pooler en modo transacción.
 */
export async function crearNegocioInicial(
  usuarioId: string,
  datos: DatosCompletarRegistro,
): Promise<ResultadoNegocioInicial> {
  return db().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${usuarioId}, 0))`)

    const [existente] = await tx
      .select({ id: membresias.id })
      .from(membresias)
      .where(eq(membresias.usuarioId, usuarioId))
      .limit(1)
    if (existente) return "ya_tiene_membresia"

    await tx
      .insert(perfiles)
      .values({ id: usuarioId, nombre: datos.nombre })
      .onConflictDoUpdate({ target: perfiles.id, set: { nombre: datos.nombre } })

    const [negocio] = await tx
      .insert(negocios)
      .values({ nombre: datos.nombreNegocio, creadoPor: usuarioId })
      .returning()

    const [membresia] = await tx
      .insert(membresias)
      .values({ negocioId: negocio.id, usuarioId, rol: "dueno", creadoPor: usuarioId })
      .returning({ id: membresias.id })

    await registrarAuditoria(tx, {
      negocioId: negocio.id,
      usuarioId,
      accion: "negocio.crear",
      entidad: "negocio",
      entidadId: negocio.id,
      valorNuevo: {
        nombre: negocio.nombre,
        moneda: negocio.moneda,
        zonaHoraria: negocio.zonaHoraria,
        membresiaDuenoId: membresia.id,
      },
    })

    return "creado"
  })
}
