interface ErrorPostgres {
  code?: unknown
  constraint_name?: unknown
}

/** Drizzle envuelve el error del driver en DrizzleQueryError; el de Postgres queda en `cause`. */
function errorPostgres(error: unknown): ErrorPostgres | null {
  if (typeof error !== "object" || error === null) return null
  const conCodigo = error as ErrorPostgres & { cause?: unknown }
  if (typeof conCodigo.code === "string") return conCodigo
  return conCodigo.cause === undefined ? null : errorPostgres(conCodigo.cause)
}

/** Violación de una restricción única concreta (código 23505). */
export function esViolacionUnica(error: unknown, restriccion: string): boolean {
  const pg = errorPostgres(error)
  return pg?.code === "23505" && pg.constraint_name === restriccion
}

/**
 * Descripción para el log sin datos personales: el mensaje de Drizzle incluye la
 * consulta y sus parámetros, así que solo se registra el código de Postgres.
 */
export function describirErrorDb(error: unknown): string {
  const pg = errorPostgres(error)
  if (pg) return `Postgres ${String(pg.code)}`
  return error instanceof Error ? error.name : "error desconocido"
}
