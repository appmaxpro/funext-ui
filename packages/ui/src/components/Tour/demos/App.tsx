import React from 'react';
import { TourProvider } from '..'
import { steps } from './steps'
import Main from './Main'
	
export default function App () {
  return (
    <TourProvider steps={steps}>
      <Main />
    </TourProvider>
  )
}