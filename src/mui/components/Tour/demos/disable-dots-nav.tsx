import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'
	
export default function App () {
  return (
    <TourProvider steps={steps} disableDotsNavigation>
      <Main />
    </TourProvider>
  )
}