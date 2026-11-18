import type { Rol } from "@/shared/auth/permisos"
import { calcularCambios, normalizarValor, type ObjetoJson } from "@/shared/lib/auditoria"
import { tasasIguales } from "./normalizar"

/** Campos del cliente que se guardan desde el formulario (en su forma normalizada). */
export interface CamposCliente {
  nombreCompleto: string
  ci: string | null
  telefono: string | null
  direccion: string | null
  referenciaNombre: string | null
  referenciaTelefono: string | null
  notas: string | null
  /** Tasa canónica con 4 decimales ("2.5000") o null. */
  tasaPreferencial: string | null
}

/**
 * Tasa preferencial y marca "no prestar": solo el dueño (pedido del Sprint 1; en
 * docs/alcance.md, sección 1, el ayudante crea y edita clientes pero no define condiciones).
 */
export function puedeGestionarCondiciones(rol: Rol): boolean {
  return rol === "dueno"
}

/** Un ayudante no puede definir ni cambiar la tasa preferencial (al crear, anterior es null). */
export function cambioDeTasaPermitido(rol: Rol, anterior: string | null, nueva: string | null): boolean {
  return puedeGestionarCondiciones(rol) || tasasIguales(anterior, nueva)
}

export interface RegistroPlanificado {
  accion: "cliente.editar" | "cliente.cambiar_tasa"
  valorAnterior: ObjetoJson
  valorNuevo: ObjetoJson
}

function sinTasa(campos: CamposCliente): ObjetoJson {
  const resto: Partial<CamposCliente> = { ...campos }
  delete resto.tasaPreferencial
  return normalizarValor(resto) as ObjetoJson
}

/**
 * Auditoría de una edición (docs/alcance.md, 2.7): un registro "cliente.editar" con
 * solo los campos que cambiaron y, aparte, "cliente.cambiar_tasa" si cambió la tasa.
 * Sin cambios, no se registra nada.
 */
export function planificarAuditoriaEdicion(anterior: CamposCliente, nuevo: CamposCliente): RegistroPlanificado[] {
  const registros: RegistroPlanificado[] = []

  const cambios = calcularCambios(sinTasa(anterior), sinTasa(nuevo))
  if (Object.keys(cambios.nuevo).length > 0) {
    registros.push({ accion: "cliente.editar", valorAnterior: cambios.anterior, valorNuevo: cambios.nuevo })
  }

  if (!tasasIguales(anterior.tasaPreferencial, nuevo.tasaPreferencial)) {
    registros.push({
      accion: "cliente.cambiar_tasa",
      valorAnterior: { tasaPreferencial: anterior.tasaPreferencial },
      valorNuevo: { tasaPreferencial: nuevo.tasaPreferencial },
    })
  }

  return registros
}
