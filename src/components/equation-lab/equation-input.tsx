import { MathJax } from "better-react-mathjax"

type EquationInputProps = {
  label: string
  expression: string
}

export function EquationInput({ label, expression }: EquationInputProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground text-center">
        {label}
      </span>
      <div className="w-full rounded-lg border border-border bg-background px-4 py-3 text-lg font-semibold text-foreground shadow-sm">
        <MathJax inline dynamic>{"\\(" + expression + "\\)"}</MathJax>
      </div>
    </div>
  )
}
