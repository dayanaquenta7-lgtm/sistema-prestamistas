export type Rol = "dueno" | "ayudante"

/** Secciones del panel que solo ve el dueño (docs/alcance.md, sección 1). */
const SOLO_DUENO = new Set<string>(["inicio", "configuracion", "auditoria"])

export function puedeVerSeccion(rol: Rol, seccion: string): boolean {
  return rol === "dueno" || !SOLO_DUENO.has(seccion)
}

export function cumpleRol(rolActual: Rol, rolRequerido: Rol): boolean {
  return rolRequerido === "ayudante" || rolActual === "dueno"
}
