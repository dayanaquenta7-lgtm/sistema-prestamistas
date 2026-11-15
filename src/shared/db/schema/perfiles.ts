import { pgTable, text, uuid } from "drizzle-orm/pg-core"
// authUsers se importa solo como destino de la FK. No se reexporta desde el
// esquema, por eso drizzle-kit no crea ni modifica el esquema auth de Supabase.
import { authUsers } from "drizzle-orm/supabase"
import { actualizadoEn, creadoEn } from "./columnas"

export const perfiles = pgTable("perfiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "restrict" }),
  nombre: text("nombre").notNull(),
  creadoEn: creadoEn(),
  actualizadoEn: actualizadoEn(),
}).enableRLS()
