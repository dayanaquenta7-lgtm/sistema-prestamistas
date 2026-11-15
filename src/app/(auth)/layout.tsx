import type { ReactNode } from "react"

export default function LayoutAcceso({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-muted px-4 py-10">
      <p className="text-sm font-semibold text-primary">Sistema de préstamos</p>
      {children}
    </main>
  )
}
