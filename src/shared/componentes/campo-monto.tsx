"use client"

import type { ComponentProps } from "react"
import { formatearNumero, parsearMonto } from "@/shared/lib/dinero"
import { cn } from "@/shared/lib/utils"
import { Input } from "@/shared/ui/input"

type CampoMontoProps = Omit<ComponentProps<"input">, "type" | "value" | "onChange" | "inputMode"> & {
  /** Texto tal como lo escribe el usuario; se valida con esquemaMonto. */
  value: string
  onValueChange: (valor: string) => void
}

/**
 * Campo de monto en bolivianos: acepta "1.234,56" o "1234.5" y al salir del
 * campo lo muestra con formato boliviano. Usar con Controller de React Hook Form.
 */
export function CampoMonto({ value, onValueChange, onBlur, className, ...props }: CampoMontoProps) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-sm text-muted-foreground"
        aria-hidden="true"
      >
        Bs
      </span>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(evento) => onValueChange(evento.target.value)}
        onBlur={(evento) => {
          const monto = parsearMonto(value)
          if (monto) onValueChange(formatearNumero(monto))
          onBlur?.(evento)
        }}
        className={cn("pl-9 text-right tabular-nums", className)}
      />
    </div>
  )
}
