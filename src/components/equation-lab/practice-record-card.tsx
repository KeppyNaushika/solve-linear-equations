"use client"

import { MathJax } from "better-react-mathjax"

import {
  Card,
  CardContent,
  CardDescription,
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
  equation,
  solved,
  solvedCount,
}: PracticeRecordCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>練習記録</CardTitle>
        <CardDescription>ここで回数と途中式を確認します。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          解いた問題の数:{" "}
          <span className="text-base font-semibold text-foreground">
            {solvedCount}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          いまの答えのようす:{" "}
          <span className="text-base font-semibold text-foreground">
            {equation
              ? solved
                ? (
                    <MathJax inline dynamic>
                      {"\\(x = " + equation.solution + "\\)"}
                    </MathJax>
                  )
                : "カードを動かしてみよう"
              : "最初の問題を準備中です..."}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}
