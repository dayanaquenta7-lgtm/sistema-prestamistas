"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition, type ComponentProps } from "react"
import { toast } from "sonner"
import type { Resultado } from "@/shared/lib/resultado"
import { Button } from "@/shared/ui/button"

interface BotonAccionProps {
  /** Server Action ya enlazada a sus argumentos. */
  accion: () => Promise<Resultado<unknown>>
  texto: string
  mensajeExito: string
  /** Si se indica, pide confirmación en línea antes de ejecutar. */
  confirmacion?: { pregunta: string; textoConfirmar: string }
  variante?: ComponentProps<typeof Button>["variant"]
  className?: string
}

/** Ejecuta una acción sin formulario, muestra el resultado y refresca la página. */
export function BotonAccion({
  accion,
  texto,
  mensajeExito,
  confirmacion,
  variante = "outline",
  className,
}: BotonAccionProps) {
  const router = useRouter()
  const [enviando, iniciarTransicion] = useTransition()
  const [confirmando, setConfirmando] = useState(false)

  function ejecutar() {
    iniciarTransicion(async () => {
      const resultado = await accion()
      setConfirmando(false)
      if (!resultado.ok) {
        toast.error(resultado.error)
        return
      }
      toast.success(mensajeExito)
      router.refresh()
    })
  }

  if (confirmacion && confirmando) {
    return (
      <div role="group" aria-label={confirmacion.pregunta} className="flex flex-col gap-2 md:items-end">
        <p className="text-sm">{confirmacion.pregunta}</p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setConfirmando(false)} disabled={enviando}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={ejecutar} disabled={enviando}>
            {enviando ? "Guardando…" : confirmacion.textoConfirmar}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button
      type="button"
      variant={variante}
      className={className}
      disabled={enviando}
      onClick={confirmacion ? () => setConfirmando(true) : ejecutar}
    >
      {enviando ? "Guardando…" : texto}
    </Button>
  )
}
