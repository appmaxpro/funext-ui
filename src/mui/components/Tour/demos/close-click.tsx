import React from 'react';
import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'
	
export default function App () {
  return (
    <TourProvider 
      steps={steps}
      onClickClose={({ setCurrentStep, currentStep, steps, setIsOpen }) => {
        if (steps) {
          if (currentStep === steps.length - 1) {
            setIsOpen(false)
          }
          setCurrentStep((s) => (s === steps.length - 1 ? 0 : s + 1))
        }
      }}>
      <Main />
    </TourProvider>
  )
}
