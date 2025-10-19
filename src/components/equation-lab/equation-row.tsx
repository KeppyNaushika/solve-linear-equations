import { cn } from "@/lib/utils"

type EquationRowProps = {
  leftLabel?: string
  rightLabel?: string
  left: React.ReactNode
  right: React.ReactNode
  leftFooter?: React.ReactNode
  rightFooter?: React.ReactNode
  className?: string
  dimmed?: boolean
}

export function EquationRow({
  leftLabel,
  rightLabel,
  left,
  right,
  leftFooter,
  rightFooter,
  className,
  dimmed,
}: EquationRowProps) {
  const hasLabels = Boolean(leftLabel || rightLabel)
  const hasFooters = Boolean(leftFooter || rightFooter)
  const mainRow = hasLabels ? 2 : 1
  const footerRow = hasLabels ? 3 : 2
  const gridTemplateRows = hasLabels
    ? hasFooters
      ? "auto auto auto"
      : "auto auto"
    : hasFooters
      ? "auto auto"
      : "auto"

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-stretch transition-opacity",
        dimmed && "opacity-40",
        className
      )}
      style={{ gridTemplateRows }}
    >
      {leftLabel ? (
        <div className="text-center text-sm font-medium text-muted-foreground md:col-start-1 md:text-left" style={{ gridRowStart: 1 }}>
          {leftLabel}
        </div>
      ) : null}
      <div className="w-full md:col-start-1" style={{ gridRowStart: mainRow }}>
        {left}
      </div>
      {leftFooter ? (
        <div className="w-full md:col-start-1" style={{ gridRowStart: footerRow }}>
          {leftFooter}
        </div>
      ) : null}
      <div
        className={cn(
          "flex h-full items-center justify-center self-center text-4xl font-semibold text-muted-foreground md:col-start-2 md:text-5xl"
        )}
        aria-hidden
        style={{ gridRowStart: mainRow }}
      >
        =
      </div>
      {rightLabel ? (
        <div className="text-center text-sm font-medium text-muted-foreground md:col-start-3 md:text-right" style={{ gridRowStart: 1 }}>
          {rightLabel}
        </div>
      ) : null}
      <div className="w-full md:col-start-3" style={{ gridRowStart: mainRow }}>
        {right}
      </div>
      {rightFooter ? (
        <div className="w-full md:col-start-3" style={{ gridRowStart: footerRow }}>
          {rightFooter}
        </div>
      ) : null}
    </div>
  )
}
