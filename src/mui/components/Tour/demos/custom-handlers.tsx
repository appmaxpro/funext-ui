import { useState } from 'react'
import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'
	
export default function App () {
  const [currentStep, setCurrentStep] = useState(0)
  console.log(currentStep)
  return (
    <TourProvider 
      steps={steps} 
      currentStep={currentStep}
      setCurrentStep={() => {
        if (currentStep === steps.length - 1) {
            setCurrentStep(0)    
        } else {
            setCurrentStep(currentStep + 1)
        }
      }}
    >
      <Main />
    </TourProvider>
  )
}
