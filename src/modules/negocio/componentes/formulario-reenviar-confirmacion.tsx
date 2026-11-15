"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { reenviarConfirmacion } from "../acciones/acceso"
import { esquemaReenviarConfirmacion, type DatosReenviarConfirmacion } from "../esquemas/acceso"

export function FormularioReenviarConfirmacion() {
  const { register, handleSubmit, setError, formState } = useForm<DatosReenviarConfirmacion>({
    resolver: zodResolver(esquemaReenviarConfirmacion),
    defaultValues: { correo: "" },
  })
  const { enviar, enviando, errorGeneral, exitoso } = useEnvioFormulario(reenviarConfirmacion, setError)
  const { errors } = formState

  if (exitoso) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso variante="exito">
          Si hay una cuenta pendiente de confirmar con ese correo, te enviamos un enlace nuevo. Ábrelo en este
          mismo navegador.
        </Aviso>
        <p className="text-sm text-muted-foreground">
          Si no lo ves en unos minutos, revisa la carpeta de correo no deseado.
        </p>
        <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <CampoFormulario id="correo" etiqueta="Correo" error={errors.correo?.message}>
        <Input
          id="correo"
          type="email"
          autoComplete="email"
          inputMode="email"
          aria-invalid={Boolean(errors.correo)}
          aria-describedby={idDescripcion("correo")}
          {...register("correo")}
        />
      </CampoFormulario>

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Enviando…" : "Reenviar correo"}
      </Button>

      <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
        Volver a iniciar sesión
      </Link>
    </form>
  )
}
