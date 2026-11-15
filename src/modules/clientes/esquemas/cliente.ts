import { z } from "zod"
import { aDecimal } from "@/shared/lib/dinero"
import { normalizarCi, parsearTasa, textoOpcional } from "../dominio/normalizar"

const LARGO_NOMBRE = 150
const LARGO_DIRECCION = 250
const LARGO_NOTAS = 1000
const LARGO_MOTIVO = 500

function textoLibre(maximo: number, mensaje: string) {
  return z.string().max(maximo, mensaje).transform(textoOpcional)
}

const telefono = z
  .string()
  .max(25, "El teléfono es demasiado largo")
  .refine((texto) => {
    const limpio = texto.trim()
    if (limpio === "") return true
    const digitos = limpio.replace(/\D/g, "").length
    return /^\+?[\d\s-]+$/.test(limpio) && digitos >= 7 && digitos <= 15
  }, "Teléfono inválido. Usa solo números, por ejemplo 71234567")
  .transform(textoOpcional)

const ci = z
  .string()
  .max(20, "El CI es demasiado largo")
  .refine((texto) => texto.trim() === "" || /^[\dA-Za-z][\dA-Za-z\s-]*$/.test(texto.trim()), {
    message: "CI inválido. Usa números y, si corresponde, la extensión. Ejemplo: 1234567 LP",
  })
  .transform(normalizarCi)

const tasaPreferencial = z
  .string()
  .transform((texto, contexto) => {
    if (texto.trim() === "") return null
    const tasa = parsearTasa(texto)
    if (tasa === null) {
      contexto.addIssue({ code: "custom", message: "Tasa inválida. Usa hasta 4 decimales, por ejemplo 2,5" })
      return z.NEVER
    }
    if (aDecimal(tasa).greaterThan(100)) {
      contexto.addIssue({ code: "custom", message: "La tasa no puede ser mayor a 100 %" })
      return z.NEVER
    }
    return tasa
  })

/** Mismo esquema en el formulario y en el servidor. Los campos opcionales vacíos quedan en null. */
export const esquemaCliente = z.object({
  nombreCompleto: z
    .string()
    .trim()
    .min(1, "Ingresa el nombre completo")
    .max(LARGO_NOMBRE, "El nombre es demasiado largo"),
  ci,
  telefono,
  direccion: textoLibre(LARGO_DIRECCION, "La dirección es demasiado larga"),
  referenciaNombre: textoLibre(LARGO_NOMBRE, "El nombre de la referencia es demasiado largo"),
  referenciaTelefono: telefono,
  notas: textoLibre(LARGO_NOTAS, "Las notas son demasiado largas"),
  tasaPreferencial,
})

export type EntradaCliente = z.input<typeof esquemaCliente>
export type DatosCliente = z.output<typeof esquemaCliente>

export const ENTRADA_CLIENTE_VACIA: EntradaCliente = {
  nombreCompleto: "",
  ci: "",
  telefono: "",
  direccion: "",
  referenciaNombre: "",
  referenciaTelefono: "",
  notas: "",
  tasaPreferencial: "",
}

export const esquemaMarcarNoPrestar = z.object({
  motivo: z
    .string()
    .trim()
    .min(1, "Escribe el motivo para no prestarle")
    .max(LARGO_MOTIVO, "El motivo es demasiado largo"),
})

export type EntradaNoPrestar = z.input<typeof esquemaMarcarNoPrestar>

export const esquemaIdCliente = z.uuid("Cliente inválido")

export const esquemaBusquedaClientes = z
  .string()
  .trim()
  .max(100)
  .catch("")
