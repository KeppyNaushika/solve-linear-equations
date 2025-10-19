import { cn } from "@/lib/utils"

type EquationRowProps = {
  leftLabel?: string
  rightLabel?: string
  left: React.ReactNode
  right: React.ReactNode
  className?: string
  dimmed?: boolean
}

export function EquationRow({
  leftLabel,
  rightLabel,
  left,
  right,
  className,
  dimmed,
}: EquationRowProps) {
  return (
    <div
      className={cn(
        "grid gap-6 md:grid-cols-[1fr_auto_1fr] items-stretch transition-opacity",
        dimmed && "opacity-40",
        className
      )}
    >
      <Column label={leftLabel}>{left}</Column>
      <div className="flex h-full items-center justify-center self-stretch text-4xl font-semibold text-muted-foreground md:text-5xl">
        =
      </div>
      <Column label={rightLabel}>{right}</Column>
    </div>
  )
}

function Column({
  label,
  children,
}: {
  label?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex w-full flex-col items-center gap-2">
      {label ? (
        <div className="text-sm font-medium text-muted-foreground text-center">
          {label}
        </div>
      ) : null}
      <div className="w-full">{children}</div>
    </div>
  )
}
