"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <CardHeader>
        <CardTitle>そのほか</CardTitle>
        <CardDescription>休むか次の問題に進みます。</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={onLoadNextEquation} variant="default">
          次の問題
        </Button>
        <Button onClick={onClearPlacedTerms} variant="outline">
          途中式を消す
        </Button>
        <Button
          onClick={onTogglePracticeMode}
          variant={keepPracticing ? "outline" : "secondary"}
        >
          {keepPracticing ? "自動つづけを止める" : "自動でつづける"}
        </Button>
      </CardContent>
    </Card>
  )
}
