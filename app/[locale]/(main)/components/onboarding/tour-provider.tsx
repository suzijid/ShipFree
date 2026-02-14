'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import { TOUR_STEPS } from './tour-steps-config'
import { TourOverlay } from './tour-overlay'
import { TourStepTooltip } from './tour-step'

const TOUR_STORAGE_KEY = 'gradia-tour-completed'

export const TourProvider = ({ children }: { children: React.ReactNode }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const currentStep = TOUR_STEPS[currentStepIndex]
  const isModal = currentStep?.id === 'welcome' || currentStep?.id === 'ready'

  // Check if tour should show
  useEffect(() => {
    const completed = localStorage.getItem(TOUR_STORAGE_KEY)
    if (!completed) {
      // Delay to let the page render
      const timer = setTimeout(() => setIsActive(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Find and measure target element
  useEffect(() => {
    if (!isActive || !currentStep || isModal) {
      setTargetRect(null)
      return
    }

    const findTarget = () => {
      const el = document.querySelector(`[data-tour="${currentStep.target}"]`)
      if (el) {
        setTargetRect(el.getBoundingClientRect())
      } else {
        setTargetRect(null)
      }
    }

    findTarget()
    window.addEventListener('resize', findTarget)
    return () => window.removeEventListener('resize', findTarget)
  }, [isActive, currentStep, isModal])

  const handleNext = useCallback(() => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      setCurrentStepIndex((i) => i + 1)
    } else {
      setIsActive(false)
      localStorage.setItem(TOUR_STORAGE_KEY, 'true')
    }
  }, [currentStepIndex])

  const handleSkip = useCallback(() => {
    setIsActive(false)
    localStorage.setItem(TOUR_STORAGE_KEY, 'true')
  }, [])

  return (
    <>
      {children}
      <AnimatePresence>
        {isActive && currentStep && (
          <>
            <TourOverlay targetRect={targetRect} isModal={isModal} />
            <TourStepTooltip
              step={currentStep}
              currentIndex={currentStepIndex}
              totalSteps={TOUR_STEPS.length}
              onNext={handleNext}
              onSkip={handleSkip}
              targetRect={targetRect}
            />
          </>
        )}
      </AnimatePresence>
    </>
  )
}
