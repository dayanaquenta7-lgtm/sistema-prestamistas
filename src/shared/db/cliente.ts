import "server-only"
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "@/shared/env"
import * as schema from "./schema"

export type BaseDatos = PostgresJsDatabase<typeof schema>
export type Transaccion = Parameters<Parameters<BaseDatos["transaction"]>[0]>[0]

const globalParaDb = globalThis as unknown as { baseDatos?: BaseDatos }

function crearBaseDatos(): BaseDatos {
  // El pooler de transacciones de Supabase no admite prepared statements.
  const conexion = postgres(env().DATABASE_URL, { prepare: false })
  return drizzle(conexion, { schema })
}

/** Conexión única por proceso; en desarrollo sobrevive a la recarga en caliente. */
export function db(): BaseDatos {
  if (!globalParaDb.baseDatos) {
    globalParaDb.baseDatos = crearBaseDatos()
  }
  return globalParaDb.baseDatos
}
