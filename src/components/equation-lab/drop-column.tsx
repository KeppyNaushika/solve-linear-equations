import { MathJax } from "better-react-mathjax"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"

import type { DragData, PlacedTerm, Side, TermLabels } from "./types"
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
  terms: PlacedTerm[]
  activeId: string | null
  onToggleSign: (instanceId: string) => void
  labels: TermLabels
  showHelper: boolean
}

export function DropColumn({
  id,
  terms,
  activeId,
  onToggleSign,
  labels,
  showHelper,
}: DropColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: DROP_ZONE_ID[id],
  })

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
    <div className="flex w-full flex-col items-center gap-2">
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[140px] w-full flex-wrap items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/80 p-4 transition-colors",
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
          <div className="text-sm text-muted-foreground">
            ここにカードをドロップ
          </div>
        )}
      </div>
      <MathJax inline dynamic>{"\\(" + expressionTeX + "\\)"}</MathJax>
    </div>
  )
}
