import { puedeVerSeccion, type Rol } from "@/shared/auth/permisos"

export type IdSeccion =
  | "cobrar-hoy"
  | "inicio"
  | "clientes"
  | "prestamos"
  | "simulador"
  | "caja"
  | "configuracion"
  | "auditoria"

export interface Seccion {
  id: IdSeccion
  titulo: string
  ruta: string
  /** Aparece en la barra inferior del celular; el resto va en "Más". */
  principalMovil: boolean
}

/** Secciones del MVP en el orden del menú (docs/alcance.md, sección 2). */
export const SECCIONES: readonly Seccion[] = [
  { id: "cobrar-hoy", titulo: "Cobrar hoy", ruta: "/cobrar-hoy", principalMovil: true },
  { id: "inicio", titulo: "Inicio", ruta: "/inicio", principalMovil: false },
  { id: "clientes", titulo: "Clientes", ruta: "/clientes", principalMovil: true },
  { id: "prestamos", titulo: "Préstamos", ruta: "/prestamos", principalMovil: true },
  { id: "simulador", titulo: "Simulador", ruta: "/simulador", principalMovil: false },
  { id: "caja", titulo: "Caja", ruta: "/caja", principalMovil: true },
  { id: "configuracion", titulo: "Configuración", ruta: "/configuracion", principalMovil: false },
  { id: "auditoria", titulo: "Auditoría", ruta: "/auditoria", principalMovil: false },
]

export function seccionesVisibles(rol: Rol): Seccion[] {
  return SECCIONES.filter((seccion) => puedeVerSeccion(rol, seccion.id))
}

/** La sección activa es la que coincide con la ruta o es su prefijo. */
export function esSeccionActiva(seccion: Seccion, rutaActual: string): boolean {
  return rutaActual === seccion.ruta || rutaActual.startsWith(`${seccion.ruta}/`)
}
