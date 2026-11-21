"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { guardarDatosNegocio, guardarTope } from "../acciones/negocio"
import {
  esquemaDatosNegocio,
  esquemaTope,
  MENSAJES_CONFIGURACION as M,
  type EntradaDatosNegocio,
  type EntradaTope,
} from "../esquemas/configuracion"

export function FormularioDatosNegocio({ nombre }: { nombre: string }) {
  const router = useRouter()
  const { register, handleSubmit, getValues, setError, formState } = useForm<EntradaDatosNegocio>({
    resolver: zodResolver(esquemaDatosNegocio),
    defaultValues: { nombre },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(guardarDatosNegocio, setError, {
    alExito: () => {
      toast.success(M.exitoGuardar)
      router.refresh()
    },
  })
  const error = formState.errors.nombre?.message

  return (
    <form onSubmit={handleSubmit(() => enviar(getValues()))} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}
      <CampoFormulario id="nombre" etiqueta="Nombre del negocio" error={error}>
        <Input
          id="nombre"
          autoComplete="organization"
          aria-invalid={Boolean(error)}
          aria-describedby={idDescripcion("nombre")}
          {...register("nombre")}
        />
      </CampoFormulario>
      <Button type="submit" disabled={enviando} className="md:self-end">
        {enviando ? "Guardando…" : "Guardar nombre"}
      </Button>
    </form>
  )
}

export function FormularioTope({ tope }: { tope: string }) {
  const router = useRouter()
  const { register, handleSubmit, getValues, setError, formState } = useForm<EntradaTope>({
    resolver: zodResolver(esquemaTope),
    defaultValues: { tope },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(guardarTope, setError, {
    alExito: () => {
      toast.success(M.exitoGuardar)
      router.refresh()
    },
  })
  const error = formState.errors.tope?.message

  return (
    <form onSubmit={handleSubmit(() => enviar(getValues()))} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}
      <CampoFormulario
        id="tope"
        etiqueta="Tope de tasa mensual"
        error={error}
        ayuda="Tasa mensual equivalente, con comisiones incluidas. Por defecto, 3 %."
      >
        <div className="relative md:max-w-48">
          <Input
            id="tope"
            inputMode="decimal"
            autoComplete="off"
            className="pr-8 text-right tabular-nums"
            aria-invalid={Boolean(error)}
            aria-describedby={idDescripcion("tope")}
            {...register("tope")}
          />
          <span
            className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground"
            aria-hidden="true"
          >
            %
          </span>
        </div>
      </CampoFormulario>
      <Button type="submit" disabled={enviando} className="md:self-end">
        {enviando ? "Guardando…" : "Guardar tope"}
      </Button>
    </form>
  )
}
