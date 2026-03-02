import React, { useMemo } from "react";
import { type SxComponentProps, styled } from "../../styles";
// utils
import { twMerge } from "tailwind-merge";
import values from "../../utils/values";

// context
import { useTailwindTheme } from "../../theme";
import {
  StepContextProvider,
  useStepContext,
  useStepperContext,
} from "./Context";

export interface StepProps extends SxComponentProps<"div"> {
  index?: number;
  last?: boolean;
  disabled?: boolean;
  expanded?: boolean;
}

const StepRoot = styled("div", {
  name: "MuxStep",
  slot: "Root",
})("");

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  (
    props,
    ref,
  ) => {
    // 1. init
    const { step } = useTailwindTheme();
    const {
      styles: { base },
    } = step;

    const {
      index = -1,
      last = false,
      className,
      disabled,
      expanded,
      children,
      ...rest
    } = props;

    const {
      activeStep,
      stepClasses,
      inactiveClasses,
      activeClasses,
      completedClasses,
      completed
    } = useStepperContext();

    //const completed = activeStep > index || (index === activeStep && last) ;
    
    const targetClasses =
      completed || index < activeStep
      ?  completedClasses
      : index === activeStep
        ? activeClasses
        : inactiveClasses;
    // 3. set styles
    const classes = useMemo(
      () =>
        twMerge(
          values(base.initial),
          stepClasses,
          targetClasses,
          className,
        ),
      [base, stepClasses, targetClasses, className],
    );

    const value = {
      index,
      last,
      disabled,
      active: index === activeStep,
      expanded,

    }

    // 4. return
    return (
      <StepContextProvider
        value={value}
      >
        <StepRoot {...rest} ownerState={props} ref={ref} className={classes}>
          {children}
        </StepRoot>
      </StepContextProvider>
    );
  },
);

Step.displayName = "Mux.Step";

export default Step;
