"use client"

import { useEffect } from "react"
import { EstadoError } from "@/shared/componentes/estado-vista"
import { Button } from "@/shared/ui/button"

export default function ErrorPanel({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <EstadoError
      titulo="No pudimos cargar esta pantalla"
      descripcion="Revisa tu conexión a internet e inténtalo de nuevo."
      accion={
        <Button variant="outline" onClick={() => retry()}>
          Reintentar
        </Button>
      }
    />
  )
}
