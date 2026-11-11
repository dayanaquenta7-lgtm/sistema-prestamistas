import "server-only"
import {
  construirRegistroAuditoria,
  type DatosAuditoria,
  type RegistroAuditoria,
} from "@/shared/lib/auditoria"
import type { Transaccion } from "./cliente"
import { auditoria } from "./schema"

/**
 * Registra auditoría dentro de la misma transacción que la operación auditada:
 * si la operación se revierte, el registro también.
 */
export async function registrarAuditoria(
  tx: Transaccion,
  datos: DatosAuditoria,
): Promise<RegistroAuditoria> {
  const registro = construirRegistroAuditoria(datos)
  await tx.insert(auditoria).values(registro)
  return registro
}
