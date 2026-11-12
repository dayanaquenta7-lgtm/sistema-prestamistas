"use client"

import { useState, useTransition } from "react"
import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import type { Resultado } from "@/shared/lib/resultado"

/**
 * Envía los datos de un formulario de React Hook Form a una Server Action y
 * vuelca en el formulario los errores por campo que devuelve el servidor.
 */
export function useEnvioFormulario<T extends FieldValues>(
  accion: (datos: T) => Promise<Resultado>,
  setError: UseFormSetError<T>,
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
