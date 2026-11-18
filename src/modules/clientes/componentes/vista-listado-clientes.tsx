import { Search, UserPlus } from "lucide-react"
import Link from "next/link"
import { obtenerContexto } from "@/shared/auth/sesion"
import { Aviso } from "@/shared/componentes/aviso"
import { EstadoError } from "@/shared/componentes/estado-vista"
import { describirErrorDb } from "@/shared/db/errores"
import { buttonVariants, Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { LIMITE_LISTADO, listarClientes, type ListadoClientes } from "../consultas/clientes"
import { esquemaBusquedaClientes } from "../esquemas/cliente"
import { MENSAJES_CLIENTES } from "../mensajes"
import { TablaClientes } from "./tabla-clientes"

export function BotonRegistrarCliente() {
  return (
    <Link href="/clientes/nuevo" className={buttonVariants()}>
      <UserPlus aria-hidden="true" />
      Registrar cliente
    </Link>
  )
}

/** Formulario GET: funciona sin JavaScript y deja la búsqueda en la URL (?q=). */
function Buscador({ busqueda }: { busqueda: string }) {
  return (
    <form action="/clientes" role="search" className="flex w-full gap-2 md:max-w-md">
      <label htmlFor="q" className="sr-only">
        Buscar por nombre, CI o teléfono
      </label>
      <Input id="q" name="q" type="search" defaultValue={busqueda} placeholder="Nombre, CI o teléfono" />
      <Button type="submit" variant="outline">
        <Search aria-hidden="true" />
        Buscar
      </Button>
    </form>
  )
}

export async function VistaListadoClientes({ q }: { q: unknown }) {
  const { negocio } = await obtenerContexto()
  const busqueda = esquemaBusquedaClientes.parse(q)

  let listado: ListadoClientes
  try {
    listado = await listarClientes(negocio.id, busqueda)
  } catch (error) {
    console.error(`[clientes] Error al listar: ${describirErrorDb(error)}`)
    return (
      <EstadoError
        titulo={MENSAJES_CLIENTES.errorCargarListado}
        descripcion={MENSAJES_CLIENTES.errorCargarDescripcion}
        accion={
          <Link href={busqueda ? `/clientes?q=${encodeURIComponent(busqueda)}` : "/clientes"} className={buttonVariants({ variant: "outline" })}>
            Reintentar
          </Link>
        }
      />
    )
  }

  const vacio = busqueda
    ? {
        titulo: `No encontramos clientes con «${busqueda}»`,
        descripcion: "Revisa lo que escribiste o busca por CI o teléfono.",
        accion: (
          <Link href="/clientes" className={buttonVariants({ variant: "outline" })}>
            Ver todos los clientes
          </Link>
        ),
      }
    : {
        titulo: "Aún no tienes clientes",
        descripcion: "Registra a tu primer cliente para empezar a prestar.",
        accion: <BotonRegistrarCliente />,
      }

  return (
    <div className="flex flex-col gap-3">
      {listado.hayMas ? (
        <Aviso variante="informacion">
          Se muestran los primeros {LIMITE_LISTADO} clientes. Usa el buscador para encontrar a uno en particular.
        </Aviso>
      ) : null}
      <TablaClientes clientes={listado.clientes} filtros={<Buscador busqueda={busqueda} />} vacio={vacio} />
    </div>
  )
}
