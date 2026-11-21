import "server-only"
import { esquemaEnv, type Env } from "./esquema-env"

let envValidado: Env | undefined

/** Variables de entorno del servidor, validadas al arrancar (instrumentation.ts) o al primer uso. */
export function env(): Env {
  if (!envValidado) {
    const resultado = esquemaEnv.safeParse(process.env)
    if (!resultado.success) {
      const faltantes = resultado.error.issues.map((issue) => issue.path.join(".")).join(", ")
      throw new Error(`Variables de entorno inválidas o faltantes: ${faltantes}`)
    }
    envValidado = resultado.data
  }
  return envValidado
}
