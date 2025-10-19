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
import type { KeypadField } from "./types"
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
    divisionInput,
    solutionInput,
    activeKeypadField,
    focusKeypadField,
    coefficientMatches,
    constantMatches,
    divisionMatches,
    solutionMatches,
    divisionExpression,
    finalExpression,
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
    handleInputChange,
    handleDigit,
    handleBackspace,
    handleClearField,
    handleToggleSign,
  } = usePracticeLab()

  const fieldStageMap: Record<KeypadField, number> = {
    coefficient: 2,
    constant: 2,
    division: 3,
    solution: 4,
  }

  const getFieldState = (
    field: KeypadField,
    matches: boolean
  ): { editable: boolean; dimmed: boolean; showKeypad: boolean } => {
    const targetStage = fieldStageMap[field]
    const isBeforeStage = stage < targetStage
    const isAfterStage = stage > targetStage
    const isCurrentStage = stage === targetStage
    const editable =
      isCurrentStage && !matches && activeKeypadField === field
    const dimmed =
      isBeforeStage ||
      isAfterStage ||
      matches ||
      (isCurrentStage && !editable)
    return {
      editable,
      dimmed,
      showKeypad: editable,
    }
  }

  const coefficientState = getFieldState("coefficient", coefficientMatches)
  const constantState = getFieldState("constant", constantMatches)
  const divisionState = getFieldState("division", divisionMatches)
  const solutionState = getFieldState("solution", solutionMatches)

  const sourceRowDimmed = stage > 1
  const dropRowDimmed = stage > 1
  const coefficientRowDimmed = stage !== 2
  const divisionRowDimmed = stage !== 3
  const solutionRowDimmed = stage !== 4 || solutionMatches

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          一次方程式を解こう！
        </h1>
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
                  dimmed={sourceRowDimmed}
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
                  dimmed={dropRowDimmed}
                  left={
                    <DropColumn
                      id="left"
                      terms={leftPlaced}
                      onToggleSign={toggleTermSign}
                      labels={resolvedLabels}
                      showHelper={termLabelSettings.showHelper}
                      activeId={activeId}
                      stage={stage}
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
                      stage={stage}
                    />
                  }
                />
                {stage >= 2 && (
                  <EquationRow
                    dimmed={coefficientRowDimmed}
                    left={
                      <CoefficientEntry
                        ariaLabel="左辺の合計係数"
                        value={coefficientInput}
                        stage={stage}
                        field="coefficient"
                        activeField={activeKeypadField}
                        onFocus={focusKeypadField}
                        onInputChange={handleInputChange}
                        matches={coefficientMatches}
                        dimmed={coefficientState.dimmed}
                        editable={coefficientState.editable}
                        showKeypad={coefficientState.showKeypad}
                        layout="inline"
                        adornment="x"
                        onDigit={handleDigit}
                        onBackspace={handleBackspace}
                        onClear={handleClearField}
                        onToggleSign={handleToggleSign}
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
                        onInputChange={handleInputChange}
                        matches={constantMatches}
                        dimmed={constantState.dimmed}
                        editable={constantState.editable}
                        showKeypad={constantState.showKeypad}
                        onDigit={handleDigit}
                        onBackspace={handleBackspace}
                        onClear={handleClearField}
                        onToggleSign={handleToggleSign}
                      />
                    }
                  />
                )}
                {stage >= 3 && equation && (
                  <EquationRow
                    dimmed={divisionRowDimmed}
                    left={
                      <EquationInput
                        label="移項後の式"
                        expression={divisionExpression}
                      />
                    }
                    right={
                      <CoefficientEntry
                        label="割り算の結果"
                        value={divisionInput}
                        stage={stage}
                        field="division"
                        activeField={activeKeypadField}
                        onFocus={focusKeypadField}
                        onInputChange={handleInputChange}
                        matches={divisionMatches}
                        dimmed={divisionState.dimmed}
                        editable={divisionState.editable}
                        showKeypad={divisionState.showKeypad}
                        onDigit={handleDigit}
                        onBackspace={handleBackspace}
                        onClear={handleClearField}
                        onToggleSign={handleToggleSign}
                      />
                    }
                  />
                )}
                {stage >= 4 && equation && (
                  <EquationRow
                    dimmed={solutionRowDimmed}
                    left={
                      <EquationInput
                        label="最終結果"
                        expression={finalExpression}
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
                        onInputChange={handleInputChange}
                        matches={solutionMatches}
                        dimmed={solutionState.dimmed}
                        editable={solutionState.editable}
                        showKeypad={solutionState.showKeypad}
                        onDigit={handleDigit}
                        onBackspace={handleBackspace}
                        onClear={handleClearField}
                        onToggleSign={handleToggleSign}
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
              問題を準備中です...
            </div>
          )}

          <div className="flex flex-col gap-3 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-3 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <span>{hint}</span>
            <span className="font-medium text-foreground">
              この問題でカードを動かした回数: {moveCount}
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
                ここで回数と途中式を確認します。
              </CardDescription>
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

        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>そのほか</CardTitle>
              <CardDescription>
                休むか次の問題に進みます。
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button onClick={loadNextEquation} variant="default">
                次の問題
              </Button>
              <Button onClick={clearPlacedTerms} variant="outline">
                途中式を消す
              </Button>
              <Button
                onClick={togglePracticeMode}
                variant={keepPracticing ? "outline" : "secondary"}
              >
                {keepPracticing ? "自動つづけを止める" : "自動でつづける"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
