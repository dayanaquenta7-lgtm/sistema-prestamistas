import { describe, expect, it } from "vitest"
import { patronContiene } from "./busqueda"

describe("patronContiene", () => {
  it("envuelve el texto en comodines", () => {
    expect(patronContiene("ana")).toBe("%ana%")
  })

  it("escapa los comodines y la barra invertida", () => {
    expect(patronContiene("50%")).toBe("%50\\%%")
    expect(patronContiene("a_b")).toBe("%a\\_b%")
    expect(patronContiene("c\\d")).toBe("%c\\\\d%")
  })
})
