import { sql } from "drizzle-orm"
import { boolean, check, date, index, pgTable, text, unique, uniqueIndex, uuid } from "drizzle-orm/pg-core"
import { actualizadoEn, creadoEn, id } from "./columnas"
import { checkCondiciones, columnaCondiciones, negocios } from "./negocios"
import { perfiles } from "./perfiles"

// Las plantillas no se eliminan: se desactivan. Editarlas no altera préstamos existentes (RN-01).
export const plantillasPrestamo = pgTable(
  "plantillas_prestamo",
  {
    id: id(),
    negocioId: uuid("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "restrict" }),
    nombre: text("nombre").notNull(),
    condiciones: columnaCondiciones("condiciones").notNull(),
    activa: boolean("activa").notNull().default(true),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
    creadoPor: uuid("creado_por")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
  },
  (tabla) => [
    // Nombre único entre las activas, sin distinguir mayúsculas.
    uniqueIndex("plantillas_negocio_nombre_activa_unico")
      .on(tabla.negocioId, sql`lower(${tabla.nombre})`)
      .where(sql`${tabla.activa}`),
    index("plantillas_negocio_idx").on(tabla.negocioId, tabla.activa),
    check("plantillas_nombre_check", sql`btrim(${tabla.nombre}) <> ''`),
    checkCondiciones("plantillas_condiciones_check", tabla.condiciones),
  ],
).enableRLS()

// Configuración, no un registro financiero: quitar un feriado lo borra (queda en auditoría)
// y no afecta los préstamos ya creados, cuyas fechas se congelan al desembolsar.
export const feriados = pgTable(
  "feriados",
  {
    id: id(),
    negocioId: uuid("negocio_id")
      .notNull()
      .references(() => negocios.id, { onDelete: "restrict" }),
    fecha: date("fecha", { mode: "string" }).notNull(),
    descripcion: text("descripcion").notNull(),
    creadoEn: creadoEn(),
    actualizadoEn: actualizadoEn(),
    creadoPor: uuid("creado_por")
      .notNull()
      .references(() => perfiles.id, { onDelete: "restrict" }),
  },
  (tabla) => [
    unique("feriados_negocio_fecha_unico").on(tabla.negocioId, tabla.fecha),
    check("feriados_descripcion_check", sql`btrim(${tabla.descripcion}) <> ''`),
  ],
).enableRLS()
