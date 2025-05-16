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
import { OverrideProps } from "../../theme/tw/props";
import {
  ButtonBase,
  ButtonBaseTypeMap,
  ExtendButtonBaseTypeMap,
} from "../Button";

export interface CardActionAreaClasses {
  /** Styles applied to the root element. */
  root: string;
  /** State class applied to the ButtonBase root element if the action area is keyboard focused. */
  focusVisible: string;
  /** Styles applied to the overlay that covers the action area when it is keyboard focused. */
  focusHighlight: string;
}

export type CardActionAreaClassKey = keyof CardActionAreaClasses;

function getUtilityClass(slot: string): string {
  return generateUtilityClass("MuxCardActionArea", slot);
}

export const cardActionAreaClasses: CardActionAreaClasses =
  generateUtilityClasses("MuxCardActionArea", [
    "root",
    "focusVisible",
    "focusHighlight",
  ]);

export interface CardActionAreaOwnProps {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CardActionAreaClasses>;
  focusVisibleClassName?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

export type CardActionAreaTypeMap<
  AdditionalProps,
  RootComponent extends React.ElementType,
> = ExtendButtonBaseTypeMap<{
  props: AdditionalProps & CardActionAreaOwnProps;
  defaultComponent: RootComponent;
}>;

export type CardActionAreaProps<
  RootComponent extends
    React.ElementType = ButtonBaseTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  CardActionAreaTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

const useAreaUtilityClasses = (ownerState: any) => {
  const { classes } = ownerState;

  const slots = {
    root: ["root"],
    focusHighlight: ["focusHighlight"],
  };

  return composeClasses(slots, getUtilityClass, classes);
};

const CardActionAreaRoot = styled(ButtonBase, {
  name: "MuxCardActionArea",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root,
})(
  memoTheme(({ theme }) => ({
    display: "block",
    textAlign: "inherit",
    borderRadius: "inherit", // for Safari to work https://github.com/mui/material-ui/issues/36285.
    width: "100%",
    [`&:hover .${cardActionAreaClasses.focusHighlight}`]: {
      opacity: (theme.vars || theme).palette.action.hoverOpacity/2,
      "@media (hover: none)": {
        opacity: 0,
      },
    },
    [`&.${cardActionAreaClasses.focusVisible} .${cardActionAreaClasses.focusHighlight}`]:
      {
        opacity: (theme.vars || theme).palette.action.focusOpacity,
      },
  })),
);

const CardActionAreaFocusHighlight = styled("span", {
  name: "MuxCardActionArea",
  slot: "FocusHighlight",
  overridesResolver: (props, styles) => styles.focusHighlight,
})(
  memoTheme(({ theme }) => ({
    overflow: "hidden",
    pointerEvents: "none",
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: "inherit",
    opacity: 0,
    backgroundColor: "currentcolor",
    transition: theme.transitions.create("opacity", {
      duration: theme.transitions.duration.short,
    }),
  })),
);

export const CardActionArea = React.forwardRef<
  HTMLButtonElement,
  CardActionAreaProps
>(function CardActionArea(inProps, ref) {
  const props = useMuxDefaultProps({
    props: inProps,
    name: "MuxCardActionArea",
  });
  const { children, className, focusVisibleClassName, ...other } = props;

  const ownerState = props;
  const classes = useAreaUtilityClasses(ownerState);

  return (
    <CardActionAreaRoot
      className={clsx(classes.root, className)}
      focusVisibleClassName={clsx(
        focusVisibleClassName,
        (classes as any).focusVisible,
      )}
      ref={ref}
      ownerState={ownerState}
      {...other}
    >
      {children}
      <CardActionAreaFocusHighlight
        className={classes.focusHighlight}
        ownerState={ownerState}
      />
    </CardActionAreaRoot>
  );
});
