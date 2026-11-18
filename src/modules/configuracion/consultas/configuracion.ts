import "server-only"
import { and, asc, desc, eq, gte, lte } from "drizzle-orm"
import { leerCondiciones, resumirCondiciones, type CondicionesPlantilla } from "@/modules/prestamos"
import { db } from "@/shared/db/cliente"
import { feriados, negocios, plantillasPrestamo } from "@/shared/db/schema"

// Todas las consultas reciben el negocio de la sesión (obtenerContexto), nunca uno enviado por el cliente.

export interface ConfiguracionNegocio {
  nombre: string
  moneda: string
  zonaHoraria: string
  topeTasaMensual: string
  /** Null si el dueño aún no guardó las suyas (o si lo guardado no es válido). */
  condicionesDefecto: CondicionesPlantilla | null
}

function condicionesValidas(valor: unknown, origen: string): CondicionesPlantilla | null {
  if (valor === null) return null
  const condiciones = leerCondiciones(valor)
  if (!condiciones) console.error(`[configuracion] Condiciones guardadas inválidas en ${origen}`)
  return condiciones
}

export async function obtenerConfiguracionNegocio(negocioId: string): Promise<ConfiguracionNegocio | null> {
  const [fila] = await db()
    .select({
      nombre: negocios.nombre,
      moneda: negocios.moneda,
      zonaHoraria: negocios.zonaHoraria,
      topeTasaMensual: negocios.topeTasaMensual,
      condicionesDefecto: negocios.condicionesDefecto,
    })
    .from(negocios)
    .where(eq(negocios.id, negocioId))
    .limit(1)
  if (!fila) return null
  return { ...fila, condicionesDefecto: condicionesValidas(fila.condicionesDefecto, `el negocio ${negocioId}`) }
}

export interface PlantillaListado {
  id: string
  nombre: string
  activa: boolean
  resumen: string
}

export async function listarPlantillas(negocioId: string): Promise<PlantillaListado[]> {
  const filas = await db()
    .select({
      id: plantillasPrestamo.id,
      nombre: plantillasPrestamo.nombre,
      activa: plantillasPrestamo.activa,
      condiciones: plantillasPrestamo.condiciones,
    })
    .from(plantillasPrestamo)
    .where(eq(plantillasPrestamo.negocioId, negocioId))
    .orderBy(desc(plantillasPrestamo.activa), asc(plantillasPrestamo.nombre))
  return filas.map(({ condiciones, ...fila }) => {
    const validas = condicionesValidas(condiciones, `la plantilla ${fila.id}`)
    return { ...fila, resumen: validas ? resumirCondiciones(validas) : "Condiciones por revisar" }
  })
}

export interface PlantillaDetalle {
  id: string
  nombre: string
  activa: boolean
  condiciones: CondicionesPlantilla | null
}

export async function obtenerPlantilla(negocioId: string, id: string): Promise<PlantillaDetalle | null> {
  const [fila] = await db()
    .select({
      id: plantillasPrestamo.id,
      nombre: plantillasPrestamo.nombre,
      activa: plantillasPrestamo.activa,
      condiciones: plantillasPrestamo.condiciones,
    })
    .from(plantillasPrestamo)
    .where(and(eq(plantillasPrestamo.id, id), eq(plantillasPrestamo.negocioId, negocioId)))
    .limit(1)
  if (!fila) return null
  return { ...fila, condiciones: condicionesValidas(fila.condiciones, `la plantilla ${fila.id}`) }
}

export interface Feriado {
  id: string
  fecha: string
  descripcion: string
}

export async function listarFeriados(negocioId: string, anio: number): Promise<Feriado[]> {
  return db()
    .select({ id: feriados.id, fecha: feriados.fecha, descripcion: feriados.descripcion })
    .from(feriados)
    .where(
      and(
        eq(feriados.negocioId, negocioId),
        gte(feriados.fecha, `${anio}-01-01`),
        lte(feriados.fecha, `${anio}-12-31`),
      ),
    )
    .orderBy(asc(feriados.fecha))
}
