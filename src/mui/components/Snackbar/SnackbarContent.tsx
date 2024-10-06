import * as React from "react";

import {
  clsx,
  composeClasses,
  emphasize,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxThemeProps,
  useMuiDefaultProps,
} from "../../styles";
import Panel, { PanelProps } from "../Panel";
import { StandardProps } from "../../props";

export interface SnackbarContentClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the message wrapper element. */
  message: string;
  /** Styles applied to the action wrapper element if `action` is provided. */
  action: string;
}

export type SnackbarContentClassKey = keyof SnackbarContentClasses;

export function getSnackbarContentUtilityClass(slot: string): string {
  return generateUtilityClass("MuxSnackbarContent", slot);
}

export const snackbarContentClasses: SnackbarContentClasses =
  generateUtilityClasses("MuxSnackbarContent", ["root", "message", "action"]);

export interface SnackbarContentProps
  extends StandardProps<PanelProps, SnackbarContentClassKey, "children"> {
  /**
   * The action to display. It renders after the message, at the end of the snackbar.
   */
  action?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<SnackbarContentClasses>;
  /**
   * The message to display.
   */
  message?: React.ReactNode;
  /**
   * The ARIA role attribute of the element.
   * @default 'alert'
   */
  role?: PanelProps["role"];
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

const useUtilityClasses = (ownerState:any) => {
  const { classes } = ownerState;

  const slots = {
    root: ["root"],
    action: ["action"],
    message: ["message"],
  };

  return composeClasses(slots, getSnackbarContentUtilityClass, classes);
};

const SnackbarContentRoot = styled(Panel, {
  name: "MuiSnackbarContent",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root,
})(
  memoTheme(({ theme }) => {
    const emphasis = theme.palette.mode === "light" ? 0.8 : 0.98;
    const backgroundColor = emphasize(
      theme.palette.background.default,
      emphasis,
    );

    return {
      ...theme.typography.body2,
      color: theme.vars
        ? theme.vars.palette.SnackbarContent.color
        : theme.palette.getContrastText(backgroundColor),
      backgroundColor: theme.vars
        ? theme.vars.palette.SnackbarContent.bg
        : backgroundColor,
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      padding: "6px 16px",
      borderRadius: (theme.vars || theme).shape.borderRadius,
      flexGrow: 1,
      [theme.breakpoints.up("sm")]: {
        flexGrow: "initial",
        minWidth: 288,
      },
    };
  }),
);

const SnackbarContentMessage = styled("div", {
  name: "MuiSnackbarContent",
  slot: "Message",
  overridesResolver: (props, styles) => styles.message,
})({
  padding: "8px 0",
});

const SnackbarContentAction = styled("div", {
  name: "MuiSnackbarContent",
  slot: "Action",
  overridesResolver: (props, styles) => styles.action,
})({
  display: "flex",
  alignItems: "center",
  marginLeft: "auto",
  paddingLeft: 16,
  marginRight: -8,
});

export const SnackbarContent = React.forwardRef<
  HTMLElement,
  SnackbarContentProps
>(function SnackbarContent(inProps, ref) {
  const props = useMuiDefaultProps({
    props: inProps,
    name: "MuiSnackbarContent",
  });
  const { action, className, message, role = "alert", ...other } = props;
  const ownerState = props;
  const classes = useUtilityClasses(ownerState);

  return (
    <SnackbarContentRoot
      role={role}
      square
      elevation={6}
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={ref}
      {...other}
    >
      <SnackbarContentMessage
        className={classes.message}
        ownerState={ownerState}
      >
        {message}
      </SnackbarContentMessage>
      {action ? (
        <SnackbarContentAction
          className={classes.action}
          ownerState={ownerState}
        >
          {action}
        </SnackbarContentAction>
      ) : null}
    </SnackbarContentRoot>
  );
});

export default SnackbarContent;
