import { generateLinearEquation } from "@/lib/equations"

import {
  type TermLabelSettingsState,
  type TermLabels,
  type DragData,
  type EquationState,
  type PlacedTerm,
  type Side,
  type SourceTerm,
} from "./types"
import { DROP_ZONE_ID, defaultTermLabelSettings } from "./constants"

export function createTerm(coeff: number, isVariable: boolean, side: Side): SourceTerm {
  return {
    id: crypto.randomUUID(),
    coeff,
    isVariable,
    side,
  }
}

export function buildTermsFromEquation(equation: EquationState["equation"]): SourceTerm[] {
  const terms: SourceTerm[] = []

  terms.push(createTerm(equation.leftVariable, true, "left"))
  if (equation.leftConstant !== 0) {
    terms.push(createTerm(equation.leftConstant, false, "left"))
  }

  terms.push(createTerm(equation.rightVariable, true, "right"))
  if (equation.rightConstant !== 0) {
    terms.push(createTerm(equation.rightConstant, false, "right"))
  }

  return terms
}

export function createEquationState(): EquationState {
  const equation = generateLinearEquation()
  return {
    equation,
    sourceTerms: buildTermsFromEquation(equation),
  }
}

export function sideFromDropId(id: string | number | null): Side | null {
  if (id === DROP_ZONE_ID.left) return "left"
  if (id === DROP_ZONE_ID.right) return "right"
  return null
}

export function getPlacedCoeff(term: PlacedTerm) {
  return term.baseCoeff * term.sign
}

export function expectedSign(term: PlacedTerm): 1 | -1 {
  return term.side === term.originalSide ? 1 : -1
}

export function isTermPositionCorrect(term: PlacedTerm) {
  return term.side === "left" ? term.isVariable : !term.isVariable
}

export function isTermSignCorrect(term: PlacedTerm) {
  return term.sign === expectedSign(term)
}

export function formatCardText(coeff: number, isVariable: boolean) {
  const absValue = Math.abs(coeff)
  const magnitude = isVariable
    ? `${absValue === 1 ? "" : absValue}x`
    : `${absValue}`
  return coeff >= 0 ? `+${magnitude}` : `-${magnitude}`
}

export function formatCardTeX(coeff: number, isVariable: boolean) {
  const absValue = Math.abs(coeff)
  const magnitude = isVariable
    ? `${absValue === 1 ? "" : absValue}x`
    : `${absValue}`
  return coeff >= 0 ? `+\\,${magnitude}` : `-\\,${magnitude}`
}

export function formatExpressionText(terms: Array<{ coeff: number; isVariable: boolean }>) {
  if (!terms.length) {
    return "0"
  }

  return terms
    .map((term, index) => formatExpressionTermText(term.coeff, term.isVariable, index === 0))
    .join(" ")
}

function formatExpressionTermText(
  coeff: number,
  isVariable: boolean,
  isFirst: boolean
) {
  const absValue = Math.abs(coeff)
  const magnitude = isVariable
    ? `${absValue === 1 ? "" : absValue}x`
    : `${absValue}`

  if (isFirst) {
    return coeff >= 0 ? magnitude : `- ${magnitude}`
  }

  return `${coeff >= 0 ? "+" : "-"} ${magnitude}`
}

export function formatExpressionTeX(terms: Array<{ coeff: number; isVariable: boolean }>) {
  if (!terms.length) {
    return "0"
  }

  return terms
    .map((term, index) => formatExpressionTermTeX(term.coeff, term.isVariable, index === 0))
    .join(" \\; ")
}

function formatExpressionTermTeX(
  coeff: number,
  isVariable: boolean,
  isFirst: boolean
) {
  const absValue = Math.abs(coeff)
  const magnitude = isVariable
    ? `${absValue === 1 ? "" : absValue}x`
    : `${absValue}`
  const sign = coeff >= 0 ? "+" : "-"

  if (isFirst) {
    return coeff >= 0 ? magnitude : `-${magnitude}`
  }

  return `${sign}\\,${magnitude}`
}

export function getCardStatusClass(options: {
  isSource: boolean
  isVariable: boolean
  isPositionCorrect?: boolean
  isSignCorrect?: boolean
}) {
  const { isSource, isVariable, isPositionCorrect = false, isSignCorrect = false } = options
  if (isSource) {
    return isVariable
      ? "bg-primary/5 border-primary/40"
      : "bg-secondary/40 border-secondary/50"
  }

  if (!isPositionCorrect) {
    return "border-destructive/60 bg-destructive/10"
  }

  if (isSignCorrect) {
    return "border-emerald-500/70 bg-emerald-500/10"
  }

  return "border-amber-500/70 bg-amber-500/10"
}

export function isSolved(placed: PlacedTerm[], equation: EquationState["equation"]) {
  if (!placed.length) {
    return false
  }

  const left = placed
    .filter((term) => term.side === "left")
    .map((term) => ({
      coeff: getPlacedCoeff(term),
      isVariable: term.isVariable,
    }))

  const right = placed
    .filter((term) => term.side === "right")
    .map((term) => ({
      coeff: getPlacedCoeff(term),
      isVariable: term.isVariable,
    }))

  if (!left.length || !right.length) {
    return false
  }

  if (placed.some((term) => term.sign !== expectedSign(term))) {
    return false
  }

  if (left.some((term) => !term.isVariable)) {
    return false
  }

  if (right.some((term) => term.isVariable)) {
    return false
  }

  const leftCoefficient = left.reduce((sum, term) => sum + term.coeff, 0)

  if (leftCoefficient === 0) {
    return false
  }

  const rightConstant = right.reduce((sum, term) => sum + term.coeff, 0)
  const computedSolution = rightConstant / leftCoefficient

  return (
    Number.isFinite(computedSolution) &&
    Math.abs(computedSolution - equation.solution) < 1e-9
  )
}

export function isPoolDropZone(id: string | number) {
  return id === DROP_ZONE_ID.poolLeft || id === DROP_ZONE_ID.poolRight
}

export function normalizeTermLabels(labels: TermLabelSettingsState): TermLabels {
  return {
    variable: labels.variableLabel.trim() || defaultTermLabelSettings.variableLabel,
    constant: labels.constantLabel.trim() || defaultTermLabelSettings.constantLabel,
  }
}

export type { DragData }
