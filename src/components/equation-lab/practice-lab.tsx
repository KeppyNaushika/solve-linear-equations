"use client"

import { MathJax } from "better-react-mathjax"
import { DndContext, DragOverlay } from "@dnd-kit/core"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardAction,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { DropColumn } from "./drop-column"
import { SourceZone } from "./source-zone"
import { DragPreview } from "./term-card"
import { TermLabelSettingsPopover } from "./settings-popover"
import { EquationRow } from "./equation-row"
import { CoefficientEntry } from "./coefficient-entry"
import { EquationInput } from "./equation-input"
import { Keypad } from "./keypad"
import { usePracticeLab } from "./use-practice-lab"

export default function PracticeLab() {
  const {
    highlightEquation,
    equation,
    equationText,
    equationInline,
    termLabelSettings,
    setTermLabelSettings,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    sourceLeftTerms,
    sourceRightTerms,
    resolvedLabels,
    activeId,
    leftPlaced,
    rightPlaced,
    toggleTermSign,
    stage,
    coefficientInput,
    constantInput,
    solutionInput,
    activeKeypadField,
    focusKeypadField,
    coefficientMatches,
    constantMatches,
    solutionMatches,
    divisionExpression,
    activeDrag,
    hint,
    moveCount,
    history,
    solvedCount,
    solved,
    keepPracticing,
    loadNextEquation,
    clearPlacedTerms,
    togglePracticeMode,
    activeFieldLabel,
    keypadDisabled,
    handleDigit,
    handleBackspace,
    handleClearField,
    handleToggleSign,
  } = usePracticeLab()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          一次方程式ラボ
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
          方程式のカードをドラッグ＆ドロップして <span className="font-semibold">x</span> を孤立させましょう。
          等号をまたいだカードは右上のボタンで符号を調整し、枠の色が緑になるまで仕上げてください。
          1 題だけ解いても、連続で挑戦してもかまいません。
        </p>
      </header>

      <Card
        className={cn(
          "transition-shadow",
          highlightEquation && "shadow-[0_0_0_3px] shadow-primary/40"
        )}
      >
        <CardHeader className="space-y-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <CardTitle className="text-xl md:text-2xl">現在の問題</CardTitle>
              <CardDescription
                className="text-base md:text-lg"
                aria-label={equationText}
              >
                {equation ? (
                  <MathJax inline dynamic>{equationInline}</MathJax>
                ) : (
                  equationText
                )}
              </CardDescription>
            </div>
            <CardAction className="shrink-0">
              <TermLabelSettingsPopover
                settings={termLabelSettings}
                onSettingsChange={setTermLabelSettings}
              />
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {equation ? (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="space-y-6">
                <EquationRow
                  leftLabel="左辺"
                  rightLabel="右辺"
                  left={
                    <SourceZone
                      side="left"
                      terms={sourceLeftTerms}
                      labels={resolvedLabels}
                      showHelper={termLabelSettings.showHelper}
                      activeId={activeId}
                    />
                  }
                  right={
                    <SourceZone
                      side="right"
                      terms={sourceRightTerms}
                      labels={resolvedLabels}
                      showHelper={termLabelSettings.showHelper}
                      activeId={activeId}
                    />
                  }
                />

                <EquationRow
                  leftLabel="左辺"
                  rightLabel="右辺"
                  left={
                    <DropColumn
                      id="left"
                      terms={leftPlaced}
                      onToggleSign={toggleTermSign}
                      labels={resolvedLabels}
                      showHelper={termLabelSettings.showHelper}
                      activeId={activeId}
                    />
                  }
                  right={
                    <DropColumn
                      id="right"
                      terms={rightPlaced}
                      onToggleSign={toggleTermSign}
                      labels={resolvedLabels}
                      showHelper={termLabelSettings.showHelper}
                      activeId={activeId}
                    />
                  }
                />
                {stage >= 2 && (
                  <EquationRow
                    leftLabel="左辺"
                    rightLabel="右辺"
                    left={
                      <CoefficientEntry
                        label="左辺の合計係数"
                        value={coefficientInput}
                        stage={stage}
                        field="coefficient"
                        activeField={activeKeypadField}
                        onFocus={focusKeypadField}
                        matches={coefficientMatches}
                      />
                    }
                    right={
                      <CoefficientEntry
                        label="右辺の合計定数"
                        value={constantInput}
                        stage={stage}
                        field="constant"
                        activeField={activeKeypadField}
                        onFocus={focusKeypadField}
                        matches={constantMatches}
                      />
                    }
                  />
                )}
                {stage >= 3 && equation && (
                  <EquationRow
                    leftLabel="左辺"
                    rightLabel="右辺"
                    left={
                      <EquationInput
                        label="移項後の式"
                        expression={divisionExpression}
                      />
                    }
                    right={
                      <CoefficientEntry
                        label="x の値"
                        value={solutionInput}
                        stage={stage}
                        field="solution"
                        activeField={activeKeypadField}
                        onFocus={focusKeypadField}
                        matches={solutionMatches}
                      />
                    }
                  />
                )}
              </div>
              <DragOverlay dropAnimation={null}>
                {activeDrag ? (
                  <DragPreview
                    data={activeDrag}
                    labels={resolvedLabels}
                    showHelper={termLabelSettings.showHelper}
                  />
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 px-4 py-16 text-sm text-muted-foreground">
              最初の方程式を準備中です...
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>{hint}</span>
            <span className="font-medium text-foreground">
              この問題での移動回数: {moveCount}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>練習記録</CardTitle>
              <CardDescription>
                解いた回数と現在の途中式を振り返りましょう。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                解いた方程式の合計:{" "}
                <span className="text-base font-semibold text-foreground">
                  {solvedCount}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                現在の解のプレビュー:{" "}
                <span className="text-base font-semibold text-foreground">
                  {equation
                    ? solved
                      ? (
                          <MathJax inline dynamic>
                            {"\\(x = " + equation.solution + "\\)"}
                          </MathJax>
                        )
                      : "カードを並べ替えてみましょう"
                    : "最初の問題を準備しています..."}
                </span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>途中式の履歴</CardTitle>
              <CardDescription>
                上段から作成した途中式が順番に記録されます。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {history.map((entry, index) => (
                  <li
                    key={entry.id}
                    className="rounded-lg border bg-background/60 px-3 py-2 text-sm text-foreground"
                  >
                    <div className="mb-1 flex items-center justify-between text-xs font-medium uppercase text-muted-foreground">
                      <span>ステップ {index + 1}</span>
                    </div>
                    <MathJax dynamic>{"\\(" + entry.tex + "\\)"}</MathJax>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>テンキー入力</CardTitle>
              <CardDescription>
                選択した項の値をテンキーで入力します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {activeFieldLabel}
              </p>
              <Keypad
                disabled={keypadDisabled}
                onDigit={handleDigit}
                onBackspace={handleBackspace}
                onClear={handleClearField}
                onToggleSign={handleToggleSign}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>セッション操作</CardTitle>
              <CardDescription>
                休憩するか次の問題を準備しましょう。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={loadNextEquation} variant="default">
                新しい問題を配る
              </Button>
              <Button onClick={clearPlacedTerms} variant="outline">
                途中式をクリアする
              </Button>
              <Button
                onClick={togglePracticeMode}
                variant={keepPracticing ? "outline" : "secondary"}
              >
                {keepPracticing ? "今回で終了する" : "自動で次へ進む"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
