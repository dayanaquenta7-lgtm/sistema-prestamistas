import { describe, expect, it } from "vitest"
import { esquemaEnv } from "./esquema-env"

const base = {
  NEXT_PUBLIC_SUPABASE_URL: "https://proyecto.supabase.co",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "clave",
  DATABASE_URL: "postgres://localhost/db",
}

describe("esquemaEnv", () => {
  it("permite omitir URL_APP en desarrollo", () => {
    const resultado = esquemaEnv.safeParse({ ...base, NODE_ENV: "development" })
    expect(resultado.success).toBe(true)
    expect(resultado.data?.URL_APP).toBeUndefined()
  })

  it("exige URL_APP en producción", () => {
    const resultado = esquemaEnv.safeParse({ ...base, NODE_ENV: "production" })
    expect(resultado.success).toBe(false)
    expect(resultado.error?.issues.map((issue) => issue.path.join("."))).toEqual(["URL_APP"])
  })

  it("acepta URL_APP en producción y quita la barra final", () => {
    const resultado = esquemaEnv.safeParse({ ...base, NODE_ENV: "production", URL_APP: "https://app.ejemplo.pe/" })
    expect(resultado.data?.URL_APP).toBe("https://app.ejemplo.pe")
  })

  it.each(["no-es-url", "javascript:alert(1)", "ftp://app.ejemplo.pe"])("rechaza URL_APP %j", (URL_APP) => {
    expect(esquemaEnv.safeParse({ ...base, URL_APP }).success).toBe(false)
  })
})
