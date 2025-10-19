"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { MathJax } from "better-react-mathjax"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { toast } from "sonner"

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
import { formatEquation, formatEquationTeX } from "@/lib/equations"

import {
  defaultTermLabelSettings,
  TERM_LABEL_STORAGE_KEY,
} from "./constants"
import {
  createEquationState,
  formatExpressionTeX,
  formatExpressionText,
  getPlacedCoeff,
  isPoolDropZone,
  isSolved,
  normalizeTermLabels,
  sideFromDropId,
} from "./utils"
import {
  type DragData,
  type EquationState,
  type HistoryEntry,
  type KeypadField,
  type PlacedTerm,
  type TermLabelSettingsState,
  type TermLabels,
} from "./types"
import { DropColumn } from "./drop-column"
import { SourceZone } from "./source-zone"
import { DragPreview } from "./term-card"
import { TermLabelSettingsPopover } from "./settings-popover"
import { EquationRow } from "./equation-row"
import { CoefficientEntry } from "./coefficient-entry"
import { EquationInput } from "./equation-input"
import { Keypad } from "./keypad"

const parseInteger = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed) return null
  if (trimmed === "-") return null
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    return null
  }
  return parsed
}

export default function PracticeLab() {
  const [state, setState] = useState<EquationState | null>(null)
  const [placedTerms, setPlacedTerms] = useState<PlacedTerm[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [moveCount, setMoveCount] = useState(0)
  const [solvedCount, setSolvedCount] = useState(0)
  const [keepPracticing, setKeepPracticing] = useState(true)
  const [highlightEquation, setHighlightEquation] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null)
  const [termLabelSettings, setTermLabelSettings] = useState<TermLabelSettingsState>(
    defaultTermLabelSettings
  )
  const [stage, setStage] = useState(1)
  const [coefficientInput, setCoefficientInput] = useState("")
  const [constantInput, setConstantInput] = useState("")
  const [solutionInput, setSolutionInput] = useState("")
  const [activeKeypadField, setActiveKeypadField] = useState<KeypadField | null>(null)
  const lastSolvedEquationId = useRef<string | null>(null)

  const equation = state?.equation ?? null
  const sourceTerms = state?.sourceTerms ?? []

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 75, tolerance: 8 },
    })
  )

  const sourceLeftTerms = useMemo(
    () => sourceTerms.filter((term) => term.side === "left"),
    [sourceTerms]
  )
  const sourceRightTerms = useMemo(
    () => sourceTerms.filter((term) => term.side === "right"),
    [sourceTerms]
  )

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      const stored = window.localStorage.getItem(TERM_LABEL_STORAGE_KEY)
      if (!stored) {
        return
      }

      const parsed = JSON.parse(stored) as Partial<TermLabelSettingsState>

      setTermLabelSettings((prev) => ({
        variableLabel:
          typeof parsed.variableLabel === "string"
            ? parsed.variableLabel
            : prev.variableLabel,
        constantLabel:
          typeof parsed.constantLabel === "string"
            ? parsed.constantLabel
            : prev.constantLabel,
        showHelper:
          typeof parsed.showHelper === "boolean"
            ? parsed.showHelper
            : prev.showHelper,
      }))
    } catch {
      // 無効な JSON は無視する
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(
      TERM_LABEL_STORAGE_KEY,
      JSON.stringify(termLabelSettings)
    )
  }, [termLabelSettings])

  const resolvedLabels: TermLabels = useMemo(
    () => normalizeTermLabels(termLabelSettings),
    [termLabelSettings]
  )

  const leftPlaced = useMemo(
    () => placedTerms.filter((term) => term.side === "left"),
    [placedTerms]
  )
  const rightPlaced = useMemo(
    () => placedTerms.filter((term) => term.side === "right"),
    [placedTerms]
  )

  const leftCoefficient = useMemo(
    () => leftPlaced.reduce((sum, term) => sum + getPlacedCoeff(term), 0),
    [leftPlaced]
  )
  const rightConstant = useMemo(
    () => rightPlaced.reduce((sum, term) => sum + getPlacedCoeff(term), 0),
    [rightPlaced]
  )

  const leftExpression = useMemo(
    () =>
      formatExpressionText(
        leftPlaced.map((term) => ({
          coeff: getPlacedCoeff(term),
          isVariable: term.isVariable,
        }))
      ),
    [leftPlaced]
  )

  const rightExpression = useMemo(
    () =>
      formatExpressionText(
        rightPlaced.map((term) => ({
          coeff: getPlacedCoeff(term),
          isVariable: term.isVariable,
        }))
      ),
    [rightPlaced]
  )

  const leftExpressionTeX = useMemo(
    () =>
      formatExpressionTeX(
        leftPlaced.map((term) => ({
          coeff: getPlacedCoeff(term),
          isVariable: term.isVariable,
        }))
      ),
    [leftPlaced]
  )

  const rightExpressionTeX = useMemo(
    () =>
      formatExpressionTeX(
        rightPlaced.map((term) => ({
          coeff: getPlacedCoeff(term),
          isVariable: term.isVariable,
        }))
      ),
    [rightPlaced]
  )

  const equationText = useMemo(
    () =>
      equation
        ? formatEquation(equation)
        : "最初の問題を準備しています...",
    [equation]
  )

  const equationTeX = useMemo(
    () => (equation ? formatEquationTeX(equation) : ""),
    [equation]
  )

  const coefficientValue = parseInteger(coefficientInput)
  const constantValue = parseInteger(constantInput)
  const solutionValue = parseInteger(solutionInput)

  const coefficientMatches =
    stage >= 2 && coefficientValue !== null && coefficientValue === leftCoefficient
  const constantMatches =
    stage >= 2 && constantValue !== null && constantValue === rightConstant
  const solutionMatches =
    stage >= 3 && solutionValue !== null && equation
      ? solutionValue === equation.solution
      : false

  const equationInline = useMemo(
    () => (equation ? "\\(" + equationTeX + "\\)" : ""),
    [equation, equationTeX]
  )

  const divisionExpression = useMemo(() => {
    if (!equation) return ""
    if (leftCoefficient === 0) {
      return "x = \\text{未定義}"
    }
    return `x = \\dfrac{${rightConstant}}{${leftCoefficient}}`
  }, [equation, leftCoefficient, rightConstant])

  const fieldLabelMap: Record<KeypadField, string> = {
    coefficient: "左辺の合計係数",
    constant: "右辺の合計定数",
    solution: "x の値",
  }

  const activeFieldLabel = useMemo(() => {
    if (stage < 2) {
      return "カードを揃えてから入力できます"
    }

    if (!activeKeypadField) {
      return stage >= 4
        ? "すべての入力が完了しました"
        : "入力欄をタップして選択してください"
    }

    return `${fieldLabelMap[activeKeypadField]} を入力中`
  }, [stage, activeKeypadField])

  const solved = useMemo(
    () => (equation ? isSolved(placedTerms, equation) : false),
    [placedTerms, equation]
  )

  const hint = useMemo(() => {
    if (!equation) {
      return "最初の問題を準備しています..."
    }

    if (!placedTerms.length) {
      return "上段のカード棚から項カードを選び、下段の左右に配置して途中式を作りましょう。枠の色で進捗を確認できます。"
    }

    if (solved) {
      return `よくできました！x = ${equation.solution}。`
    }

    const variableCardLabel = `${resolvedLabels.variable}カード`
    const constantCardLabel = `${resolvedLabels.constant}カード`

    const leftHasNumber = leftPlaced.some((term) => !term.isVariable)
    const rightHasVariable = rightPlaced.some((term) => term.isVariable)

    if (leftHasNumber && rightHasVariable) {
      return `${constantCardLabel}は右辺へ、${variableCardLabel}は左辺へ寄せてから、必要に応じてカード右上のボタンで符号を整えましょう。`
    }

    if (leftHasNumber) {
      return `${constantCardLabel}を右辺へ移し、カード右上のボタンで符号を合わせましょう。`
    }

    if (rightHasVariable) {
      return `${variableCardLabel}を左辺に置き直し、ボタンで符号が期待通りになるよう調整しましょう。`
    }

    return "枠が黄色なら位置は正解です。緑になるまで符号ボタンで整えてみましょう。"
  }, [equation, leftPlaced, placedTerms.length, resolvedLabels, rightPlaced, solved])

  const loadNextEquation = useCallback(() => {
    const nextState = createEquationState()
    const { equation: nextEquation } = nextState
    setState(nextState)
    setPlacedTerms([])
    setHistory([
      {
        id: nextEquation.id,
        text: formatEquation(nextEquation),
        tex: formatEquationTeX(nextEquation),
      },
    ])
    setMoveCount(0)
    setHighlightEquation(true)
    setActiveId(null)
    setStage(1)
    setCoefficientInput("")
    setConstantInput("")
    setSolutionInput("")
    setActiveKeypadField(null)
    lastSolvedEquationId.current = null
  }, [])

  useEffect(() => {
    if (!state) {
      loadNextEquation()
    }
  }, [loadNextEquation, state])

  useEffect(() => {
    if (!highlightEquation) {
      return
    }

    const timer = window.setTimeout(() => setHighlightEquation(false), 900)

    return () => window.clearTimeout(timer)
  }, [highlightEquation])

  useEffect(() => {
    if (!equation || !placedTerms.length) {
      return
    }

    const text = `${leftExpression} = ${rightExpression}`
    const tex = `${leftExpressionTeX} = ${rightExpressionTeX}`

    setHistory((prev) => {
      const last = prev[prev.length - 1]
      if (last?.tex === tex) {
        return prev
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          text,
          tex,
        },
      ]
    })
  }, [equation, leftExpression, leftExpressionTeX, placedTerms, rightExpression, rightExpressionTeX])

  useEffect(() => {
    if (solved) {
      setStage((prev) => Math.max(prev, 2))
    }
  }, [solved])

  useEffect(() => {
    if (stage >= 2 && coefficientMatches && constantMatches) {
      setStage((prev) => Math.max(prev, 3))
    }
  }, [stage, coefficientMatches, constantMatches])

  useEffect(() => {
    if (stage >= 3 && solutionMatches) {
      setStage((prev) => Math.max(prev, 4))
    }
  }, [stage, solutionMatches])

  useEffect(() => {
    if (stage === 1) {
      if (activeKeypadField !== null) {
        setActiveKeypadField(null)
      }
      return
    }

    if (stage === 2) {
      if (!coefficientMatches) {
        if (activeKeypadField !== "coefficient") {
          setActiveKeypadField("coefficient")
        }
        return
      }
      if (!constantMatches) {
        if (activeKeypadField !== "constant") {
          setActiveKeypadField("constant")
        }
        return
      }
      if (activeKeypadField !== null) {
        setActiveKeypadField(null)
      }
      return
    }

    if (stage >= 3) {
      if (!solutionMatches) {
        if (activeKeypadField !== "solution") {
          setActiveKeypadField("solution")
        }
      } else if (activeKeypadField !== null) {
        setActiveKeypadField(null)
      }
    }
  }, [
    stage,
    activeKeypadField,
    coefficientMatches,
    constantMatches,
    solutionMatches,
  ])

  useEffect(() => {
    if (!equation || !solved || lastSolvedEquationId.current === equation.id) {
      return
    }

    lastSolvedEquationId.current = equation.id
    setSolvedCount((count) => count + 1)

    toast.success("方程式を解きました！", {
      description: keepPracticing
        ? `x = ${equation.solution}。次の問題をすぐに用意します。`
        : `x = ${equation.solution}。一息つくか、準備ができたら新しい問題に挑みましょう。`,
      duration: 2600,
    })

    if (keepPracticing) {
      const timeout = window.setTimeout(() => {
        loadNextEquation()
      }, 1600)

      return () => window.clearTimeout(timeout)
    }
  }, [equation, keepPracticing, loadNextEquation, solved])

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(String(event.active.id))
    const data = event.active.data.current as DragData | undefined
    setActiveDrag(data ?? null)
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null)
      setActiveDrag(null)
      const { active, over } = event

      if (!over) {
        return
      }

      const overId = over.id
      const targetSide = sideFromDropId(overId)
      const data = active.data.current as DragData | undefined
      if (!data) {
        return
      }

      if (data.type === "source") {
        if (!targetSide) {
          return
        }

        const source = data.term
        const newTerm: PlacedTerm = {
          instanceId: crypto.randomUUID(),
          sourceId: source.id,
          baseCoeff: source.coeff,
          isVariable: source.isVariable,
          originalSide: source.side,
          side: targetSide,
          sign: 1,
        }

        setPlacedTerms((prev) => [...prev, newTerm])
        setMoveCount((count) => count + 1)
        return
      }

      if (data.type === "placed") {
        if (overId && isPoolDropZone(overId)) {
          setPlacedTerms((prev) =>
            prev.filter((term) => term.instanceId !== data.term.instanceId)
          )
          return
        }

        if (!targetSide) {
          return
        }

        setPlacedTerms((prev) => {
          let moved = false
          const next = prev.map((term) => {
            if (term.instanceId !== data.term.instanceId) {
              return term
            }

            if (term.side === targetSide) {
              return term
            }

            moved = true
            return {
              ...term,
              side: targetSide,
            }
          })

          if (moved) {
            setMoveCount((count) => count + 1)
          }

          return next
        })
      }
    },
    []
  )

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
    setActiveDrag(null)
  }, [])

  const togglePracticeMode = useCallback(() => {
    setKeepPracticing((value) => !value)
  }, [])

  const clearPlacedTerms = useCallback(() => {
    setPlacedTerms([])
    setMoveCount(0)
    setStage(1)
    setCoefficientInput("")
    setConstantInput("")
    setSolutionInput("")
    setActiveKeypadField(null)
  }, [])

  const toggleTermSign = useCallback((instanceId: string) => {
    setPlacedTerms((prev) =>
      prev.map((term) =>
        term.instanceId === instanceId
          ? { ...term, sign: term.sign === 1 ? -1 : 1 }
          : term
      )
    )
    setMoveCount((count) => count + 1)
  }, [])

  const sanitizeInputValue = (value: string) => {
    if (!value) return ""
    if (value === "-") return "-"
    const negative = value.startsWith("-")
    let digits = negative ? value.slice(1) : value
    digits = digits.replace(/[^0-9]/g, "")
    if (!digits) {
      return negative ? "-" : ""
    }
    digits = digits.replace(/^0+(?=\d)/, "")
    if (digits === "") digits = "0"
    return negative ? `-${digits}` : digits
  }

  const setFieldValue = (field: KeypadField, updater: (prev: string) => string) => {
    const apply = (prev: string) => sanitizeInputValue(updater(prev))
    switch (field) {
      case "coefficient":
        setCoefficientInput(apply)
        break
      case "constant":
        setConstantInput(apply)
        break
      case "solution":
        setSolutionInput(apply)
        break
    }
  }

  const handleDigit = (digit: string) => {
    if (!activeKeypadField) return
    setFieldValue(activeKeypadField, (prev) => {
      if (prev === "-" || prev === "") {
        return prev + digit
      }
      if (prev === "0") {
        return digit
      }
      if (prev === "-0") {
        return `-${digit}`
      }
      return prev + digit
    })
  }

  const handleBackspace = () => {
    if (!activeKeypadField) return
    setFieldValue(activeKeypadField, (prev) => prev.slice(0, -1))
  }

  const handleClearField = () => {
    if (!activeKeypadField) return
    setFieldValue(activeKeypadField, () => "")
  }

  const handleToggleSign = () => {
    if (!activeKeypadField) return
    setFieldValue(activeKeypadField, (prev) => {
      if (!prev) return "-"
      if (prev === "-") return ""
      return prev.startsWith("-") ? prev.slice(1) : `-${prev}`
    })
  }

  const keypadDisabled = stage < 2 || activeKeypadField === null

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
                        expected={leftCoefficient}
                        stage={stage}
                        field="coefficient"
                        activeField={activeKeypadField}
                        onFocus={setActiveKeypadField}
                        matches={coefficientMatches}
                      />
                    }
                    right={
                      <CoefficientEntry
                        label="右辺の合計定数"
                        value={constantInput}
                        expected={rightConstant}
                        stage={stage}
                        field="constant"
                        activeField={activeKeypadField}
                        onFocus={setActiveKeypadField}
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
                        expected={equation.solution}
                        stage={stage}
                        field="solution"
                        activeField={activeKeypadField}
                        onFocus={setActiveKeypadField}
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
                <MathJax dynamic>{`\(${entry.tex}\)`}</MathJax>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

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
  )
}
