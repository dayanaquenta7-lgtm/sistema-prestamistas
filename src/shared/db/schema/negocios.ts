import { sql } from "drizzle-orm"
import { boolean, check, index, jsonb, numeric, pgEnum, pgTable, text, unique, uuid } from "drizzle-orm/pg-core"
import type { ObjetoJson } from "@/shared/lib/auditoria"
import { actualizadoEn, creadoEn, id } from "./columnas"
import { perfiles } from "./perfiles"

/** Condiciones guardadas en jsonb: se validan con esquemaCondicionesPlantilla (módulo prestamos). */
export const columnaCondiciones = (nombre: string) => jsonb(nombre).$type<ObjetoJson>()

/** CHECK mínimo en la base; la validación completa la hace el esquema Zod al escribir y al leer. */
export const checkCondiciones = (nombre: string, columna: unknown) =>
  check(nombre, sql`${columna} is null or (jsonb_typeof(${columna}) = 'object' and ${columna} ? 'version')`)

export const negocios = pgTable(
  "negocios",
  {
    id: id(),
    nombre: text("nombre").notNull(),
    moneda: text("moneda").notNull().default("BOB"),
    zonaHoraria: text("zona_horaria").notNull().default("America/La_Paz"),
    /** Tasa mensual equivalente a partir de la cual se advierte (art. 409 del Código Civil, RN-09). */
    topeTasaMensual: numeric("tope_tasa_mensual", { precision: 9, scale: 4 }).notNull().default("3"),
    /** Null mientras el dueño no guarde las suyas: el formulario propone CONDICIONES_INICIALES. */
    condicionesDefecto: columnaCondiciones("condiciones_defecto"),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
    creadoPor: uuid("creado_por")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
  },
  (tabla) => [
    check(
      "negocios_tope_tasa_mensual_check",
      sql`${tabla.topeTasaMensual} > 0 and ${tabla.topeTasaMensual} <= 100`,
    ),
    checkCondiciones("negocios_condiciones_defecto_check", tabla.condicionesDefecto),
  ],
).enableRLS()

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
