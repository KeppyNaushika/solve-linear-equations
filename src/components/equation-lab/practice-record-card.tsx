"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { LinearEquation } from "@/lib/equations"

type PracticeRecordCardProps = {
  equation: LinearEquation | null
  solved: boolean
  solvedCount: number
}

export function PracticeRecordCard({
  solvedCount,
}: PracticeRecordCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>練習記録</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          解いた問題の数:{" "}
          <span className="text-base font-semibold text-foreground">
            {solvedCount}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
