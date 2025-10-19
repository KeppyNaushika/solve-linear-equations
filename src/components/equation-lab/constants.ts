import type { TermLabelSettingsState, TermLabels } from "./types"

export const DROP_ZONE_ID = {
  poolLeft: "drop-pool-left",
  poolRight: "drop-pool-right",
  left: "drop-left",
  right: "drop-right",
} as const

export const TERM_LABEL_STORAGE_KEY = "linear-equation-lab:term-label-settings"

export const defaultTermLabelSettings: TermLabelSettingsState = {
  showHelper: true,
  highlightSignHint: true,
  forceLeftConstantZero: false,
  forceRightVariableZero: false,
  forceRightConstantZero: false,
}

export const DEFAULT_TERM_LABELS: TermLabels = {
  variable: "文字を含む項",
  constant: "数の項",
}
