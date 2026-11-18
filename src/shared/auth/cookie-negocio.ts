import "server-only"
import { cookies } from "next/headers"
import { COOKIE_NEGOCIO_ACTIVO } from "./seleccion-negocio"

const UN_ANIO = 60 * 60 * 24 * 365

/** Guarda el negocio elegido. Solo desde Server Actions; obtenerContexto lo valida en cada solicitud. */
export async function guardarNegocioActivo(negocioId: string): Promise<void> {
  ;(await cookies()).set(COOKIE_NEGOCIO_ACTIVO, negocioId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UN_ANIO,
  })
}
