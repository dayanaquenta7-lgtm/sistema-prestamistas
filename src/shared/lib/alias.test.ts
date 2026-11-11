import { describe, expect, it } from "vitest"
import { cn } from "@/shared/lib/utils"

describe("alias @/", () => {
  it("resuelve módulos de src", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })
})
