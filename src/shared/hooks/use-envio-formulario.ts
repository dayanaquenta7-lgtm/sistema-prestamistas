"use client"

import { useState, useTransition } from "react"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import type { Resultado } from "@/shared/lib/resultado"

interface OpcionesEnvio<R> {
  /** Se ejecuta con los datos que devuelve la acción cuando termina bien (por ejemplo, navegar). */
  alExito?: (datos: R) => void
}

/**
 * Envía los datos de un formulario de React Hook Form a una Server Action y
 * vuelca en el formulario los errores por campo que devuelve el servidor.
 */
export function useEnvioFormulario<T extends FieldValues, R = undefined>(
  accion: (datos: T) => Promise<Resultado<R>>,
  setError: UseFormSetError<T>,
  opciones: OpcionesEnvio<R> = {},
) {
  const [enviando, iniciarTransicion] = useTransition()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [exitoso, setExitoso] = useState(false)

  function enviar(datos: T) {
    setErrorGeneral(null)
    iniciarTransicion(async () => {
      const resultado = await accion(datos)
      if (resultado.ok) {
        setExitoso(true)
        opciones.alExito?.(resultado.datos)
        return
      }
      const campos = Object.entries(resultado.erroresCampo ?? {})
      for (const [campo, mensajes] of campos) {
        setError(campo as Path<T>, { type: "server", message: mensajes[0] })
      }
      if (campos.length === 0) setErrorGeneral(resultado.error)
    })
  }

  return { enviar, enviando, errorGeneral, exitoso }
}
