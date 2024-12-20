import React, { useState, useContext } from 'react'
import Tour from './Tour'
import { ProviderProps, TourProps } from './types'
import { useRtl } from '../../styles'

const defaultState = {
  isOpen: false,
  setIsOpen: () => false,
  currentStep: 0,
  setCurrentStep: () => 0,
  steps: [],
  setSteps: () => [],
  setMeta: () => '',
  disabledActions: false,
  setDisabledActions: () => false,
  components: {},
}

const TourContext = React.createContext<TourProps>(defaultState)

const TourProvider: React.FC<ProviderProps> = ({
  children,
  defaultOpen = false,
  startAt = 0,
  steps: defaultSteps,
  setCurrentStep: customSetCurrentStep,
  currentStep: customCurrentStep,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [currentStep, setCurrentStep] = useState(startAt)
  const [steps, setSteps] = useState(defaultSteps)
  const [meta, setMeta] = useState('')
  const [disabledActions, setDisabledActions] = useState(false)
  const rtl = useRtl();
  const value = {
    isOpen,
    setIsOpen,
    currentStep: customCurrentStep || currentStep,
    setCurrentStep:
      customSetCurrentStep && typeof customSetCurrentStep === 'function'
        ? customSetCurrentStep
        : setCurrentStep,
    steps,
    setSteps,
    disabledActions,
    setDisabledActions,
    meta,
    setMeta,
    rtl,
    ...props,
  }

  return (
    <TourContext.Provider value={value}>
      {children}
      {isOpen ? <Tour {...value} /> : null}
    </TourContext.Provider>
  )
}

export { TourProvider }

export default TourProvider

export function useTour() {
  return useContext(TourContext)
}