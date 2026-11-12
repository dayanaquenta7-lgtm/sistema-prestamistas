"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { restablecerContrasena } from "../acciones/acceso"
import { esquemaRestablecerContrasena, type DatosRestablecerContrasena } from "../esquemas/acceso"

export function FormularioRestablecerContrasena() {
  const { register, handleSubmit, setError, formState } = useForm<DatosRestablecerContrasena>({
    resolver: zodResolver(esquemaRestablecerContrasena),
    defaultValues: { contrasena: "", confirmacion: "" },
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(restablecerContrasena, setError)
  const { errors } = formState

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <CampoFormulario
        id="contrasena"
        etiqueta="Nueva contraseña"
        error={errors.contrasena?.message}
        ayuda="Al menos 8 caracteres."
      >
        <Input
          id="contrasena"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.contrasena)}
          aria-describedby={idDescripcion("contrasena")}
          {...register("contrasena")}
        />
      </CampoFormulario>

      <CampoFormulario id="confirmacion" etiqueta="Repite la contraseña" error={errors.confirmacion?.message}>
        <Input
          id="confirmacion"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmacion)}
          aria-describedby={idDescripcion("confirmacion")}
          {...register("confirmacion")}
        />
      </CampoFormulario>

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  )
}
