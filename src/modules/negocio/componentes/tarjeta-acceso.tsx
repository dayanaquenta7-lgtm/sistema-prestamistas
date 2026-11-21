import type { ReactNode } from "react"

interface TarjetaAccesoProps {
  titulo: string
  descripcion?: string
  children: ReactNode
}

export function TarjetaAcceso({ titulo, descripcion, children }: TarjetaAccesoProps) {
  return (
    <section className="w-full max-w-sm rounded-md border bg-card p-6">
      <header className="mb-6 flex flex-col gap-1">
        <h1 className="text-xl font-semibold">{titulo}</h1>
        {descripcion ? <p className="text-sm text-muted-foreground">{descripcion}</p> : null}
      </header>
      {children}
    </section>
  )
}
