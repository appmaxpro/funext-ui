import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'
	
export default function App () {
  return (
    <TourProvider 
      steps={steps} 
      onClickHighlighted={(e) => {
        e.stopPropagation()
        console.log('No interaction')
      }} 
      disableInteraction
      >
      <Main />
    </TourProvider>
  )
}