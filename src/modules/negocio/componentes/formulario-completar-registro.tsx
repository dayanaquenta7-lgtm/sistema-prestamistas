"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { completarRegistro } from "../acciones/acceso"
import { esquemaCompletarRegistro, type DatosCompletarRegistro } from "../esquemas/acceso"

export function FormularioCompletarRegistro({ valoresIniciales }: { valoresIniciales: DatosCompletarRegistro }) {
  const { register, handleSubmit, setError, formState } = useForm<DatosCompletarRegistro>({
    resolver: zodResolver(esquemaCompletarRegistro),
    defaultValues: valoresIniciales,
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(completarRegistro, setError)
  const { errors } = formState

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <CampoFormulario id="nombre" etiqueta="Tu nombre" error={errors.nombre?.message}>
        <Input
          id="nombre"
          autoComplete="name"
          aria-invalid={Boolean(errors.nombre)}
          aria-describedby={idDescripcion("nombre")}
          {...register("nombre")}
        />
      </CampoFormulario>

      <CampoFormulario id="nombreNegocio" etiqueta="Nombre del negocio" error={errors.nombreNegocio?.message}>
        <Input
          id="nombreNegocio"
          autoComplete="organization"
          aria-invalid={Boolean(errors.nombreNegocio)}
          aria-describedby={idDescripcion("nombreNegocio")}
          {...register("nombreNegocio")}
        />
      </CampoFormulario>

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Creando negocio…" : "Crear negocio"}
      </Button>
    </form>
  )
}
