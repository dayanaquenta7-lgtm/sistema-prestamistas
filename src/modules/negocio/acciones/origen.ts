import "server-only"
import { headers } from "next/headers"
import { env } from "@/shared/env"

/** En producción URL_APP es obligatoria (esquema de entorno); el origen de la solicitud solo se usa en desarrollo. */
export async function origenApp(): Promise<string> {
  return env().URL_APP ?? (await origenSolicitud())
}

async function origenSolicitud(): Promise<string> {
  const encabezados = await headers()
  return (
    encabezados.get("origin") ??
    `${encabezados.get("x-forwarded-proto") ?? "http"}://${encabezados.get("host") ?? "localhost:3000"}`
  )
}

export async function urlConfirmacion(siguiente: string): Promise<string> {
  return `${await origenApp()}/auth/confirm?next=${encodeURIComponent(siguiente)}`
}
