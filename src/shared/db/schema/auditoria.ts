import { index, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core"
import type { ObjetoJson } from "@/shared/lib/auditoria"
import { creadoEn, id } from "./columnas"
import { negocios } from "./negocios"
import { perfiles } from "./perfiles"

// Sin actualizado_en: los registros de auditoría nunca se modifican.
export const auditoria = pgTable(
  "auditoria",
  {
    id: id(),
    negocioId: uuid("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "restrict" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
    accion: text("accion").notNull(),
    entidad: text("entidad").notNull(),
    entidadId: uuid("entidad_id"),
    valorAnterior: jsonb("valor_anterior").$type<ObjetoJson>(),
    valorNuevo: jsonb("valor_nuevo").$type<ObjetoJson>(),
    creadoEn: creadoEn(),
  },
  (tabla) => [
    index("auditoria_negocio_fecha_idx").on(tabla.negocioId, tabla.creadoEn),
    index("auditoria_entidad_idx").on(tabla.entidad, tabla.entidadId),
  ],
).enableRLS()
