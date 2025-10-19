"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/core"
import { PointerSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core"
import { toast } from "sonner"

import { createId, formatEquation, formatEquationTeX } from "@/lib/equations"

import {
  DEFAULT_TERM_LABELS,
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

const parseCoefficient = (value: string) => {
  const trimmed = value.trim()
  if (!trimmed || trimmed === "-") {
    return null
  }

  const normalized = trimmed.toLowerCase()
  if (!normalized.endsWith("x")) {
    return null
  }

  const numericPart = normalized.slice(0, -1)
  if (!numericPart || numericPart === "+") {
    return 1
  }
  if (numericPart === "-") {
    return -1
  }

  const parsed = Number(numericPart)
  if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
    return null
  }
  return parsed
}

const sanitizeNumericValue = (value: string) => {
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

const sanitizeCoefficientValue = (value: string) => {
  if (!value) return ""
  const trimmed = value.replace(/\s+/g, "")
  if (!trimmed) return ""

  const isNegative = trimmed.startsWith("-")
  const isPositive = trimmed.startsWith("+")
  const rest = (isNegative || isPositive) ? trimmed.slice(1) : trimmed
  let digits = ""
  let hasX = false

  for (const char of rest) {
    if (char === "x" || char === "X") {
      if (hasX) {
        continue
      }
      hasX = true
      continue
    }
    if (/[0-9]/.test(char)) {
      if (hasX) {
        continue
      }
      digits += char
    }
  }

  if (!digits && !hasX) {
    return isNegative ? "-" : ""
  }

  digits = digits.replace(/^0+(?=\d)/, "")
  if (digits === "") {
    if (!hasX) {
      return isNegative ? "-" : ""
    }
  }

  const prefix = isNegative ? "-" : ""
  return `${prefix}${digits}${hasX ? "x" : ""}`
}

export function usePracticeLab() {
  const [state, setState] = useState<EquationState | null>(null)
  const [placedTerms, setPlacedTerms] = useState<PlacedTerm[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
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
  const [divisionInput, setDivisionInput] = useState("")
  const [solutionInput, setSolutionInput] = useState("")
  const [activeKeypadField, setActiveKeypadField] = useState<KeypadField | null>(null)
  const lastSolvedEquationId = useRef<string | null>(null)

  const equation = state?.equation ?? null
  const sourceTerms = useMemo(() => state?.sourceTerms ?? [], [state?.sourceTerms])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 6 },
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
        showHelper:
          typeof parsed.showHelper === "boolean" ? parsed.showHelper : prev.showHelper,
        highlightSignHint:
          typeof parsed.highlightSignHint === "boolean"
            ? parsed.highlightSignHint
            : prev.highlightSignHint ?? defaultTermLabelSettings.highlightSignHint,
        forceLeftConstantZero:
          typeof parsed.forceLeftConstantZero === "boolean"
            ? parsed.forceLeftConstantZero
            : prev.forceLeftConstantZero ?? defaultTermLabelSettings.forceLeftConstantZero,
        forceRightVariableZero:
          typeof parsed.forceRightVariableZero === "boolean"
            ? parsed.forceRightVariableZero
            : prev.forceRightVariableZero ?? defaultTermLabelSettings.forceRightVariableZero,
        forceRightConstantZero:
          typeof parsed.forceRightConstantZero === "boolean"
            ? parsed.forceRightConstantZero
            : prev.forceRightConstantZero ?? defaultTermLabelSettings.forceRightConstantZero,
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

  const resolvedLabels: TermLabels = DEFAULT_TERM_LABELS

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

  const coefficientValue = parseCoefficient(coefficientInput)
  const constantValue = parseInteger(constantInput)
  const divisionValue = parseInteger(divisionInput)
  const solutionValue = parseInteger(solutionInput)

  const leftExpressionForHistory = leftExpression
  const rightExpressionForHistory = rightExpression

  const coefficientMatches =
    stage >= 2 && coefficientValue !== null && coefficientValue === leftCoefficient
  const constantMatches =
    stage >= 2 && constantValue !== null && constantValue === rightConstant
  const divisionMatches =
    stage >= 3 && divisionValue !== null
      ? divisionValue === leftCoefficient
      : false
  const solutionMatches =
    stage >= 4 && solutionValue !== null && equation
      ? solutionValue === equation.solution
      : false

  const equationInline = useMemo(
    () => (equation ? "\\(" + equationTeX + "\\)" : ""),
    [equation, equationTeX]
  )

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
    const constraints = {
      forceLeftConstantZero: termLabelSettings.forceLeftConstantZero,
      forceRightVariableZero: termLabelSettings.forceRightVariableZero,
      forceRightConstantZero: termLabelSettings.forceRightConstantZero,
    }
    const nextState = createEquationState(constraints)
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
    setHighlightEquation(true)
    setActiveId(null)
    setStage(1)
    setCoefficientInput("")
    setConstantInput("")
    setDivisionInput("")
    setSolutionInput("")
    setActiveKeypadField(null)
    lastSolvedEquationId.current = null
  }, [termLabelSettings])

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

    const text = `${leftExpressionForHistory} = ${rightExpressionForHistory}`
    const tex = `${leftExpressionTeX} = ${rightExpressionTeX}`

    setHistory((prev) => {
      const last = prev[prev.length - 1]
      if (last?.tex === tex) {
        return prev
      }

      return [
        ...prev,
        {
          id: createId(),
          text,
          tex,
        },
      ]
    })
  }, [
    equation,
    leftExpressionForHistory,
    leftExpressionTeX,
    placedTerms,
    rightExpressionForHistory,
    rightExpressionTeX,
  ])

  useEffect(() => {
    if (solved) {
      setStage((prev) => Math.max(prev, 2))
    }
  }, [solved])

  useEffect(() => {
    if (stage >= 2 && coefficientMatches && constantMatches) {
      // If coefficient is 1, skip division and go straight to solution
      if (leftCoefficient === 1) {
        setStage((prev) => Math.max(prev, 4))
      } else {
        setStage((prev) => Math.max(prev, 3))
      }
    }
  }, [stage, coefficientMatches, constantMatches, leftCoefficient])

  useEffect(() => {
    if (stage >= 3 && divisionMatches) {
      setStage((prev) => Math.max(prev, 4))
    }
  }, [stage, divisionMatches])

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

    if (stage === 3) {
      if (!divisionMatches) {
        if (activeKeypadField !== "division") {
          setActiveKeypadField("division")
        }
      } else if (activeKeypadField !== null) {
        setActiveKeypadField(null)
      }
      return
    }

    if (stage >= 4) {
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
    divisionMatches,
    solutionMatches,
  ])

  useEffect(() => {
    if (
      !equation ||
      stage < 4 ||
      !solutionMatches ||
      lastSolvedEquationId.current === equation.id
    ) {
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
  }, [equation, keepPracticing, loadNextEquation, solutionMatches, stage])

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
          instanceId: createId(),
          sourceId: source.id,
          baseCoeff: source.coeff,
          isVariable: source.isVariable,
          originalSide: source.side,
          side: targetSide,
          sign: 1,
        }

        setPlacedTerms((prev) => [...prev, newTerm])
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
          const next = prev.map((term) => {
            if (term.instanceId !== data.term.instanceId) {
              return term
            }

            if (term.side === targetSide) {
              return term
            }

            return {
              ...term,
              side: targetSide,
            }
          })


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
    setStage(1)
    setCoefficientInput("")
    setConstantInput("")
    setDivisionInput("")
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
  }, [])

  const sanitizeInputValue = useCallback((field: KeypadField, value: string) => {
    if (field === "coefficient") {
      return sanitizeCoefficientValue(value)
    }
    return sanitizeNumericValue(value)
  }, [])

  const setFieldValue = useCallback(
    (field: KeypadField, updater: (prev: string) => string) => {
      const apply = (prev: string) => sanitizeInputValue(field, updater(prev))
      switch (field) {
        case "coefficient":
          setCoefficientInput(apply)
          break
        case "constant":
          setConstantInput(apply)
          break
        case "division":
          setDivisionInput(apply)
          break
        case "solution":
          setSolutionInput(apply)
          break
      }
    },
    [sanitizeInputValue]
  )

  const handleDigit = (digit: string) => {
    if (!activeKeypadField) return
    setFieldValue(activeKeypadField, (prev) => {
      if (activeKeypadField === "coefficient") {
        if (digit === "x") {
          if (prev.includes("x")) {
            return prev
          }
          if (!prev || prev === "-" || prev === "+") {
            return prev === "-" ? "-x" : "x"
          }
          return `${prev}x`
        }
        if (prev.includes("x")) {
          return prev
        }
      } else if (digit === "x") {
        return prev
      }

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

  const focusKeypadField = useCallback((field: KeypadField) => {
    setActiveKeypadField(field)
  }, [])

  const handleInputChange = useCallback(
    (field: KeypadField, rawValue: string) => {
      setFieldValue(field, () => rawValue)
    },
    [setFieldValue]
  )

  return {
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
    activeDrag,
    hint,
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
  }
}
