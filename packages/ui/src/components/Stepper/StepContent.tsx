"use client";
import * as React from "react";
import Collapse from "../Collapse";
import {
  type SxComponentProps,
  composeClasses,
  useMuxDefaultProps,
  memoTheme,
  clsx,
  styled,
  generateUtilityClasses,
  generateUtilityClass,
  SxThemeProps,
} from "../../styles";
import { useStepContext, useStepperContext } from "./Context";
import { StandardProps } from "../../theme/tw/props";
import {
  getTransitionProps,
  getTransition,
  reflow,
  TransitionProps,
} from "../../../../../ux/src/core/transitions";

const useUtilityClasses = (ownerState:any) => {
  const { classes, last } = ownerState;

  const slots = { root: ["root", last && "last"], transition: ["transition"] };

  return composeClasses(slots, getStepContentUtilityClass, classes);
};

const StepContentRoot = styled("div", {
  name: "MuxStepContent",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, ownerState.last && styles.last];
  },
})(
  memoTheme(({ theme }) => ({
    marginLeft: 12, // half icon
    paddingLeft: 8 + 12, // margin + half icon
    paddingRight: 8,
    borderLeft: theme.vars
      ? `1px solid ${theme.vars.palette.StepContent.border}`
      : `1px solid ${
          theme.palette.mode === "light"
            ? theme.palette.grey[400]
            : theme.palette.grey[600]
        }`,
    variants: [
      {
        props: { last: true },
        style: {
          borderLeft: "none",
        },
      },
    ],
  })),
);

const StepContentTransition = styled(Collapse, {
  name: "MuxStepContent",
  slot: "Transition",
  overridesResolver: (props, styles) => styles.transition,
})({});

export interface StepContentClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `last={true}` (controlled by `Step`). */
  last: string;
  /** Styles applied to the Transition component. */
  transition: string;
}

export type StepContentClassKey = keyof StepContentClasses;

export function getStepContentUtilityClass(slot: string): string {
  return generateUtilityClass("MuxStepContent", slot);
}

export const stepContentClasses: StepContentClasses = generateUtilityClasses(
  "MuxStepContent",
  ["root", "last", "transition"],
);

export interface StepContentProps
  extends StandardProps<
    React.HTMLAttributes<HTMLDivElement>,
    StepContentClassKey
  > {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<StepContentClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The component used for the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @default Collapse
   */
  TransitionComponent?: React.JSXElementConstructor<
    TransitionProps & { children: React.ReactElement<unknown, any> }
  >;
  /**
   * Adjust the duration of the content expand transition.
   * Passed as a prop to the transition component.
   *
   * Set to 'auto' to automatically calculate transition time based on height.
   * @default 'auto'
   */
  transitionDuration?: TransitionProps["timeout"] | "auto";
  /**
   * Props applied to the transition element.
   * By default, the element is based on this [`Transition`](https://reactcommunity.org/react-transition-group/transition/) component.
   */
  TransitionProps?: TransitionProps;
}

export const StepContent = React.forwardRef<HTMLDivElement, StepContentProps>(
  function StepContent(inProps, ref) {
    const props = useMuxDefaultProps({
      props: inProps,
      name: "MuxStepContent",
    });
    const {
      children,
      className,
      TransitionComponent = Collapse,
      transitionDuration: transitionDurationProp = "auto",
      TransitionProps,
      ...other
    } = props;

    const { orientation } = useStepperContext();
    const { active, last, expanded } = useStepContext();

    const ownerState = { ...props, last };
    const classes = useUtilityClasses(ownerState);

    if (process.env.NODE_ENV !== "production") {
      if (orientation !== "vertical") {
        console.error(
          "Mux: <StepContent /> is only designed for use with the vertical stepper.",
        );
      }
    }

    let transitionDuration = transitionDurationProp;

    return (
      <StepContentRoot
        className={clsx(classes.root, className)}
        ref={ref as any}
        ownerState={ownerState}
        {...other}
      >
        <StepContentTransition
          as={TransitionComponent}
          in={active || expanded}
          className={classes.transition}
          ownerState={ownerState}
          //@ts-ignore
          timeout={transitionDuration}
          unmountOnExit
          {...TransitionProps}
        >
          {children}
        </StepContentTransition>
      </StepContentRoot>
    );
  },
);

export default StepContent;
