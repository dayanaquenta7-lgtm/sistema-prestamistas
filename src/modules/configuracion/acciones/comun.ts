import "server-only"
import { describirErrorDb } from "@/shared/db/errores"
import { fallo } from "@/shared/lib/resultado"
import { MENSAJES_CONFIGURACION as M } from "../esquemas/configuracion"

/** Resultado de una regla que se detecta dentro de una transacción y no debe llegar a la UI como excepción. */
export class FalloControlado extends Error {
  constructor(readonly resultado: ReturnType<typeof fallo>) {
    super(resultado.error)
  }
}

export function manejarError(
  error: unknown,
  contexto: string,
  traducir?: (error: unknown) => ReturnType<typeof fallo> | null,
): ReturnType<typeof fallo> {
  if (error instanceof FalloControlado) return error.resultado
  const traducido = traducir?.(error)
  if (traducido) return traducido
  console.error(`[configuracion] Error al ${contexto}: ${describirErrorDb(error)}`)
  return fallo(M.errorGuardar)
}
