"use client"

import { useEffect, useRef, type Dispatch, type SetStateAction } from "react"

import { MathJax } from "better-react-mathjax"
import {
  DndContext,
  DragOverlay,
  type DndContextProps,
} from "@dnd-kit/core"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

import { CoefficientEntry } from "./coefficient-entry"
import { DragPreview } from "./term-card"
import { DropColumn } from "./drop-column"
import { EquationRow } from "./equation-row"
import { Keypad, type KeypadVariant } from "./keypad"
import { SourceZone } from "./source-zone"
import { TermLabelSettingsPopover } from "./settings-popover"
import type {
  DragData,
  KeypadField,
  PlacedTerm,
  SourceTerm,
  TermLabelSettingsState,
  TermLabels,
} from "./types"
import type { LinearEquation } from "@/lib/equations"

type PracticeEquationCardProps = {
  highlightEquation: boolean
  equation: LinearEquation | null
  equationText: string
  equationInline: string
  termLabelSettings: TermLabelSettingsState
  onSettingsChange: Dispatch<SetStateAction<TermLabelSettingsState>>
  sensors: DndContextProps["sensors"]
  onDragStart: NonNullable<DndContextProps["onDragStart"]>
  onDragEnd: NonNullable<DndContextProps["onDragEnd"]>
  onDragCancel: NonNullable<DndContextProps["onDragCancel"]>
  sourceLeftTerms: SourceTerm[]
  sourceRightTerms: SourceTerm[]
  resolvedLabels: TermLabels
  activeId: string | null
  leftPlaced: PlacedTerm[]
  rightPlaced: PlacedTerm[]
  onToggleTermSign: (instanceId: string) => void
  stage: number
  coefficientInput: string
  constantInput: string
  divisionInput: string
  solutionInput: string
  activeKeypadField: KeypadField | null
  onFocusKeypadField: (field: KeypadField) => void
  onInputChange: (field: KeypadField, value: string) => void
  coefficientMatches: boolean
  constantMatches: boolean
  divisionMatches: boolean
  solutionMatches: boolean
  activeDrag: DragData | null
  hint: string
  solved: boolean
  onDigit: (digit: string) => void
  onBackspace: () => void
  onClearField: () => void
  onToggleSign: () => void
}

const fieldStageMap: Record<KeypadField, number> = {
  coefficient: 2,
  constant: 2,
  division: 3,
  solution: 4,
}

const getFieldState = (
  field: KeypadField,
  matches: boolean,
  stage: number,
  activeKeypadField: KeypadField | null
): { editable: boolean; dimmed: boolean; showKeypad: boolean } => {
  const targetStage = fieldStageMap[field]
  const isBeforeStage = stage < targetStage
  const isAfterStage = stage > targetStage
  const isCurrentStage = stage === targetStage
  const editable = isCurrentStage && !matches && activeKeypadField === field
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

export function PracticeEquationCard({
  highlightEquation,
  equation,
  equationText,
  equationInline,
  termLabelSettings,
  onSettingsChange,
  sensors,
  onDragStart,
  onDragEnd,
  onDragCancel,
  sourceLeftTerms,
  sourceRightTerms,
  resolvedLabels,
  activeId,
  leftPlaced,
  rightPlaced,
  onToggleTermSign,
  stage,
  coefficientInput,
  constantInput,
  divisionInput,
  solutionInput,
  activeKeypadField,
  onFocusKeypadField,
  onInputChange,
  coefficientMatches,
  constantMatches,
  divisionMatches,
  solutionMatches,
  activeDrag,
  hint,
  solved,
  onDigit,
  onBackspace,
  onClearField,
  onToggleSign,
}: PracticeEquationCardProps) {
  const coefficientState = getFieldState(
    "coefficient",
    coefficientMatches,
    stage,
    activeKeypadField
  )
  const constantState = getFieldState(
    "constant",
    constantMatches,
    stage,
    activeKeypadField
  )
  const divisionState = getFieldState(
    "division",
    divisionMatches,
    stage,
    activeKeypadField
  )
  const solutionState = getFieldState(
    "solution",
    solutionMatches,
    stage,
    activeKeypadField
  )

  const divisionInputRef = useRef<HTMLInputElement>(null)
  const solutionInputRef = useRef<HTMLInputElement>(null)

  const sourceRowDimmed = stage > 1
  const dropRowDimmed = stage > 1
  const coefficientRowDimmed = stage !== 2
  const divisionRowDimmed = stage !== 3
  const solutionRowDimmed = stage !== 4 || solutionMatches

  const renderKeypad = (
    fieldState: { editable: boolean; showKeypad: boolean },
    variant: KeypadVariant = "default"
  ) =>
    fieldState.showKeypad ? (
      <Keypad
        disabled={!fieldState.editable}
        onDigit={onDigit}
        onBackspace={onBackspace}
        onClear={onClearField}
        onToggleSign={onToggleSign}
        variant={variant}
      />
    ) : null

  useEffect(() => {
    if (!divisionState.editable) return
    const node = divisionInputRef.current
    if (!node) return
    node.focus()
    node.setSelectionRange(node.value.length, node.value.length)
  }, [divisionState.editable])

  useEffect(() => {
    if (!solutionState.editable) return
    const node = solutionInputRef.current
    if (!node) return
    node.focus()
    node.setSelectionRange(node.value.length, node.value.length)
  }, [solutionState.editable])

  return (
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
              一次方程式{"　"}
              {equation ? (
                <MathJax inline dynamic>{equationInline}</MathJax>
              ) : (
                equationText
              )}{"　"}を解きなさい
            </CardDescription>
          </div>
          <CardAction className="shrink-0">
            <TermLabelSettingsPopover
              settings={termLabelSettings}
              onSettingsChange={onSettingsChange}
            />
          </CardAction>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {equation ? (
          <DndContext
            sensors={sensors}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragCancel={onDragCancel}
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
                    highlightSignHint={termLabelSettings.highlightSignHint}
                    showExpression={solved}
                  />
                }
                right={
                  <SourceZone
                    side="right"
                    terms={sourceRightTerms}
                    labels={resolvedLabels}
                    showHelper={termLabelSettings.showHelper}
                    activeId={activeId}
                    highlightSignHint={termLabelSettings.highlightSignHint}
                    showExpression={solved}
                  />
                }
              />

              <EquationRow
                dimmed={dropRowDimmed}
                left={
                  <DropColumn
                    id="left"
                    terms={leftPlaced}
                    onToggleSign={onToggleTermSign}
                    labels={resolvedLabels}
                    showHelper={termLabelSettings.showHelper}
                    activeId={activeId}
                    showExpression={solved}
                    highlightSignHint={termLabelSettings.highlightSignHint}
                  />
                }
                right={
                  <DropColumn
                    id="right"
                    terms={rightPlaced}
                    onToggleSign={onToggleTermSign}
                    labels={resolvedLabels}
                    showHelper={termLabelSettings.showHelper}
                    activeId={activeId}
                    showExpression={solved}
                    highlightSignHint={termLabelSettings.highlightSignHint}
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
                      onFocus={onFocusKeypadField}
                      onInputChange={onInputChange}
                      matches={coefficientMatches}
                      dimmed={coefficientState.dimmed}
                      editable={coefficientState.editable}
                      showKeypad={false}
                      layout="inline"
                      onDigit={onDigit}
                      onBackspace={onBackspace}
                      onClear={onClearField}
                      onToggleSign={onToggleSign}
                      keypadVariant="signOnly"
                    />
                  }
                  right={
                    <CoefficientEntry
                      ariaLabel="右辺の定数"
                      value={constantInput}
                      stage={stage}
                      field="constant"
                      activeField={activeKeypadField}
                      onFocus={onFocusKeypadField}
                      onInputChange={onInputChange}
                      matches={constantMatches}
                      dimmed={constantState.dimmed}
                      editable={constantState.editable}
                      showKeypad={false}
                      onDigit={onDigit}
                      onBackspace={onBackspace}
                      onClear={onClearField}
                      onToggleSign={onToggleSign}
                    />
                  }
                  leftFooter={renderKeypad(coefficientState, "signOnly")}
                  rightFooter={renderKeypad(constantState)}
                />
              )}
              {stage >= 3 && equation && (
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    divisionRowDimmed && "opacity-40"
                  )}
                >
                  <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-base font-medium text-foreground md:text-lg">
                    <span className="leading-tight">両辺を</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="-?[0-9]*"
                        value={divisionInput}
                        ref={divisionInputRef}
                        readOnly={!divisionState.editable}
                        onFocus={() => onFocusKeypadField("division")}
                        onClick={() => onFocusKeypadField("division")}
                        onChange={(event) =>
                          onInputChange("division", event.target.value)
                        }
                        className={cn(
                          "w-24 rounded-md border px-3 py-1.5 text-lg font-semibold text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                          divisionMatches
                            ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-700"
                          : divisionState.editable
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground"
                        )}
                        aria-label="x の係数を入力"
                      />
                    </div>
                    <span className="leading-tight">で割ると</span>
                  </div>
                  {divisionMatches ? (
                    <p className="text-xs font-medium text-emerald-600">
                      正しい係数です！
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      テンキーまたはキーボードで x の係数を入力
                    </p>
                  )}
                  {renderKeypad(divisionState)}
                </div>
              )}
              {stage >= 4 && equation && (
                <div
                  className={cn(
                    "flex flex-col gap-2",
                    solutionRowDimmed && "opacity-40"
                  )}
                >
                  <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg border border-border bg-background px-4 py-3 text-2xl font-semibold text-foreground md:text-3xl">
                    <span className="leading-tight">x =</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="-?[0-9]*"
                      value={solutionInput}
                      ref={solutionInputRef}
                      readOnly={!solutionState.editable}
                      onFocus={() => onFocusKeypadField("solution")}
                      onClick={() => onFocusKeypadField("solution")}
                      onChange={(event) =>
                        onInputChange("solution", event.target.value)
                      }
                      className={cn(
                        "w-24 rounded-md border px-3 py-1.5 text-2xl font-semibold text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 md:text-3xl",
                        solutionMatches
                          ? "border-emerald-500/70 bg-emerald-500/10 text-emerald-700"
                          : solutionState.editable
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground"
                      )}
                      aria-label="x の値を入力"
                    />
                  </div>
                  {solutionMatches ? (
                    <p className="text-xs font-medium text-emerald-600">
                      正しい値です！
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      テンキーまたはキーボードで整数を入力
                    </p>
                  )}
                  {renderKeypad(solutionState)}
                </div>
              )}
            </div>
            <DragOverlay dropAnimation={null}>
              {activeDrag ? (
                <DragPreview
                  data={activeDrag}
                  labels={resolvedLabels}
                  showHelper={termLabelSettings.showHelper}
                  highlightSignHint={termLabelSettings.highlightSignHint}
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
        </div>
      </CardContent>
    </Card>
  )
}
