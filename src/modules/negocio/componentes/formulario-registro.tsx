"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { registrarse } from "../acciones/acceso"
import { esquemaRegistro, type DatosRegistro } from "../esquemas/acceso"

export function FormularioRegistro() {
  const { register, handleSubmit, setError, formState, getValues } = useForm<DatosRegistro>({
    resolver: zodResolver(esquemaRegistro),
    defaultValues: { nombre: "", nombreNegocio: "", correo: "", contrasena: "", confirmacion: "" },
  })
  const { enviar, enviando, errorGeneral, exitoso } = useEnvioFormulario(registrarse, setError)
  const { errors } = formState

  if (exitoso) {
    return (
      <div className="flex flex-col gap-4">
        <Aviso variante="exito">
          Te enviamos un enlace a <strong className="font-medium">{getValues("correo")}</strong>. Ábrelo
          en este mismo navegador para confirmar tu correo y terminar de crear tu negocio.
        </Aviso>
        <p className="text-sm text-muted-foreground">
          Si no lo ves en unos minutos, revisa la carpeta de correo no deseado o{" "}
          <Link href="/reenviar-confirmacion" className="text-primary underline underline-offset-4">
            reenvía el correo
          </Link>
          .
        </p>
        <Link href="/login" className="text-center text-sm text-primary underline-offset-4 hover:underline">
          Volver a iniciar sesión
        </Link>
      </div>
    )
  }

  const campo = (id: keyof DatosRegistro) => ({
    id,
    "aria-invalid": Boolean(errors[id]),
    "aria-describedby": idDescripcion(id),
    ...register(id),
  })

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-4">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <CampoFormulario id="nombre" etiqueta="Tu nombre" error={errors.nombre?.message}>
        <Input autoComplete="name" {...campo("nombre")} />
      </CampoFormulario>

      <CampoFormulario
        id="nombreNegocio"
        etiqueta="Nombre del negocio"
        error={errors.nombreNegocio?.message}
        ayuda="Aparecerá en recibos y documentos. Puedes cambiarlo después."
      >
        <Input autoComplete="organization" {...campo("nombreNegocio")} />
      </CampoFormulario>

      <CampoFormulario id="correo" etiqueta="Correo" error={errors.correo?.message}>
        <Input type="email" autoComplete="email" inputMode="email" {...campo("correo")} />
      </CampoFormulario>

      <CampoFormulario
        id="contrasena"
        etiqueta="Contraseña"
        error={errors.contrasena?.message}
        ayuda="Al menos 8 caracteres."
      >
        <Input type="password" autoComplete="new-password" {...campo("contrasena")} />
      </CampoFormulario>

      <CampoFormulario id="confirmacion" etiqueta="Repite la contraseña" error={errors.confirmacion?.message}>
        <Input type="password" autoComplete="new-password" {...campo("confirmacion")} />
      </CampoFormulario>

      <Button type="submit" disabled={enviando} className="w-full">
        {enviando ? "Creando cuenta…" : "Crear cuenta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
