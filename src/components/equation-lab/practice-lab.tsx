"use client"

import { PracticeActionsCard } from "./practice-actions-card"
import { PracticeEquationCard } from "./practice-equation-card"
import { PracticeRecordCard } from "./practice-record-card"
import { usePracticeLab } from "./use-practice-lab"

export default function PracticeLab() {
  const {
    highlightEquation,
    equation,
    equationText,
    equationInline,
    termLabelSettings,
    setTermLabelSettings,
    sensors,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    sourceLeftTerms,
    sourceRightTerms,
    resolvedLabels,
    activeId,
    leftPlaced,
    rightPlaced,
    toggleTermSign,
    stage,
    coefficientInput,
    constantInput,
    divisionInput,
    solutionInput,
    activeKeypadField,
    focusKeypadField,
    coefficientMatches,
    constantMatches,
    divisionMatches,
    solutionMatches,
    activeDrag,
    hint,
    solvedCount,
    solved,
    keepPracticing,
    loadNextEquation,
    clearPlacedTerms,
    togglePracticeMode,
    handleInputChange,
    handleDigit,
    handleBackspace,
    handleClearField,
    handleToggleSign,
  } = usePracticeLab()

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-4 py-10 md:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          一次方程式を解こう！
        </h1>
      </header>

      <PracticeEquationCard
        highlightEquation={highlightEquation}
        equation={equation}
        equationText={equationText}
        equationInline={equationInline}
        termLabelSettings={termLabelSettings}
        onSettingsChange={setTermLabelSettings}
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        sourceLeftTerms={sourceLeftTerms}
        sourceRightTerms={sourceRightTerms}
        resolvedLabels={resolvedLabels}
        activeId={activeId}
        leftPlaced={leftPlaced}
        rightPlaced={rightPlaced}
        onToggleTermSign={toggleTermSign}
        stage={stage}
        coefficientInput={coefficientInput}
        constantInput={constantInput}
        divisionInput={divisionInput}
        solutionInput={solutionInput}
        activeKeypadField={activeKeypadField}
        onFocusKeypadField={focusKeypadField}
        onInputChange={handleInputChange}
        coefficientMatches={coefficientMatches}
        constantMatches={constantMatches}
        divisionMatches={divisionMatches}
        solutionMatches={solutionMatches}
        activeDrag={activeDrag}
        hint={hint}
        solved={solved}
        onDigit={handleDigit}
        onBackspace={handleBackspace}
        onClearField={handleClearField}
        onToggleSign={handleToggleSign}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <PracticeRecordCard
            equation={equation}
            solved={solved}
            solvedCount={solvedCount}
          />
        </div>

        <div className="space-y-6">
          <PracticeActionsCard
            keepPracticing={keepPracticing}
            onLoadNextEquation={loadNextEquation}
            onClearPlacedTerms={clearPlacedTerms}
            onTogglePracticeMode={togglePracticeMode}
          />
        </div>
      </div>
    </div>
  )
}
