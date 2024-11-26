import { createContext, useContext } from "react";


interface StepperContextValue{
  activeStep: number;
  stepClasses?: string;
  inactiveClasses?: string;
  activeClasses?: string;
  completedClasses?: string;
  alternativeLabel?: boolean;
  connector?: React.ReactNode;
  nonLinear?: boolean;
  orientation: 'horizontal' | 'vertical';
}

interface StepContextValue{
  index: number;
  last?: boolean;
  disabled?: boolean;
  expanded?: boolean;
  active?: boolean;
  completed?: boolean;
}

const StepperContext = createContext<StepperContextValue>({
  activeStep: -1,
  orientation: 'horizontal'
});

const StepContext = createContext<StepContextValue>({index: -1});

export const StepperContextProvider = StepperContext.Provider;
export const StepContextProvider = StepContext.Provider;

export const useStepperContext = ()=> useContext(StepperContext);
export const useStepContext = ()=> useContext(StepContext);

