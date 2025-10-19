export type LinearEquation = {
  id: string
  leftVariable: number
  leftConstant: number
  rightVariable: number
  rightConstant: number
  solution: number
}

const RANGE = {
  variable: { min: -9, max: 9 },
  constant: { min: -12, max: 12 },
  solution: { min: -9, max: 9 },
} as const

function randomInt(min: number, max: number) {
  return Math.trunc(Math.random() * (max - min + 1)) + min
}

function randomNonZero(min: number, max: number) {
  let value = 0
  while (value === 0) {
    value = randomInt(min, max)
  }
  return value
}

/**
 * Generate a linear equation ax + b = cx + d whose solution is an integer.
 */
export function generateLinearEquation(): LinearEquation {
  while (true) {
    const leftVariable = randomNonZero(RANGE.variable.min, RANGE.variable.max)
    const rightVariable = randomNonZero(RANGE.variable.min, RANGE.variable.max)
    if (leftVariable === rightVariable) {
      continue
    }

    const leftConstant = randomNonZero(
      RANGE.constant.min,
      RANGE.constant.max
    )
    const rightConstant = randomInt(RANGE.constant.min, RANGE.constant.max)

    const numerator = rightConstant - leftConstant
    const denominator = leftVariable - rightVariable

    if (numerator % denominator !== 0) {
      continue
    }

    const solution = numerator / denominator

    if (
      solution < RANGE.solution.min ||
      solution > RANGE.solution.max ||
      !Number.isFinite(solution)
    ) {
      continue
    }

    return {
      id: crypto.randomUUID(),
      leftVariable,
      leftConstant,
      rightVariable,
      rightConstant,
      solution,
    }
  }
}

export function formatEquation(equation: LinearEquation) {
  const left = formatSide(equation.leftVariable, equation.leftConstant)
  const right = formatSide(equation.rightVariable, equation.rightConstant)
  return `${left} = ${right}`
}

export function formatEquationTeX(equation: LinearEquation) {
  const left = formatSideTeX(equation.leftVariable, equation.leftConstant)
  const right = formatSideTeX(equation.rightVariable, equation.rightConstant)
  return `${left} = ${right}`
}

function formatSide(variableCoeff: number, constant: number) {
  const parts: string[] = []
  parts.push(formatTerm(variableCoeff, true, false))
  if (constant !== 0) {
    parts.push(formatTerm(constant, false, true))
  }
  return parts.join(" ")
}

function formatTerm(
  coeff: number,
  isVariable: boolean,
  forceSign: boolean
) {
  const absValue = Math.abs(coeff)
  const sign = coeff >= 0 ? "+" : "-"
  const magnitude = isVariable
    ? `${absValue === 1 ? "" : absValue}x`
    : `${absValue}`

  if (!forceSign && coeff >= 0) {
    return magnitude
  }

  return `${sign} ${magnitude}`.trim()
}

function formatSideTeX(variableCoeff: number, constant: number) {
  const parts: string[] = []
  parts.push(formatTermTeX(variableCoeff, true, false))
  if (constant !== 0) {
    parts.push(formatTermTeX(constant, false, true))
  }
  return parts.join(" \\; ")
}

function formatTermTeX(
  coeff: number,
  isVariable: boolean,
  forceSign: boolean
) {
  const absValue = Math.abs(coeff)
  const magnitude = isVariable
    ? `${absValue === 1 ? "" : absValue}x`
    : `${absValue}`

  if (!forceSign && coeff >= 0) {
    return magnitude
  }

  const sign = coeff >= 0 ? "+" : "-"

  if (!forceSign && coeff < 0) {
    return `-${magnitude}`
  }

  return `${sign}\\,${magnitude}`
}
