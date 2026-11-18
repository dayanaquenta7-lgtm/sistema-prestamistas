// API pública del módulo de préstamos para otros módulos (CLAUDE.md, sección 4).
export * from "./dominio/condiciones"
export { MENSAJES_CONDICIONES, reglasCondiciones } from "./dominio/reglas-condiciones"
export {
  aEntradaFormulario,
  esquemaCondicionesPlantilla,
  esquemaFormularioCondiciones,
  leerCondiciones,
  type EntradaFormularioCondiciones,
} from "./esquemas/condiciones"
