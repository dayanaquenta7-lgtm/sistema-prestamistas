import { sql } from "drizzle-orm"
import { boolean, check, index, numeric, pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { actualizadoEn, creadoEn, id } from "./columnas"
import { negocios } from "./negocios"
import { perfiles } from "./perfiles"

// Sin borrado físico (CLAUDE.md, sección 5): no hay columna de baja ni DELETE en la app.
export const clientes = pgTable(
  "clientes",
  {
    id: id(),
    negocioId: uuid("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "restrict" }),
    nombreCompleto: text("nombre_completo").notNull(),
    /** Normalizado (mayúsculas, espacios colapsados); null si no se registró. */
    ci: text("ci"),
    telefono: text("telefono"),
    direccion: text("direccion"),
    referenciaNombre: text("referencia_nombre"),
    referenciaTelefono: text("referencia_telefono"),
    notas: text("notas"),
    /** Porcentaje; su período se define con la cascada de condiciones (Sprint 3). */
    tasaPreferencial: numeric("tasa_preferencial", { precision: 9, scale: 4 }),
    noPrestar: boolean("no_prestar").notNull().default(false),
    noPrestarMotivo: text("no_prestar_motivo"),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
    creadoPor: uuid("creado_por")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
  },
  (tabla) => [
    uniqueIndex("clientes_negocio_ci_unico").on(tabla.negocioId, tabla.ci).where(sql`${tabla.ci} is not null`),
    index("clientes_negocio_nombre_idx").on(tabla.negocioId, tabla.nombreCompleto),
    check("clientes_nombre_check", sql`btrim(${tabla.nombreCompleto}) <> ''`),
    check(
      "clientes_tasa_preferencial_check",
      sql`${tabla.tasaPreferencial} is null or (${tabla.tasaPreferencial} >= 0 and ${tabla.tasaPreferencial} <= 100)`,
    ),
    check(
      "clientes_no_prestar_check",
      sql`(${tabla.noPrestar} and btrim(coalesce(${tabla.noPrestarMotivo}, '')) <> '') or (not ${tabla.noPrestar} and ${tabla.noPrestarMotivo} is null)`,
    ),
  ],
).enableRLS()
