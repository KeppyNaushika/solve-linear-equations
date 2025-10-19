"use client"

import type { CSSProperties } from "react"

import { cn } from "@/lib/utils"

export type KeypadVariant = "default" | "signOnly"

type KeypadProps = {
  disabled?: boolean
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onToggleSign: () => void
  variant?: KeypadVariant
}

export function Keypad({
  disabled,
  onDigit,
  onBackspace,
  onClear,
  onToggleSign,
  variant = "default",
}: KeypadProps) {
  type Button = {
    label: string
    action: "digit" | "toggleSign" | "backspace" | "clear"
    value?: string
    row: number
    col: number
    rowSpan?: number
    colSpan?: number
  }

  const baseButtons: Button[] = [
    { label: "7", action: "digit", value: "7", row: 1, col: 1 },
    { label: "8", action: "digit", value: "8", row: 1, col: 2 },
    { label: "9", action: "digit", value: "9", row: 1, col: 3 },
    { label: "4", action: "digit", value: "4", row: 2, col: 1 },
    { label: "5", action: "digit", value: "5", row: 2, col: 2 },
    { label: "6", action: "digit", value: "6", row: 2, col: 3 },
    { label: "1", action: "digit", value: "1", row: 3, col: 1 },
    { label: "2", action: "digit", value: "2", row: 3, col: 2 },
    { label: "3", action: "digit", value: "3", row: 3, col: 3 },
    { label: "クリア", action: "clear", row: 5, col: 1, colSpan: 2 },
    { label: "⌫", action: "backspace", row: 5, col: 3 },
  ]

  const variantButtons: Button[] =
    variant === "signOnly"
      ? [
          { label: "-", action: "toggleSign", row: 4, col: 1 },
          { label: "0", action: "digit", value: "0", row: 4, col: 2 },
          { label: "x", action: "digit", value: "x", row: 4, col: 3 },
        ]
      : [
          { label: "-", action: "toggleSign", row: 4, col: 1 },
          { label: "0", action: "digit", value: "0", row: 4, col: 2, colSpan: 2 },
        ]

  const buttons: Button[] = [...baseButtons, ...variantButtons]

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {buttons.map(({ label, action, value, row, col, rowSpan, colSpan }) => (
        <KeypadButton
          key={`${label}-${row}-${col}`}
          label={label}
          onClick={() => {
            switch (action) {
              case "digit":
                if (value) {
                  onDigit(value)
                }
                break
              case "toggleSign":
                onToggleSign()
                break
              case "backspace":
                onBackspace()
                break
              case "clear":
                onClear()
                break
            }
          }}
          className={cn(
            rowSpan ? `row-span-${rowSpan}` : "",
            colSpan ? `col-span-${colSpan}` : ""
          )}
          style={{
            gridRow: rowSpan ? `${row} / span ${rowSpan}` : `${row}`,
            gridColumn: colSpan ? `${col} / span ${colSpan}` : `${col}`,
          }}
        />
      ))}
    </div>
  )
}

type KeypadButtonProps = {
  label: string
  onClick: () => void
  className?: string
  style?: CSSProperties
}

function KeypadButton({ label, onClick, className, style }: KeypadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-background py-3 text-lg font-semibold text-foreground shadow-sm transition hover:bg-primary/10 hover:text-primary",
        className
      )}
      style={style}
    >
      {label}
    </button>
  )
}
