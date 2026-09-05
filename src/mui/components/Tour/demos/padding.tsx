import React from 'react';
import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'

export default function App ():React.ReactNode  {
  return (
    <TourProvider 
      steps={steps} 
      padding={{ 
        mask: 14, 
        popover: [5, 10], 
        wrapper: 20 
      }}
    >
      <Main />
    </TourProvider>
  )
}