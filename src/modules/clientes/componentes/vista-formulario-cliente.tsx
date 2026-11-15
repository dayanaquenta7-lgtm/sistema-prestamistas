import { notFound } from "next/navigation"
import { obtenerContexto } from "@/shared/auth/sesion"
import { EncabezadoPagina } from "@/shared/componentes/encabezado-pagina"
import { crearCliente, editarCliente } from "../acciones/clientes"
import { obtenerCliente } from "../consultas/clientes"
import { formatearTasa } from "../dominio/normalizar"
import { puedeGestionarCondiciones } from "../dominio/reglas-cliente"
import { ENTRADA_CLIENTE_VACIA, esquemaIdCliente, type EntradaCliente } from "../esquemas/cliente"
import { FormularioCliente } from "./formulario-cliente"

export async function VistaNuevoCliente() {
  const { rol } = await obtenerContexto()
  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Registrar cliente"
        migas={[{ titulo: "Clientes", href: "/clientes" }, { titulo: "Registrar cliente" }]}
      />
      <FormularioCliente
        modo="crear"
        valoresIniciales={ENTRADA_CLIENTE_VACIA}
        puedeEditarTasa={puedeGestionarCondiciones(rol)}
        accion={crearCliente}
        hrefCancelar="/clientes"
      />
    </div>
  )
}

export async function VistaEditarCliente({ id }: { id: string }) {
  const idValido = esquemaIdCliente.safeParse(id)
  if (!idValido.success) notFound()

  const { negocio, rol } = await obtenerContexto()
  const cliente = await obtenerCliente(negocio.id, idValido.data)
  if (!cliente) notFound()

  const tasa = cliente.tasaPreferencial ? formatearTasa(cliente.tasaPreferencial) : null
  const valoresIniciales: EntradaCliente = {
    nombreCompleto: cliente.nombreCompleto,
    ci: cliente.ci ?? "",
    telefono: cliente.telefono ?? "",
    direccion: cliente.direccion ?? "",
    referenciaNombre: cliente.referenciaNombre ?? "",
    referenciaTelefono: cliente.referenciaTelefono ?? "",
    notas: cliente.notas ?? "",
    tasaPreferencial: tasa ?? "",
  }

  return (
    <div className="flex flex-col gap-6">
      <EncabezadoPagina
        titulo="Editar cliente"
        migas={[
          { titulo: "Clientes", href: "/clientes" },
          { titulo: cliente.nombreCompleto, href: `/clientes/${cliente.id}` },
          { titulo: "Editar" },
        ]}
      />
      <FormularioCliente
        modo="editar"
        valoresIniciales={valoresIniciales}
        puedeEditarTasa={puedeGestionarCondiciones(rol)}
        tasaActualTexto={tasa}
        accion={editarCliente.bind(null, cliente.id)}
        hrefCancelar={`/clientes/${cliente.id}`}
      />
    </div>
  )
}
