import { describe, expect, it } from "vitest"
import { z } from "zod"
import { validar } from "./validar"

const esquema = z.object({ nombre: z.string().min(2, "Muy corto"), edad: z.number() })

describe("validar", () => {
  it("devuelve los datos validados", () => {
    expect(validar(esquema, { nombre: "Ana", edad: 30 })).toEqual({
      ok: true,
      datos: { nombre: "Ana", edad: 30 },
    })
  })

  it("agrupa los errores por campo", () => {
    const resultado = validar(esquema, { nombre: "A" })
    expect(resultado.ok).toBe(false)
    if (!resultado.ok) {
      expect(resultado.erroresCampo?.nombre).toEqual(["Muy corto"])
      expect(resultado.erroresCampo?.edad).toHaveLength(1)
    }
  })
})
