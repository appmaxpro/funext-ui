import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'
	
export default function App () {
  return (
    <TourProvider 
      steps={steps} 
      prevButton={({ currentStep, setCurrentStep, steps }) => {
        const first = currentStep === 0
        return (
          <button
            onClick={() => {
              if (first) {
                setCurrentStep((s) => steps.length - 1)
              } else {
                setCurrentStep((s) => s - 1)
              }
            }}
          >
            Back
          </button>
        )
      }}
      nextButton={({
        Button,
        currentStep,
        stepsLength,
        setIsOpen,
        setCurrentStep,
        steps,
      }) => {
        const last = currentStep === stepsLength - 1
        return (
            <Button
              onClick={() => {
                  if (last) {
                    setIsOpen(false)
                  } else {
                    setCurrentStep((s) => (s === steps?.length - 1 ? 0 : s + 1))
                  }
              }}
            >
              {last ? 'Close!' : null}
            </Button>
        )
      }}
    >
      <Main />
    </TourProvider>
  )
}
