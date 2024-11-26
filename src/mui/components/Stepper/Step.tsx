import React, { useMemo } from "react";
import { type SxComponentProps, styled } from "../../styles";
// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import {
  StepContextProvider,
  useStepContext,
  useStepperContext,
} from "./Context";

export interface StepProps extends SxComponentProps<"div"> {
  activeClassName?: string;
  completedClassName?: string;
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
    {
      index = -1,
      last = false,
      className,
      activeClassName,
      completedClassName,
      disabled,
      expanded,
      children,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { step } = useTailwindTheme();
    const {
      styles: { base },
    } = step;

    const {
      activeStep,
      stepClasses,
      inactiveClasses,
      activeClasses,
      completedClasses,
    } = useStepperContext();

    const completed = activeStep > index || (index === activeStep && last) ;
    
    const targetClasses =
      index === activeStep
        ? last
          ? completedClasses
          : activeClasses
        : index > activeStep
          ? completedClasses
          : inactiveClasses;
    // 3. set styles
    const classes = useMemo(
      () =>
        twMerge(
          objectsToString(base.initial),
          stepClasses,
          targetClasses,
          className,
        ),
      [base, stepClasses, targetClasses, className],
    );

    // 4. return
    return (
      <StepContextProvider
        value={{
          index,
          last,
          disabled,
          active: index === activeStep,
          expanded,
        }}
      >
        <StepRoot {...rest} ref={ref} className={classes}>
          {children}
        </StepRoot>
      </StepContextProvider>
    );
  },
);

Step.displayName = "Mux.Step";

export default Step;
