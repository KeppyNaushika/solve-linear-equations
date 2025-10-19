"use client"

import { MathJax } from "better-react-mathjax"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"

import type { DragData, SourceTerm, TermLabels } from "./types"
import { DROP_ZONE_ID } from "./constants"
import { TermCard } from "./term-card"
import { formatCardText, formatExpressionTeX } from "./utils"

type SourceZoneProps = {
  side: "left" | "right"
  terms: SourceTerm[]
  labels: TermLabels
  showHelper: boolean
  activeId: string | null
  highlightSignHint: boolean
  showExpression: boolean
}

export function SourceZone({
  side,
  terms,
  labels,
  showHelper,
  activeId,
  highlightSignHint,
  showExpression,
}: SourceZoneProps) {
  const droppableId =
    side === "left" ? DROP_ZONE_ID.poolLeft : DROP_ZONE_ID.poolRight

  const { isOver, setNodeRef } = useDroppable({
    id: droppableId,
  })

  const hasTerms = terms.length > 0
  const expressionTeX = formatExpressionTeX(
    terms.map((term) => ({
      coeff: term.coeff,
      isVariable: term.isVariable,
    }))
  )
  const showExpressionInZone = showExpression && hasTerms

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[140px] w-full flex-wrap items-center justify-center gap-3 rounded-xl p-4 transition-colors",
        showExpressionInZone
          ? "border border-border bg-background/80"
          : "border-2 border-dashed border-border bg-background/80",
        !showExpressionInZone && isOver && "border-primary bg-primary/10"
      )}
    >
      {showExpressionInZone ? (
        <MathJax inline dynamic>{"\\(" + expressionTeX + "\\)"}</MathJax>
      ) : (
        <>
          {terms.map((term) => {
            const cardLabel = formatCardText(term.coeff, term.isVariable)
            return (
              <TermCard
                key={term.id}
                id={`source-${side}-${term.id}`}
                dragType="source"
                coeff={term.coeff}
                isVariable={term.isVariable}
                side={term.side}
                activeId={activeId}
                ariaLabel={`項カード ${cardLabel}`}
                data={{ type: "source", term } as DragData}
                labels={labels}
                showHelper={showHelper}
                highlightSignHint={highlightSignHint}
              />
            )
          })}

          {!terms.length && (
            <div className="text-xs text-muted-foreground">
              カードなし
            </div>
          )}
        </>
      )}
    </div>
  )
}
