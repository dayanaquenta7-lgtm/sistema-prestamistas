import { z } from "zod"
import { parsearMonto } from "./dinero"

/**
 * Monto escrito en formato boliviano ("1.234,56"). Se valida igual en el
 * formulario y en el servidor, y se transforma al texto canónico "1234.56"
 * que se guarda en columnas numeric y se convierte a Decimal con aDecimal().
 */
export const esquemaMonto = z
  .string()
  .trim()
  .min(1, "Ingresa un monto")
  .transform((texto, contexto) => {
    const monto = parsearMonto(texto)
    if (!monto) {
      contexto.addIssue({ code: "custom", message: "Monto inválido. Ejemplo: 1.234,50" })
      return z.NEVER
    }
    return monto.toFixed(2)
  })

export const esquemaMontoPositivo = esquemaMonto.refine((monto) => monto !== "0.00", {
  message: "El monto debe ser mayor a cero",
})
