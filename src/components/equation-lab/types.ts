import type { LinearEquation } from "@/lib/equations"

export type Side = "left" | "right"

export type DragType = "source" | "placed"

export type SourceTerm = {
  id: string
  coeff: number
  isVariable: boolean
  side: Side
}

export type PlacedTerm = {
  instanceId: string
  sourceId: string
  baseCoeff: number
  isVariable: boolean
  originalSide: Side
  side: Side
  sign: 1 | -1
}

export type EquationState = {
  equation: LinearEquation
  sourceTerms: SourceTerm[]
}

export type TermLabelSettingsState = {
  showHelper: boolean
  highlightSignHint: boolean
  forceLeftConstantZero: boolean
  forceRightVariableZero: boolean
  forceRightConstantZero: boolean
}

export type TermLabels = {
  variable: string
  constant: string
}

export type HistoryEntry = {
  id: string
  text: string
  tex: string
}

export type DragData =
  | {
      type: "source"
      term: SourceTerm
    }
  | {
      type: "placed"
      term: PlacedTerm
    }

export type KeypadField = "coefficient" | "constant" | "division" | "solution"
