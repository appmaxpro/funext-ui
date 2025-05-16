"use client";
import * as React from "react";
import {
  generateUtilityClass,
  composeClasses,
  styled,
  useMuxDefaultProps,
  generateUtilityClasses,
  SxThemeProps,
  clsx,
  memoTheme,
} from "../../styles";
import { OverrideProps, StandardProps } from "../../theme/tw/props";
export interface CardActionsClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element unless `disableSpacing={true}`. */
  spacing: string;
}

export type CardActionsClassKey = keyof CardActionsClasses;

function getUtilityClass(slot: string): string {
  return generateUtilityClass("MuxCardActions", slot);
}

export const cardActionsClasses: CardActionsClasses = generateUtilityClasses(
  "MuxCardActions",
  ["root", "spacing"],
);

const useUtilityClasses = (ownerState: any) => {
  const { classes, disableSpacing } = ownerState;

  const slots = {
    root: ["root", !disableSpacing && "spacing"],
  };

  return composeClasses(slots, getUtilityClass, classes);
};

export interface CardActionsProps
  extends StandardProps<
    React.HTMLAttributes<HTMLDivElement>,
    CardActionsClassKey
  > {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CardActionsClasses>;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * If `true`, the actions do not have additional margin.
   * @default false
   */
  disableSpacing?: boolean;
}

const CardActionsRoot = styled("div", {
  name: "MuxCardActions",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [styles.root, !ownerState.disableSpacing && styles.spacing];
  },
})({
  display: "flex",
  alignItems: "center",
  padding: 8,
  variants: [
    {
      props: { disableSpacing: false },
      style: {
        "& > :not(style) ~ :not(style)": {
          marginLeft: 8,
        },
      },
    },
  ],
});

export const CardActions = React.forwardRef<HTMLElement, CardActionsProps>(
  function CardActions(inProps, ref) {
    const props = useMuxDefaultProps({
      props: inProps,
      name: "MuxCardActions",
    });

    const { disableSpacing = false, className, ...other } = props;

    const ownerState = { ...props, disableSpacing };

    const classes = useUtilityClasses(ownerState);

    return (
      <CardActionsRoot
        className={clsx(classes.root, className)}
        ownerState={ownerState}
        ref={ref as any}
        {...other}
      />
    );
  },
);
