import React from "react";

// utils
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import {
  className,
  children
} from "../../types/components/stepper";

export interface StepProps extends React.ComponentProps<"div"> {
  className?: className;
  activeClassName?: className;
  completedClassName?: className;
  children?: children;
}

export const Step = React.forwardRef<HTMLDivElement, StepProps>(
  ({ className, activeClassName, completedClassName, children, ...rest }, ref) => {
    // 1. init
    const { step } = useTailwindTheme();
    const {
      styles: { base },
    } = step;

    // 3. set styles
    const stepClasses = twMerge(objectsToString(base.initial), className);

    // 4. return
    return (
      <div {...rest} ref={ref} className={stepClasses}>
        {children}
      </div>
    );
  },
);

Step.displayName = "Mux.Step";

export default Step;
