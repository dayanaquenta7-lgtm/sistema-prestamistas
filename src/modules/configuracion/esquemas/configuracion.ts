import { z } from "zod"
import { esquemaFormularioCondiciones } from "@/modules/prestamos"
import { aDecimal } from "@/shared/lib/dinero"
import { esFechaNegocio } from "@/shared/lib/fechas"
import { parsearTasa } from "@/shared/lib/tasas"

/** Textos que ve el usuario en la configuración del negocio. */
export const MENSAJES_CONFIGURACION = {
  revisarDatos: "Revisa los datos ingresados.",
  nombreNegocioObligatorio: "Ingresa el nombre del negocio.",
  nombreNegocioLargo: "El nombre del negocio es demasiado largo.",
  topeObligatorio: "Ingresa el tope de tasa mensual.",
  topeFormato: "Tasa inválida. Usa hasta 4 decimales, por ejemplo 3 o 2,5.",
  topeRango: "El tope debe ser mayor a 0 y de hasta 100 %.",
  nombrePlantillaObligatorio: "Ingresa el nombre de la plantilla.",
  nombrePlantillaLargo: "El nombre de la plantilla es demasiado largo.",
  nombrePlantillaDuplicado: "Ya hay una plantilla activa con ese nombre.",
  plantillaNoEncontrada: "No encontramos esta plantilla. Puede que el enlace sea incorrecto.",
  plantillaYaActiva: "La plantilla ya está activa.",
  plantillaYaInactiva: "La plantilla ya está desactivada.",
  fechaInvalida: "Elige una fecha válida.",
  descripcionObligatoria: "Ingresa una descripción, por ejemplo «Año Nuevo».",
  descripcionLarga: "La descripción es demasiado larga.",
  feriadoDuplicado: "Ya registraste un feriado en esa fecha.",
  feriadoNoEncontrado: "Ese feriado ya no está en la lista.",
  errorGuardar: "No pudimos guardar los cambios. Inténtalo de nuevo en unos minutos.",
  exitoGuardar: "Cambios guardados.",
  exitoCrearPlantilla: "Plantilla creada.",
  exitoActivar: "Plantilla activada.",
  exitoDesactivar: "Plantilla desactivada.",
  exitoAgregarFeriado: "Feriado agregado.",
  exitoQuitarFeriado: "Feriado quitado.",
  sinCambios: "No hay cambios para guardar.",
} as const

const M = MENSAJES_CONFIGURACION

export const esquemaDatosNegocio = z.object({
  nombre: z.string().trim().min(1, M.nombreNegocioObligatorio).max(120, M.nombreNegocioLargo),
})
export type EntradaDatosNegocio = z.input<typeof esquemaDatosNegocio>

export const esquemaTope = z.object({
  tope: z.string().transform((texto, contexto) => {
    const agregar = (message: string) => {
      contexto.addIssue({ code: "custom", message })
      return z.NEVER
    }
    if (texto.trim() === "") return agregar(M.topeObligatorio)
    const tope = parsearTasa(texto)
    if (tope === null) return agregar(M.topeFormato)
    const valor = aDecimal(tope)
    if (valor.lessThanOrEqualTo(0) || valor.greaterThan(100)) return agregar(M.topeRango)
    return tope
  }),
})
export type EntradaTope = z.input<typeof esquemaTope>

const nombrePlantilla = z
  .string()
  .transform((texto) => texto.trim().replace(/\s+/g, " "))
  .pipe(z.string().min(1, M.nombrePlantillaObligatorio).max(60, M.nombrePlantillaLargo))

export const esquemaFormularioPlantilla = z.object({
  nombre: nombrePlantilla,
  condiciones: esquemaFormularioCondiciones,
})

/** Mismo formulario que la plantilla, sin nombre: las condiciones por defecto del negocio. */
export const esquemaFormularioDefecto = z.object({
  nombre: z.string(),
  condiciones: esquemaFormularioCondiciones,
})

export type EntradaFormularioPlantilla = z.input<typeof esquemaFormularioPlantilla>
export type DatosFormularioPlantilla = z.output<typeof esquemaFormularioPlantilla>

export const esquemaFeriado = z.object({
  fecha: z.string().trim().refine(esFechaNegocio, M.fechaInvalida),
  descripcion: z.string().trim().min(1, M.descripcionObligatoria).max(100, M.descripcionLarga),
})
export type EntradaFeriado = z.input<typeof esquemaFeriado>

export const esquemaId = z.uuid()

const ANIO_MINIMO = 2000
const ANIO_MAXIMO = 2100

/** Año del parámetro ?anio= de la lista de feriados; si no es válido, el año actual del negocio. */
export function anioDeParametro(valor: string | string[] | undefined, anioActual: number): number {
  if (typeof valor !== "string" || !/^\d{4}$/.test(valor)) return anioActual
  const anio = Number.parseInt(valor, 10)
  return anio >= ANIO_MINIMO && anio <= ANIO_MAXIMO ? anio : anioActual
}
