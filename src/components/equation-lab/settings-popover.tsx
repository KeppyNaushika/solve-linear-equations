"use client"

import { useCallback, useState } from "react"
import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

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

  const handleToggle = useCallback(
    (key: keyof TermLabelSettingsState) => (checked: boolean) => {
      onSettingsChange({
        ...settings,
        [key]: checked,
      })
    },
    [onSettingsChange, settings]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="h-9 w-9" aria-label="表示設定を開く">
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-4 bg-white p-4 shadow-lg">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">表示設定</h3>
          <p className="text-xs text-muted-foreground">
            カードのラベル表示やヒントの強調を切り替えられます。
          </p>
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">カード下部のラベル</p>
            <p className="text-xs text-muted-foreground">カードの種類を示すラベルを表示します。</p>
          </div>
          <Switch
            checked={settings.showHelper}
            onCheckedChange={handleToggle("showHelper")}
            aria-label="カードのラベル表示を切り替える"
          />
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-3">
          <div>
            <p className="text-sm font-medium text-foreground">符号調整が必要なカードの強調</p>
            <p className="text-xs text-muted-foreground">
              ドラッグ後に符号を変える必要があるカードをオレンジ色で示します。
            </p>
          </div>
          <Switch
            checked={settings.highlightSignHint}
            onCheckedChange={handleToggle("highlightSignHint")}
            aria-label="符号調整のヒント表示を切り替える"
          />
        </div>

        <p className="text-xs text-muted-foreground">
          設定内容はブラウザに保存され、次回アクセス時にも引き継がれます。
        </p>
      </PopoverContent>
    </Popover>
  )
}
