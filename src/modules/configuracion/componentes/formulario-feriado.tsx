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
import { agregarFeriado } from "../acciones/feriados"
import { esquemaFeriado, MENSAJES_CONFIGURACION as M, type EntradaFeriado } from "../esquemas/configuracion"

export function FormularioFeriado({ anio }: { anio: number }) {
  const router = useRouter()
  const { register, handleSubmit, getValues, setError, formState, reset } = useForm<EntradaFeriado>({
    resolver: zodResolver(esquemaFeriado),
    defaultValues: { fecha: "", descripcion: "" },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(agregarFeriado, setError, {
    alExito: () => {
      toast.success(M.exitoAgregarFeriado)
      reset()
      router.refresh()
    },
  })
  const { errors } = formState

  return (
    <form
      onSubmit={handleSubmit(() => enviar(getValues()))}
      noValidate
      aria-label="Agregar feriado"
      className="flex flex-col gap-4 rounded-md border p-4"
    >
      <h2 className="text-base font-semibold">Agregar feriado</h2>
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}
      <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
        <CampoFormulario id="fecha" etiqueta="Fecha" error={errors.fecha?.message}>
          <Input
            id="fecha"
            type="date"
            min={`${anio - 1}-01-01`}
            max={`${anio + 1}-12-31`}
            aria-invalid={Boolean(errors.fecha)}
            aria-describedby={idDescripcion("fecha")}
            {...register("fecha")}
          />
        </CampoFormulario>
        <CampoFormulario id="descripcion" etiqueta="Descripción" error={errors.descripcion?.message}>
          <Input
            id="descripcion"
            autoComplete="off"
            placeholder="Por ejemplo: Año Nuevo"
            aria-invalid={Boolean(errors.descripcion)}
            aria-describedby={idDescripcion("descripcion")}
            {...register("descripcion")}
          />
        </CampoFormulario>
      </div>
      <Button type="submit" disabled={enviando} className="md:self-end">
        {enviando ? "Guardando…" : "Agregar feriado"}
      </Button>
    </form>
  )
}
