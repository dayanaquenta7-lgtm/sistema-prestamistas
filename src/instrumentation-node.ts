import { env } from "@/shared/env"

// Next registra el error de register() pero deja el servidor levantado; se termina el proceso
// para que no atienda solicitudes sin una variable obligatoria (por ejemplo URL_APP en producción).
try {
  env()
} catch (error) {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
}
