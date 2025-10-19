"use client"

import { useCallback, useState, type ChangeEvent } from "react"
import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import type { TermLabelSettingsState } from "./types"

type TermLabelSettingsPopoverProps = {
  settings: TermLabelSettingsState
  onSettingsChange: (settings: TermLabelSettingsState) => void
}

export function TermLabelSettingsPopover({
  settings,
  onSettingsChange,
}: TermLabelSettingsPopoverProps) {
  const [open, setOpen] = useState(false)

  const handleInputChange = useCallback(
    (key: "variableLabel" | "constantLabel") =>
      (event: ChangeEvent<HTMLInputElement>) => {
        onSettingsChange({
          ...settings,
          [key]: event.target.value,
        })
      },
    [onSettingsChange, settings]
  )

  const toggleShowHelper = useCallback(() => {
    onSettingsChange({
      ...settings,
      showHelper: !settings.showHelper,
    })
  }, [onSettingsChange, settings])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9"
          aria-label="カードラベル設定を開く"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="space-y-4">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">ラベル設定</h3>
          <p className="text-xs text-muted-foreground">
            学習者に合わせてカード下部のラベルと表示方法をカスタマイズできます。
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            文字を含む項のラベル
          </label>
          <Input
            value={settings.variableLabel}
            onChange={handleInputChange("variableLabel")}
            placeholder="例: x を含む項"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">
            数の項のラベル
          </label>
          <Input
            value={settings.constantLabel}
            onChange={handleInputChange("constantLabel")}
            placeholder="例: 数だけの項"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={toggleShowHelper}
        >
          {settings.showHelper ? "カードのラベルを隠す" : "カードのラベルを表示する"}
        </Button>

        <p className="text-xs text-muted-foreground">
          設定内容はブラウザに保存され、次回アクセス時にも引き継がれます。
        </p>
      </PopoverContent>
    </Popover>
  )
}
