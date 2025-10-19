"use client"

import { cn } from "@/lib/utils"

import type { KeypadField } from "./types"

type CoefficientEntryProps = {
  label: string
  value: string
  field: KeypadField
  stage: number
  activeField: KeypadField | null
  onFocus: (field: KeypadField) => void
  matches: boolean
}

export function CoefficientEntry({
  label,
  value,
  field,
  stage,
  activeField,
  onFocus,
  matches,
}: CoefficientEntryProps) {
  const isActive = activeField === field
  const showInput = stage >= 2

  if (!showInput) {
    return (
      <Placeholder label={label} message="カードを揃えてから入力できます" />
    )
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
      <button
        type="button"
        onClick={() => onFocus(field)}
        className={cn(
          "w-full rounded-lg border px-4 py-3 text-lg font-semibold transition",
          matches
            ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-700"
            : isActive
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-background text-foreground hover:border-primary"
        )}
      >
        {value === "" ? <span className="text-sm">タップして入力</span> : value}
      </button>
      {matches ? (
        <span className="text-xs font-medium text-emerald-600">
          正しい値です！
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">
          テンキーで整数を入力
        </span>
      )}
    </div>
  )
}

function Placeholder({
  label,
  message,
}: {
  label: string
  message: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
      <div className="w-full rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        {message}
      </div>
    </div>
  )
}
