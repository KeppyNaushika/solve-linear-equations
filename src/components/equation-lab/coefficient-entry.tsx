"use client"

import { cn } from "@/lib/utils"
import { useEffect, useRef, type ReactNode } from "react"
import { Keypad, type KeypadVariant } from "./keypad"
import type { KeypadField } from "./types"

type CoefficientEntryProps = {
  label?: string
  ariaLabel?: string
  value: string
  field: KeypadField
  stage: number
  activeField: KeypadField | null
  onFocus: (field: KeypadField) => void
  onInputChange: (field: KeypadField, value: string) => void
  matches: boolean
  dimmed?: boolean
  editable?: boolean
  showKeypad?: boolean
  layout?: "column" | "inline"
  adornment?: ReactNode
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClear: () => void
  onToggleSign: () => void
  keypadVariant?: KeypadVariant
}

export function CoefficientEntry({
  label,
  ariaLabel,
  value,
  field,
  stage,
  activeField,
  onFocus,
  onInputChange,
  matches,
  dimmed,
  editable,
  showKeypad,
  layout = "column",
  adornment,
  onDigit,
  onBackspace,
  onClear,
  onToggleSign,
  keypadVariant = "default",
}: CoefficientEntryProps) {
  const isActive = activeField === field
  const showInput = stage >= 2
  const isInline = layout === "inline"
  const resolvedAriaLabel = ariaLabel ?? label ?? "数値を入力"
  const showLabel = Boolean(label)
  const inputPattern = field === "coefficient" ? "-?[0-9]*x?" : "-?[0-9]*"
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!showInput || !editable || !isActive) {
      return
    }

    const node = inputRef.current
    if (!node) {
      return
    }

    node.focus()
    node.setSelectionRange(node.value.length, node.value.length)
  }, [editable, isActive, showInput])

  if (!showInput) {
    return (
      <Placeholder
        label={label}
        message="カードを揃えてから入力できます"
        layout={layout}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center gap-2 transition-opacity",
        dimmed && "opacity-40",
        isInline && "gap-1"
      )}
    >
      {showLabel ? (
        <span className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </span>
      ) : null}
      <div className={cn("w-full space-y-2", isInline && "space-y-1")}>
        <div
          className={cn(
            "w-full",
            isInline && "flex items-center justify-center gap-3"
          )}
        >
          <input
            type="text"
            inputMode="numeric"
            pattern={inputPattern}
            value={value}
            readOnly={!editable}
            onFocus={() => onFocus(field)}
            onClick={() => onFocus(field)}
            onChange={(event) => onInputChange(field, event.target.value)}
            ref={inputRef}
            className={cn(
              "w-full rounded-lg border px-4 py-3 text-lg font-semibold text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              matches
                ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-700"
                : isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground",
              isInline && "max-w-none"
            )}
            aria-label={resolvedAriaLabel}
          />
          {isInline && adornment ? (
            <div className="text-2xl font-semibold text-muted-foreground md:text-3xl">
              {adornment}
            </div>
          ) : null}
        </div>
        {matches ? (
          <p className="text-xs font-medium text-emerald-600 text-center">
            正しい値です！
          </p>
        ) : (
          <p className="text-xs text-muted-foreground text-center">
            {field === "coefficient"
              ? "テンキーで符号・数字・x をつけて整数係数を入力"
              : "テンキーまたはキーボードで整数を入力"}
          </p>
        )}
        {showKeypad ? (
          <Keypad
            disabled={!editable}
            onDigit={onDigit}
            onBackspace={onBackspace}
            onClear={onClear}
            onToggleSign={onToggleSign}
            variant={keypadVariant}
          />
        ) : null}
      </div>
    </div>
  )
}

function Placeholder({
  label,
  message,
  layout = "column",
}: {
  label?: string
  message: string
  layout?: "column" | "inline"
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-2 opacity-50",
        layout === "inline" && "gap-1"
      )}
    >
      {label ? (
        <span className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </span>
      ) : null}
      <div className="w-full rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground text-center">
        {message}
      </div>
    </div>
  )
}
