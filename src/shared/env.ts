import "server-only"
import { z } from "zod"

const esquemaEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  DATABASE_URL: z.string().min(1),
})

export type Env = z.infer<typeof esquemaEnv>

let envValidado: Env | undefined

/** Variables de entorno del servidor, validadas al primer uso. */
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
