"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import type { Resultado } from "@/shared/lib/resultado"
import { buttonVariants, Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { esquemaCliente, type DatosCliente, type EntradaCliente } from "../esquemas/cliente"
import { MENSAJES_CLIENTES } from "../mensajes"

interface FormularioClienteProps {
  modo: "crear" | "editar"
  valoresIniciales: EntradaCliente
  /** Solo el dueño ve y edita la tasa preferencial. */
  puedeEditarTasa: boolean
  /** Tasa actual formateada, para mostrarla al ayudante sin permitir cambiarla. */
  tasaActualTexto?: string | null
  accion: (datos: EntradaCliente) => Promise<Resultado<{ id: string }>>
  hrefCancelar: string
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-base font-semibold">{titulo}</legend>
      {children}
    </fieldset>
  )
}

export function FormularioCliente({
  modo,
  valoresIniciales,
  puedeEditarTasa,
  tasaActualTexto,
  accion,
  hrefCancelar,
}: FormularioClienteProps) {
  const router = useRouter()
  const { register, handleSubmit, getValues, setError, formState } = useForm<EntradaCliente, unknown, DatosCliente>({
    resolver: zodResolver(esquemaCliente),
    defaultValues: valoresIniciales,
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(accion, setError, {
    alExito: ({ id }) => {
      toast.success(modo === "crear" ? MENSAJES_CLIENTES.exitoCrear : MENSAJES_CLIENTES.exitoEditar)
      router.push(`/clientes/${id}`)
      router.refresh()
    },
  })
  const { errors } = formState

  // Se valida en el navegador con el mismo esquema y se envían los valores tal como se
  // escribieron: el servidor vuelve a validar y normalizar (CI, tasa, vacíos a null).
  const alEnviar = handleSubmit(() => enviar(getValues()))

  const campoTexto = (id: keyof EntradaCliente) => ({
    id,
    "aria-invalid": Boolean(errors[id]),
    "aria-describedby": idDescripcion(id),
    ...register(id),
  })

  return (
    <form onSubmit={alEnviar} noValidate className="flex max-w-2xl flex-col gap-8">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <Seccion titulo="Datos del cliente">
        <CampoFormulario id="nombreCompleto" etiqueta="Nombre completo" error={errors.nombreCompleto?.message}>
          <Input autoComplete="off" {...campoTexto("nombreCompleto")} />
        </CampoFormulario>
        <div className="grid gap-4 md:grid-cols-2">
          <CampoFormulario
            id="ci"
            etiqueta="CI (opcional)"
            error={errors.ci?.message}
            ayuda="Con extensión si corresponde. Ejemplo: 1234567 LP"
          >
            <Input autoComplete="off" autoCapitalize="characters" {...campoTexto("ci")} />
          </CampoFormulario>
          <CampoFormulario id="telefono" etiqueta="Teléfono (opcional)" error={errors.telefono?.message}>
            <Input type="tel" inputMode="tel" autoComplete="off" {...campoTexto("telefono")} />
          </CampoFormulario>
        </div>
        <CampoFormulario id="direccion" etiqueta="Dirección (opcional)" error={errors.direccion?.message}>
          <Input autoComplete="off" {...campoTexto("direccion")} />
        </CampoFormulario>
      </Seccion>

      <Seccion titulo="Referencia (opcional)">
        <div className="grid gap-4 md:grid-cols-2">
          <CampoFormulario id="referenciaNombre" etiqueta="Nombre" error={errors.referenciaNombre?.message}>
            <Input autoComplete="off" {...campoTexto("referenciaNombre")} />
          </CampoFormulario>
          <CampoFormulario id="referenciaTelefono" etiqueta="Teléfono" error={errors.referenciaTelefono?.message}>
            <Input type="tel" inputMode="tel" autoComplete="off" {...campoTexto("referenciaTelefono")} />
          </CampoFormulario>
        </div>
      </Seccion>

      <Seccion titulo="Otros datos">
        <CampoFormulario id="notas" etiqueta="Notas (opcional)" error={errors.notas?.message}>
          <Textarea {...campoTexto("notas")} />
        </CampoFormulario>
        {puedeEditarTasa ? (
          <CampoFormulario
            id="tasaPreferencial"
            etiqueta="Tasa preferencial (opcional)"
            error={errors.tasaPreferencial?.message}
            ayuda="Porcentaje. Si la dejas vacía, se usa la tasa de la plantilla del préstamo."
          >
            <div className="relative md:max-w-48">
              <Input
                inputMode="decimal"
                autoComplete="off"
                className="pr-8 text-right tabular-nums"
                {...campoTexto("tasaPreferencial")}
              />
              <span
                className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground"
                aria-hidden="true"
              >
                %
              </span>
            </div>
          </CampoFormulario>
        ) : tasaActualTexto ? (
          <p className="text-sm text-muted-foreground">
            Tasa preferencial: <span className="font-medium text-foreground">{tasaActualTexto} %</span>. Solo el dueño
            del negocio puede cambiarla.
          </p>
        ) : null}
      </Seccion>

      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        <Link href={hrefCancelar} className={buttonVariants({ variant: "outline" })}>
          Cancelar
        </Link>
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : modo === "crear" ? "Registrar cliente" : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
