"use client"
import { useState } from "react"

import { useDraggable } from "@dnd-kit/core"
import { MathJax } from "better-react-mathjax"

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
  highlightSignHint: boolean
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
  highlightSignHint,
}: TermCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data,
  })
  const [isTouchActive, setIsTouchActive] = useState(false)

  const isActive = activeId === id
  const isSource = dragType === "source"

  const typeLabel = isVariable ? labels.variable : labels.constant
  const showTypeLabel = showHelper && typeLabel.trim().length > 0

  const statusClass = getCardStatusClass({
    isSource,
    isVariable,
    isPositionCorrect,
    isSignCorrect,
    showSignHint: highlightSignHint,
  })

  const showToggle = !isSource && typeof onToggleSign === "function"

  const handleCardClick = () => {
    if (!showToggle) {
      return
    }
    onToggleSign?.(id)
  }

  const cardStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  const disableTouchScroll = (element: HTMLElement) => {
    element.style.touchAction = "none"
    setIsTouchActive(true)
  }

  const restoreTouchScroll = (element: HTMLElement) => {
    element.style.touchAction = ""
    setIsTouchActive(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={cardStyle}
      className={cn(
        "relative flex cursor-grab select-none flex-col items-center justify-center gap-2 rounded-lg border px-4 py-4 text-lg font-semibold text-foreground shadow-sm transition-colors",
        statusClass,
        isActive && "border-primary bg-primary/15 shadow-md",
        isDragging && "opacity-0",
        isTouchActive && "touch-none"
      )}
      aria-label={ariaLabel}
      data-side={side}
      data-type={isSource ? "source" : "placed"}
      onClick={handleCardClick}
      {...listeners}
      {...attributes}
      onPointerDownCapture={(event) => {
        if (event.pointerType === "touch") {
          disableTouchScroll(event.currentTarget)
        }
      }}
      onPointerUpCapture={(event) => {
        if (event.pointerType === "touch") {
          restoreTouchScroll(event.currentTarget)
        }
      }}
      onPointerCancelCapture={(event) => {
        if (event.pointerType === "touch") {
          restoreTouchScroll(event.currentTarget)
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "touch") {
          restoreTouchScroll(event.currentTarget)
        }
      }}
      onTouchMoveCapture={(event) => {
        if (isTouchActive) {
          event.preventDefault()
        }
      }}
      onTouchEndCapture={(event) => {
        if (isTouchActive) {
          restoreTouchScroll(event.currentTarget)
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault()
      }}
    >
      <MathJax inline dynamic>
        {"\\(" + formatCardTeX(coeff, isVariable) + "\\)"}
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
  highlightSignHint: boolean
}

export function DragPreview({
  data,
  labels,
  showHelper,
  highlightSignHint,
}: DragPreviewProps) {
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
    showSignHint: highlightSignHint,
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
      <MathJax inline dynamic>{"\\(" + formatCardTeX(coeff, isVariable) + "\\)"}</MathJax>
      {showLabel ? (
        <span className="text-xs font-medium text-muted-foreground">{typeLabel}</span>
      ) : null}
    </div>
  )
}
