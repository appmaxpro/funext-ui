import React, { useMemo } from "react";
import { type SxComponentProps, styled } from "../../styles";

// @floating-ui
import { useMergeRefs } from "@floating-ui/react";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// components
import Step from "./Step";

// types
import {
  isFirstStep,
  isLastStep,
  activeStep,
  className,
  children,
} from "../../types/components/stepper";
import { StepperContextProvider, useStepContext, useStepperContext } from "./Context";

export interface StepperProps extends SxComponentProps<"div"> {
  activeStep?: number;
  isFirstStep?: isFirstStep;
  isLastStep?: isLastStep;
  lineClassName?: className;
  activeLineClassName?: className;
  alternativeLabel?: boolean;
  stepClasses?: {
    inactive?: string;
    active?: string;
    completed?: string;
  }
  connector?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  completed?: boolean;
}

const StepperRoot = styled("div", {
  name: "MuxStepper",
  slot: "Root",
})("");

const StepperFc = React.forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      activeStep = -1,
      className,
      lineClassName,
      activeLineClassName,
      stepClasses,
      alternativeLabel,
      connector,
      orientation = "horizontal",
      isFirstStep,
      isLastStep,
      children,
      completed,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const theme = useTailwindTheme();
    const { stepper, step } = theme;
    const {
      styles: { base },
    } = stepper;
    const {
      styles: { base: stepBase },
    } = step;
    const containerRef = React.useRef(null);

    const [widthPerStep, setWidthPerStep] = React.useState(0);
    const childrenArray = React.Children.toArray(children).filter(Boolean);


    const isReachEnd =
       activeStep! > childrenArray.length - 1;

    React.useEffect(() => {
      if (containerRef.current) {
        const childrenInstance: any = children;
        const { width } = (containerRef.current as any).getBoundingClientRect();
        const widthPerStepCalc = width / (childrenInstance.length - 1);

        setWidthPerStep(widthPerStepCalc);
      }
    }, [children]);

    const width = React.useMemo(() => {
      return widthPerStep * activeStep!;
    }, [activeStep, widthPerStep]);

    const mergedRef = useMergeRefs([ref, containerRef]);

    // 3. set styles
    const {
      stepperClasses,
      lineClasses,
      activeLineClasses,
      inactiveClasses,
      activeClasses,
      completedClasses,
    } = useMemo(() => {
      const stepperClasses = twMerge(objectsToString(base.stepper), className);
      const lineClasses = twMerge(
        objectsToString(base.line.initial),
        lineClassName,
      );
      const activeLineClasses = twMerge(
        lineClasses,
        objectsToString(base.line.active),
        activeLineClassName,
      );

      const inactiveClasses = twMerge(objectsToString(stepBase.inactive), stepClasses?.inactive);
      const activeClasses = twMerge(objectsToString(stepBase.active), stepClasses?.active);
      const completedClasses = twMerge(objectsToString(stepBase.completed), stepClasses?.completed);
      return {
        stepperClasses,
        lineClasses,
        activeLineClasses,
        inactiveClasses,
        activeClasses,
        completedClasses,
      };
    }, [theme, className, lineClassName, activeLineClassName, stepClasses]);


    
    const steps = childrenArray.map((step, index) => {
      return (
        step &&
        React.cloneElement(step as any, {
          ...(step as any).props,
          index,
          last: index + 1 === childrenArray.length,
          
        })
      );
    });

    const contextValue = React.useMemo(
      () => ({
        activeStep,
        alternativeLabel,
        connector,
        orientation,
        inactiveClasses,
        activeClasses,
        completedClasses,
        completed
      }),
      [
        activeStep,
        alternativeLabel,
        connector,
        orientation,
        inactiveClasses,
        activeClasses,
        completedClasses,
        completed
      ],
    );
    // 4. return
    return (
      <StepperContextProvider
        value={contextValue}
      >
        <StepperRoot {...rest} ref={mergedRef} className={stepperClasses}>
          <div className={lineClasses} />
          <div
            className={activeLineClasses}
            style={{
              width: `${width}px`,
            }}
          />
          {steps}
        </StepperRoot>
      </StepperContextProvider>
    );
  },
);

export const Stepper = Object.assign(StepperFc, {
  Step,
  useStepperContext,
  useStepContext,
  displayName: "Mux.Stepper"
})

export default Stepper;
