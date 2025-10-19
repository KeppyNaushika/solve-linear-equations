"use client"

import { MathJaxContext } from "better-react-mathjax"

type MathJaxProviderProps = {
  children: React.ReactNode
}

const config = {
  tex: {
    inlineMath: [
      ["\\(", "\\)"],
      ["$", "$"],
    ],
    displayMath: [
      ["\\[", "\\]"],
      ["$$", "$$"],
    ],
  },
}

export function MathJaxProvider({ children }: MathJaxProviderProps) {
  return (
    <MathJaxContext version={3} config={config}>
      {children}
    </MathJaxContext>
  )
}
