"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { marcarNoPrestar, quitarNoPrestar } from "../acciones/clientes"
import { esquemaMarcarNoPrestar, type EntradaNoPrestar } from "../esquemas/cliente"
import { MENSAJES_CLIENTES } from "../mensajes"

/** Solo se muestra al dueño; el servidor vuelve a verificar el rol en cada acción. */
export function ControlNoPrestar({ clienteId, noPrestar }: { clienteId: string; noPrestar: boolean }) {
  return noPrestar ? <QuitarNoPrestar clienteId={clienteId} /> : <MarcarNoPrestar clienteId={clienteId} />
}

function MarcarNoPrestar({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const { register, handleSubmit, setError, formState, reset } = useForm<EntradaNoPrestar>({
    resolver: zodResolver(esquemaMarcarNoPrestar),
    defaultValues: { motivo: "" },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(
    (datos: EntradaNoPrestar) => marcarNoPrestar(clienteId, datos),
    setError,
    {
      alExito: () => {
        toast.success(MENSAJES_CLIENTES.exitoMarcarNoPrestar)
        setAbierto(false)
        reset()
        router.refresh()
      },
    },
  )

  if (!abierto) {
    return (
      <Button variant="outline" onClick={() => setAbierto(true)}>
        Marcar como no prestar
      </Button>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      className="flex flex-col gap-3 rounded-md border p-4"
      aria-label="Marcar como no prestar"
    >
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}
      <CampoFormulario
        id="motivo"
        etiqueta="Motivo"
        error={formState.errors.motivo?.message}
        ayuda="Por ejemplo: no pagó el último préstamo. Queda registrado en la auditoría."
      >
        <Textarea
          id="motivo"
          autoFocus
          aria-invalid={Boolean(formState.errors.motivo)}
          aria-describedby={idDescripcion("motivo")}
          {...register("motivo")}
        />
      </CampoFormulario>
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setAbierto(false)
            reset()
          }}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="destructive" disabled={enviando}>
          {enviando ? "Guardando…" : "Confirmar: no prestar"}
        </Button>
      </div>
    </form>
  )
}

function QuitarNoPrestar({ clienteId }: { clienteId: string }) {
  const router = useRouter()
  const [enviando, iniciarTransicion] = useTransition()
  const [error, setErrorEstado] = useState<string | null>(null)

  function quitar() {
    setErrorEstado(null)
    iniciarTransicion(async () => {
      const resultado = await quitarNoPrestar(clienteId)
      if (!resultado.ok) {
        setErrorEstado(resultado.error)
        return
      }
      toast.success(MENSAJES_CLIENTES.exitoQuitarNoPrestar)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-2">
      {error ? <Aviso variante="error">{error}</Aviso> : null}
      <Button variant="outline" onClick={quitar} disabled={enviando} className="md:self-start">
        {enviando ? "Guardando…" : "Quitar marca de no prestar"}
      </Button>
    </div>
  )
}
