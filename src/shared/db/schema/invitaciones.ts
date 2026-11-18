import { sql } from "drizzle-orm"
import { boolean, check, index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { actualizadoEn, creadoEn, id } from "./columnas"
import { negocios } from "./negocios"
import { perfiles } from "./perfiles"

// RN-13: enlace de un solo uso que vence a los 7 días. Solo se guarda el hash del código.
export const invitaciones = pgTable(
  "invitaciones",
  {
    id: id(),
    negocioId: uuid("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "restrict" }),
    /** SHA-256 en hexadecimal del código; el código en claro nunca se guarda. */
    codigoHash: text("codigo_hash").notNull().unique("invitaciones_codigo_hash_unico"),
    puedeCrearPrestamos: boolean("puede_crear_prestamos").notNull().default(false),
    venceEn: timestamp("vence_en", { withTimezone: true }).notNull(),
    usadaEn: timestamp("usada_en", { withTimezone: true }),
    usadaPor: uuid("usada_por").references(() => perfiles.id, { onDelete: "restrict" }),
    revocadaEn: timestamp("revocada_en", { withTimezone: true }),
    revocadaPor: uuid("revocada_por").references(() => perfiles.id, { onDelete: "restrict" }),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
    creadoPor: uuid("creado_por")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
  },
  (tabla) => [
    index("invitaciones_negocio_idx").on(tabla.negocioId, tabla.creadoEn),
    check("invitaciones_usada_check", sql`(${tabla.usadaEn} is null) = (${tabla.usadaPor} is null)`),
    check("invitaciones_revocada_check", sql`(${tabla.revocadaEn} is null) = (${tabla.revocadaPor} is null)`),
    check("invitaciones_usada_o_revocada_check", sql`${tabla.usadaEn} is null or ${tabla.revocadaEn} is null`),
    check("invitaciones_codigo_hash_check", sql`${tabla.codigoHash} ~ '^[0-9a-f]{64}$'`),
  ],
).enableRLS()
