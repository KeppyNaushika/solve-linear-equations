import { useMemo } from "react"
import { useDroppable } from "@dnd-kit/core"

import { cn } from "@/lib/utils"

import type {
  DragData,
  SourceTerm,
  TermLabels,
} from "./types"
import { DROP_ZONE_ID } from "./constants"
import { TermCard } from "./term-card"
import { formatCardText } from "./utils"

type SourceShelfProps = {
  terms: SourceTerm[]
  labels: TermLabels
  showHelper: boolean
  activeId: string | null
}

export function SourceShelf({ terms, labels, showHelper, activeId }: SourceShelfProps) {
  const leftTerms = useMemo(
    () => terms.filter((term) => term.side === "left"),
    [terms]
  )
  const rightTerms = useMemo(
    () => terms.filter((term) => term.side === "right"),
    [terms]
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          カード棚
        </span>
        <span className="text-xs font-semibold text-muted-foreground">
          上段へ戻すとカードを削除
        </span>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[1fr_auto_1fr]">
        <ShelfZone
          id={DROP_ZONE_ID.poolLeft}
          label="左辺カード"
          terms={leftTerms}
          labels={labels}
          showHelper={showHelper}
          activeId={activeId}
        />

        <div className="flex h-full items-center justify-center text-3xl font-semibold text-muted-foreground md:text-4xl">
          =
        </div>

        <ShelfZone
          id={DROP_ZONE_ID.poolRight}
          label="右辺カード"
          terms={rightTerms}
          labels={labels}
          showHelper={showHelper}
          activeId={activeId}
        />
      </div>
    </div>
  )
}

type ShelfZoneProps = {
  id: string
  label: string
  terms: SourceTerm[]
  labels: TermLabels
  showHelper: boolean
  activeId: string | null
}

function ShelfZone({ id, label, terms, labels, showHelper, activeId }: ShelfZoneProps) {
  const { isOver, setNodeRef } = useDroppable({ id })

  const justifyClass =
    id === DROP_ZONE_ID.poolLeft
      ? "justify-end"
      : id === DROP_ZONE_ID.poolRight
        ? "justify-start"
        : "justify-center"

  const textClass =
    id === DROP_ZONE_ID.poolLeft
      ? "text-right"
      : id === DROP_ZONE_ID.poolRight
        ? "text-left"
        : "text-center"

  return (
    <div className="space-y-3">
      <span
        className={cn(
          "block text-xs font-medium uppercase tracking-wide text-muted-foreground",
          textClass
        )}
      >
        {label}
      </span>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[110px] flex-wrap items-center gap-3 rounded-xl border-2 border-dashed border-border bg-background/90 p-4 transition-colors",
          justifyClass,
          isOver && "border-destructive bg-destructive/10"
        )}
      >
        {terms.map((term) => {
          const cardLabel = formatCardText(term.coeff, term.isVariable)
          return (
            <TermCard
              key={term.id}
              id={`source-${id}-${term.id}`}
              dragType="source"
              coeff={term.coeff}
              isVariable={term.isVariable}
              side={term.side}
              activeId={activeId}
              ariaLabel={`項カード ${cardLabel}`}
              data={{ type: "source", term } as DragData}
              labels={labels}
              showHelper={showHelper}
            />
          )
        })}
        {!terms.length && (
          <div className={cn("text-xs text-muted-foreground", textClass)}>カードなし</div>
        )}
      </div>
    </div>
  )
}
