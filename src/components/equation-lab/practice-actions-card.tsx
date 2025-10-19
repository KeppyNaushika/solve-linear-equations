"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent
} from "@/components/ui/card"

type PracticeActionsCardProps = {
  keepPracticing: boolean
  onLoadNextEquation: () => void
  onClearPlacedTerms: () => void
  onTogglePracticeMode: () => void
}

export function PracticeActionsCard({
  keepPracticing,
  onLoadNextEquation,
  onClearPlacedTerms,
  onTogglePracticeMode,
}: PracticeActionsCardProps) {
  return (
    <Card>
      <CardContent className="flex gap-3">
        <Button onClick={onLoadNextEquation} variant="default" className="grow shrink w-full">
          次の問題
        </Button>
        <Button onClick={onClearPlacedTerms} variant="outline" className="grow shrink w-full">
          途中式を消す
        </Button>
        <Button
          onClick={onTogglePracticeMode}
          variant={keepPracticing ? "outline" : "secondary"}
          className="grow shrink w-full"
        >
          {keepPracticing ? "一旦ストップにする" : "自動で次の問題にする"}
        </Button>
      </CardContent>
    </Card>
  )
}
