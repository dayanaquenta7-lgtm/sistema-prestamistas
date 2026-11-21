import { timestamp, uuid } from "drizzle-orm/pg-core"

export const id = () => uuid("id").primaryKey().defaultRandom()

export const creadoEn = () =>
  timestamp("creado_en", { withTimezone: true }).notNull().defaultNow()

export const actualizadoEn = () =>
  timestamp("actualizado_en", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date())
