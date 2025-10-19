"use client"

import { cn } from "@/lib/utils"

type KeypadProps = {
  disabled?: boolean
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onToggleSign: () => void
}

const digits: string[][] = [
  ["7", "8", "9"],
  ["4", "5", "6"],
  ["1", "2", "3"],
]

export function Keypad({
  disabled,
  onDigit,
  onBackspace,
  onClear,
  onToggleSign,
}: KeypadProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2",
        disabled && "opacity-50 pointer-events-none"
      )}
    >
      {digits.flat().map((digit) => (
        <KeypadButton
          key={digit}
          label={digit}
          onClick={() => onDigit(digit)}
        />
      ))}
      <KeypadButton label="±" onClick={onToggleSign} />
      <KeypadButton label="0" onClick={() => onDigit("0")} />
      <KeypadButton label="⌫" onClick={onBackspace} />
      <KeypadButton
        label="クリア"
        className="col-span-3"
        onClick={onClear}
      />
    </div>
  )
}

type KeypadButtonProps = {
  label: string
  onClick: () => void
  className?: string
}

function KeypadButton({ label, onClick, className }: KeypadButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border border-border bg-background py-3 text-lg font-semibold text-foreground shadow-sm transition hover:bg-primary/10 hover:text-primary",
        className
      )}
    >
      {label}
    </button>
  )
}
