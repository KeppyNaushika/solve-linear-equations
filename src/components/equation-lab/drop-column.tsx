import { MathJax } from "better-react-mathjax"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"

import type {
  DragData,
  PlacedTerm,
  Side,
  TermLabels,
} from "./types"
import {
  getPlacedCoeff,
  isTermPositionCorrect,
  isTermSignCorrect,
  formatCardText,
  formatExpressionTeX,
  formatExpressionText,
} from "./utils"
import { DROP_ZONE_ID } from "./constants"
import { TermCard } from "./term-card"

type DropColumnProps = {
  id: Side
  label: string
  terms: PlacedTerm[]
  activeId: string | null
  onToggleSign: (instanceId: string) => void
  labels: TermLabels
  showHelper: boolean
}

export function DropColumn({
  id,
  label,
  terms,
  activeId,
  onToggleSign,
  labels,
  showHelper,
}: DropColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: DROP_ZONE_ID[id],
  })

  const alignmentClass = id === "left" ? "justify-end" : "justify-start"
  const textAlignClass = id === "left" ? "text-right" : "text-left"

  const hasTerms = terms.length > 0
  const allPositionCorrect = hasTerms ? terms.every(isTermPositionCorrect) : false
  const allSignCorrect =
    hasTerms && terms.every((term) => isTermPositionCorrect(term) && isTermSignCorrect(term))

  const zoneStatusClass = !hasTerms
    ? ""
    : allPositionCorrect
      ? allSignCorrect
        ? "border-emerald-500/70 bg-emerald-500/10"
        : "border-amber-500/70 bg-amber-500/10"
      : "border-destructive/60 bg-destructive/10"

  const expression = formatExpressionText(
    terms.map((term) => ({ coeff: getPlacedCoeff(term), isVariable: term.isVariable }))
  )

  const expressionTeX = formatExpressionTeX(
    terms.map((term) => ({ coeff: getPlacedCoeff(term), isVariable: term.isVariable }))
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          カード {terms.length} 枚
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/80 p-4 transition-colors",
          alignmentClass,
          zoneStatusClass || "",
          isOver && "border-primary bg-primary/10"
        )}
      >
        {terms.map((term) => {
          const positionOk = isTermPositionCorrect(term)
          const signOk = positionOk && isTermSignCorrect(term)
          const cardLabel = formatCardText(getPlacedCoeff(term), term.isVariable)
          return (
            <TermCard
              key={term.instanceId}
              id={term.instanceId}
              dragType="placed"
              coeff={getPlacedCoeff(term)}
              isVariable={term.isVariable}
              side={term.side}
              activeId={activeId}
              ariaLabel={`途中式の項カード ${cardLabel}`}
              data={{ type: "placed", term } as DragData}
              onToggleSign={onToggleSign}
              isPositionCorrect={positionOk}
              isSignCorrect={signOk}
              labels={labels}
              showHelper={showHelper}
            />
          )
        })}
        {!terms.length && (
          <div
            className={cn(
              "flex grow items-center text-sm text-muted-foreground",
              alignmentClass === "justify-end" ? "justify-end text-right" : "justify-start text-left"
            )}
          >
            ここにカードをドロップ
          </div>
        )}
      </div>
      <p
        className={cn("text-sm text-muted-foreground", textAlignClass)}
        aria-label={expression}
      >
        <MathJax inline dynamic>{`\(${expressionTeX}\)`}</MathJax>
      </p>
    </div>
  )
}
