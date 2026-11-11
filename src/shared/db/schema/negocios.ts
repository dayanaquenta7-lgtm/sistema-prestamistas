import { boolean, index, pgEnum, pgTable, text, unique, uuid } from "drizzle-orm/pg-core"
import { actualizadoEn, creadoEn, id } from "./columnas"
import { perfiles } from "./perfiles"

export const negocios = pgTable("negocios", {
  id: id(),
  nombre: text("nombre").notNull(),
  moneda: text("moneda").notNull().default("BOB"),
  zonaHoraria: text("zona_horaria").notNull().default("America/La_Paz"),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
  creadoPor: uuid("creado_por")
    .notNull()
    .references(() => perfiles.id, { onDelete: "restrict" }),
}).enableRLS()

export const rolMembresia = pgEnum("rol_membresia", ["dueno", "ayudante"])

export const membresias = pgTable(
  "membresias",
  {
    id: id(),
    negocioId: uuid("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "restrict" }),
    usuarioId: uuid("usuario_id")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
    rol: rolMembresia("rol").notNull(),
    puedeCrearPrestamos: boolean("puede_crear_prestamos").notNull().default(false),
    activo: boolean("activo").notNull().default(true),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
    creadoPor: uuid("creado_por")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
  },
  (tabla) => [
    unique("membresias_negocio_usuario_unico").on(tabla.negocioId, tabla.usuarioId),
    index("membresias_usuario_idx").on(tabla.usuarioId, tabla.creadoEn),
  ],
).enableRLS()
