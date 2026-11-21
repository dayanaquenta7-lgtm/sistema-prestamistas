"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import {
  DIAS_SEMANA,
  ETIQUETAS_COMISION,
  ETIQUETAS_DIA,
  ETIQUETAS_FRECUENCIA,
  ETIQUETAS_METODO,
  ETIQUETAS_MODALIDAD,
  ETIQUETAS_MORA,
  ETIQUETAS_PERIODO,
  ETIQUETAS_REDONDEO,
  FRECUENCIAS_PAGO,
  METODOS_INTERES,
  MODALIDADES_COMISION,
  PERIODOS_TASA,
  REDONDEOS_CUOTA,
  TIPOS_COMISION,
  TIPOS_MORA,
} from "@/modules/prestamos"
import { Aviso } from "@/shared/componentes/aviso"
import { CampoFormulario, idDescripcion } from "@/shared/componentes/campo-formulario"
import { Casilla } from "@/shared/componentes/casilla"
import { opcionesDe, Selector } from "@/shared/componentes/selector"
import { useEnvioFormulario } from "@/shared/hooks/use-envio-formulario"
import type { Resultado } from "@/shared/lib/resultado"
import { Button, buttonVariants } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import {
  esquemaFormularioDefecto,
  esquemaFormularioPlantilla,
  MENSAJES_CONFIGURACION as M,
  type DatosFormularioPlantilla,
  type EntradaFormularioPlantilla,
} from "../esquemas/configuracion"

type Modo = "defecto" | "crear-plantilla" | "editar-plantilla"

interface FormularioCondicionesProps {
  modo: Modo
  valoresIniciales: EntradaFormularioPlantilla
  accion: (datos: EntradaFormularioPlantilla) => Promise<Resultado<unknown>>
  hrefCancelar?: string
}

const TEXTO_BOTON: Record<Modo, string> = {
  defecto: "Guardar condiciones",
  "crear-plantilla": "Crear plantilla",
  "editar-plantilla": "Guardar cambios",
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="mb-1 text-base font-semibold">{titulo}</legend>
      {children}
    </fieldset>
  )
}

function CampoPorcentaje(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Input inputMode="decimal" autoComplete="off" className="pr-8 text-right tabular-nums" {...props} />
      <span
        className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-sm text-muted-foreground"
        aria-hidden="true"
      >
        %
      </span>
    </div>
  )
}

function CampoBolivianos(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground"
        aria-hidden="true"
      >
        Bs
      </span>
      <Input inputMode="decimal" autoComplete="off" className="pl-9 text-right tabular-nums" {...props} />
    </div>
  )
}

export function FormularioCondiciones({ modo, valoresIniciales, accion, hrefCancelar }: FormularioCondicionesProps) {
  const router = useRouter()
  const esPlantilla = modo !== "defecto"
  const { register, handleSubmit, getValues, setValue, setError, control, formState } = useForm<
    EntradaFormularioPlantilla,
    unknown,
    DatosFormularioPlantilla
  >({
    resolver: zodResolver(esPlantilla ? esquemaFormularioPlantilla : esquemaFormularioDefecto),
    defaultValues: valoresIniciales,
  })
  const { enviar, enviando, errorGeneral } = useEnvioFormulario(accion, setError, {
    alExito: () => {
      toast.success(modo === "crear-plantilla" ? M.exitoCrearPlantilla : M.exitoGuardar)
      if (esPlantilla) router.push("/configuracion/plantillas")
      router.refresh()
    },
  })

  const [metodo, frecuencia, comisionTipo, moraTipo] = useWatch({
    control,
    name: ["condiciones.metodo", "condiciones.frecuencia", "condiciones.comisionTipo", "condiciones.moraTipo"],
  })
  const errores = formState.errors.condiciones ?? {}

  const props = <K extends keyof EntradaFormularioPlantilla["condiciones"]>(campo: K) => {
    const id = `condiciones-${campo}`
    return {
      id,
      "aria-invalid": Boolean(errores[campo]),
      "aria-describedby": idDescripcion(id),
      ...register(`condiciones.${campo}`),
    }
  }

  const propsFrecuencia = props("frecuencia")
  const alEnviar = handleSubmit(() => enviar(getValues()))

  return (
    <form onSubmit={alEnviar} noValidate className="flex max-w-2xl flex-col gap-8">
      {errorGeneral ? <Aviso variante="error">{errorGeneral}</Aviso> : null}

      <Aviso variante="informacion">
        {esPlantilla
          ? "Editar una plantilla no cambia los préstamos ya creados: cada préstamo guarda sus condiciones al desembolsar."
          : "Estas condiciones se usan para precargar las plantillas nuevas. Cambiarlas no modifica las plantillas ni los préstamos que ya existen."}
      </Aviso>

      {esPlantilla ? (
        <CampoFormulario
          id="nombre"
          etiqueta="Nombre de la plantilla"
          error={formState.errors.nombre?.message}
          ayuda="Por ejemplo: Diario 24 días, Mensual 3 %."
        >
          <Input
            id="nombre"
            autoComplete="off"
            aria-invalid={Boolean(formState.errors.nombre)}
            aria-describedby={idDescripcion("nombre")}
            {...register("nombre")}
          />
        </CampoFormulario>
      ) : null}

      <Seccion titulo="Interés">
        <CampoFormulario id="condiciones-metodo" etiqueta="Método de interés" error={errores.metodo?.message}>
          <Selector opciones={opcionesDe(METODOS_INTERES, ETIQUETAS_METODO)} {...props("metodo")} />
        </CampoFormulario>
        {metodo === "monto_fijo" ? (
          <p className="text-sm text-muted-foreground">
            Con monto fijo, el monto a devolver se escribe en el simulador o al crear cada préstamo.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <CampoFormulario id="condiciones-tasaValor" etiqueta="Tasa" error={errores.tasaValor?.message}>
              <CampoPorcentaje {...props("tasaValor")} />
            </CampoFormulario>
            <CampoFormulario
              id="condiciones-tasaPeriodo"
              etiqueta="Período de la tasa"
              error={errores.tasaPeriodo?.message}
            >
              <Selector opciones={opcionesDe(PERIODOS_TASA, ETIQUETAS_PERIODO)} {...props("tasaPeriodo")} />
            </CampoFormulario>
          </div>
        )}
      </Seccion>

      <Seccion titulo="Cuotas">
        <div className="grid gap-4 md:grid-cols-2">
          <CampoFormulario id="condiciones-frecuencia" etiqueta="Frecuencia de pago" error={errores.frecuencia?.message}>
            <Selector
              opciones={opcionesDe(FRECUENCIAS_PAGO, ETIQUETAS_FRECUENCIA)}
              {...propsFrecuencia}
              onChange={(evento) => {
                void propsFrecuencia.onChange(evento)
                // Pago único implica una sola cuota (regla de coherencia).
                if (evento.target.value === "pago_unico") setValue("condiciones.numeroCuotas", "1")
              }}
            />
          </CampoFormulario>
          {frecuencia === "pago_unico" ? null : (
            <CampoFormulario
              id="condiciones-numeroCuotas"
              etiqueta="Número de cuotas"
              error={errores.numeroCuotas?.message}
              ayuda="Entre 1 y 730."
            >
              <Input inputMode="numeric" autoComplete="off" className="text-right tabular-nums" {...props("numeroCuotas")} />
            </CampoFormulario>
          )}
        </div>
        <CampoFormulario
          id="condiciones-redondeo"
          etiqueta="Redondeo de la cuota"
          error={errores.redondeo?.message}
          ayuda="La diferencia se ajusta en la última cuota."
        >
          <Selector opciones={opcionesDe(REDONDEOS_CUOTA, ETIQUETAS_REDONDEO)} {...props("redondeo")} />
        </CampoFormulario>
      </Seccion>

      <Seccion titulo="Comisión">
        <CampoFormulario id="condiciones-comisionTipo" etiqueta="Tipo de comisión" error={errores.comisionTipo?.message}>
          <Selector opciones={opcionesDe(TIPOS_COMISION, ETIQUETAS_COMISION)} {...props("comisionTipo")} />
        </CampoFormulario>
        {comisionTipo === "ninguna" ? null : (
          <div className="grid gap-4 md:grid-cols-2">
            <CampoFormulario
              id="condiciones-comisionValor"
              etiqueta={comisionTipo === "porcentaje" ? "Porcentaje" : "Monto"}
              error={errores.comisionValor?.message}
            >
              {comisionTipo === "porcentaje" ? (
                <CampoPorcentaje {...props("comisionValor")} />
              ) : (
                <CampoBolivianos {...props("comisionValor")} />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="condiciones-comisionModalidad"
              etiqueta="Cómo se cobra"
              error={errores.comisionModalidad?.message}
            >
              <Selector opciones={opcionesDe(MODALIDADES_COMISION, ETIQUETAS_MODALIDAD)} {...props("comisionModalidad")} />
            </CampoFormulario>
          </div>
        )}
      </Seccion>

      <Seccion titulo="Mora">
        <CampoFormulario
          id="condiciones-moraTipo"
          etiqueta="Tipo de mora"
          error={errores.moraTipo?.message}
          ayuda="La mora se calcula solo sobre el capital vencido, nunca sobre intereses."
        >
          <Selector opciones={opcionesDe(TIPOS_MORA, ETIQUETAS_MORA)} {...props("moraTipo")} />
        </CampoFormulario>
        {moraTipo === "ninguna" ? null : (
          <div className="grid gap-4 md:grid-cols-2">
            <CampoFormulario
              id="condiciones-moraValor"
              etiqueta={moraTipo === "porcentaje_diario" ? "Porcentaje diario" : "Monto"}
              error={errores.moraValor?.message}
              ayuda={moraTipo === "porcentaje_diario" ? "Hasta 5 % por día." : undefined}
            >
              {moraTipo === "porcentaje_diario" ? (
                <CampoPorcentaje {...props("moraValor")} />
              ) : (
                <CampoBolivianos {...props("moraValor")} />
              )}
            </CampoFormulario>
            <CampoFormulario
              id="condiciones-moraDiasGracia"
              etiqueta="Días de gracia"
              error={errores.moraDiasGracia?.message}
            >
              <Input inputMode="numeric" autoComplete="off" className="text-right tabular-nums" {...props("moraDiasGracia")} />
            </CampoFormulario>
          </div>
        )}
      </Seccion>

      <Seccion titulo="Días de cobro">
        <Controller
          control={control}
          name="condiciones.diasNoCobrables"
          render={({ field }) => (
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Días no cobrables</p>
              <div className="grid grid-cols-2 gap-x-4 md:grid-cols-4">
                {DIAS_SEMANA.map((dia) => (
                  <Casilla
                    key={dia}
                    id={`dia-${dia}`}
                    etiqueta={ETIQUETAS_DIA[dia]}
                    checked={field.value.includes(dia)}
                    onChange={(evento) =>
                      field.onChange(
                        evento.target.checked ? [...field.value, dia] : field.value.filter((d) => d !== dia),
                      )
                    }
                  />
                ))}
              </div>
              {errores.diasNoCobrables?.message ? (
                <p className="text-sm text-destructive">{errores.diasNoCobrables.message}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Si una cuota cae en uno de estos días, pasa al siguiente día de cobro.</p>
              )}
            </div>
          )}
        />
        <Casilla
          id="condiciones-omitirFeriados"
          etiqueta="No cobrar en feriados"
          descripcion="Usa la lista de feriados del negocio."
          {...register("condiciones.omitirFeriados")}
        />
      </Seccion>

      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">
        {hrefCancelar ? (
          <Link href={hrefCancelar} className={buttonVariants({ variant: "outline" })}>
            Cancelar
          </Link>
        ) : null}
        <Button type="submit" disabled={enviando}>
          {enviando ? "Guardando…" : TEXTO_BOTON[modo]}
        </Button>
      </div>
    </form>
  )
}
