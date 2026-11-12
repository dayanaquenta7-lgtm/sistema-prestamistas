/** Resultado tipado de una Server Action: nunca se lanzan excepciones hacia la UI. */
export type Resultado<T = undefined> =
  | { ok: true; datos: T }
  | { ok: false; error: string; erroresCampo?: Record<string, string[]> }

export function exito(): Resultado
export function exito<T>(datos: T): Resultado<T>
export function exito<T>(datos?: T): Resultado<T | undefined> {
  return { ok: true, datos }
}

export function fallo(error: string, erroresCampo?: Record<string, string[]>): {
  ok: false
  error: string
  erroresCampo?: Record<string, string[]>
} {
  return erroresCampo ? { ok: false, error, erroresCampo } : { ok: false, error }
}
