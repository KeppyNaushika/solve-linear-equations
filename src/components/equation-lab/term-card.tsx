"use client"
import { useDraggable } from "@dnd-kit/core"
import { MathJax } from "better-react-mathjax"
import { RefreshCcw } from "lucide-react"

import { cn } from "@/lib/utils"

import type { DragData, DragType, Side, TermLabels } from "./types"
import {
  formatCardTeX,
  getCardStatusClass,
  getPlacedCoeff,
  isTermPositionCorrect,
  isTermSignCorrect,
} from "./utils"

type TermCardProps = {
  id: string
  coeff: number
  isVariable: boolean
  side: Side
  dragType: DragType
  ariaLabel: string
  activeId: string | null
  data: DragData
  onToggleSign?: (instanceId: string) => void
  isPositionCorrect?: boolean
  isSignCorrect?: boolean
  labels: TermLabels
  showHelper: boolean
}

export function TermCard({
  id,
  coeff,
  isVariable,
  side,
  dragType,
  ariaLabel,
  activeId,
  data,
  onToggleSign,
  isPositionCorrect,
  isSignCorrect,
  labels,
  showHelper,
}: TermCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  })

  const isActive = activeId === id
  const isSource = dragType === "source"

  const typeLabel = isVariable ? labels.variable : labels.constant
  const showTypeLabel = showHelper && typeLabel.trim().length > 0

  const statusClass = getCardStatusClass({
    isSource,
    isVariable,
    isPositionCorrect,
    isSignCorrect,
  })

  const showToggle = !isSource && typeof onToggleSign === "function"

  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
          : undefined
      }
      className={cn(
        "relative flex cursor-grab flex-col items-center justify-center gap-1 rounded-lg border px-4 py-3 text-lg font-semibold text-foreground shadow-sm transition-colors",
        statusClass,
        isActive && "border-primary bg-primary/15 shadow-md",
        isDragging && "opacity-0"
      )}
      aria-label={ariaLabel}
      data-side={side}
      data-type={isSource ? "source" : "placed"}
      {...listeners}
      {...attributes}
    >
      {showToggle && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onToggleSign?.(id)
          }}
          aria-label="符号を切り替える"
          className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/90 text-muted-foreground transition hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
        </button>
      )}
      <MathJax inline dynamic>
        {`\(${formatCardTeX(coeff, isVariable)}\)`}
      </MathJax>
      {showTypeLabel ? (
        <span className="text-xs font-medium text-muted-foreground">
          {typeLabel}
        </span>
      ) : null}
    </div>
  )
}

type DragPreviewProps = {
  data: DragData
  labels: TermLabels
  showHelper: boolean
}

export function DragPreview({ data, labels, showHelper }: DragPreviewProps) {
  const isSource = data.type === "source"
  const coeff = isSource ? data.term.coeff : getPlacedCoeff(data.term)
  const isVariable = data.term.isVariable
  const positionOk = !isSource && isTermPositionCorrect(data.term)
  const signOk = !isSource && positionOk && isTermSignCorrect(data.term)
  const statusClass = getCardStatusClass({
    isSource,
    isVariable,
    isPositionCorrect: positionOk,
    isSignCorrect: signOk,
  })
  const typeLabel = isVariable ? labels.variable : labels.constant
  const showLabel = showHelper && typeLabel.trim().length > 0

  return (
    <div
      className={cn(
        "pointer-events-none flex min-w-[88px] flex-col items-center justify-center gap-1 rounded-lg border px-4 py-3 text-lg font-semibold text-foreground shadow-lg",
        statusClass
      )}
    >
      <MathJax inline dynamic>{`\(${formatCardTeX(coeff, isVariable)}\)`}</MathJax>
      {showLabel ? (
        <span className="text-xs font-medium text-muted-foreground">{typeLabel}</span>
      ) : null}
    </div>
  )
}
