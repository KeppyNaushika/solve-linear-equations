import type { TermLabelSettingsState } from "./types"

export const DROP_ZONE_ID = {
  poolLeft: "drop-pool-left",
  poolRight: "drop-pool-right",
  left: "drop-left",
  right: "drop-right",
} as const

export const TERM_LABEL_STORAGE_KEY = "linear-equation-lab:term-label-settings"

export const defaultTermLabelSettings: TermLabelSettingsState = {
  variableLabel: "文字を含む項",
  constantLabel: "数の項",
  showHelper: true,
}
