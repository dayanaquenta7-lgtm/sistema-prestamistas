import type { z } from "zod"
import { fallo } from "@/shared/lib/resultado"

/** Valida con Zod en el servidor y devuelve los errores por campo en formato de Resultado. */
export function validar<T extends z.ZodType>(
  esquema: T,
  datos: unknown,
): { ok: true; datos: z.infer<T> } | ReturnType<typeof fallo> {
  const resultado = esquema.safeParse(datos)
  if (resultado.success) return { ok: true, datos: resultado.data }

  const erroresCampo: Record<string, string[]> = {}
  for (const issue of resultado.error.issues) {
    const campo = issue.path.join(".") || "_"
    erroresCampo[campo] = [...(erroresCampo[campo] ?? []), issue.message]
  }
  return fallo("Revisa los datos ingresados.", erroresCampo)
}
