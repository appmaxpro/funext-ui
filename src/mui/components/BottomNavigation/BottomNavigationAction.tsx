import React from "react";
import { OverrideProps } from "../../props";
import {
  clsx,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxThemeProps,
  useMuiDefaultProps,
} from "../../styles";
import ButtonBase, {
  ButtonBaseTypeMap,
  ExtendButtonBaseTypeMap,
} from "../Button/ButtonBase";

export interface BottomNavigationActionClasses {
  /** Styles applied to the root element. */
  root: string;
  /** State class applied to the root element if selected. */
  selected: string;
  /** State class applied to the root element if `showLabel={false}` and not selected. */
  iconOnly: string;
  /** Styles applied to the label's span element. */
  label: string;
}

export type BottomNavigationActionClassKey =
  keyof BottomNavigationActionClasses;

export function getBottomNavigationActionUtilityClass(slot: string): string {
  return generateUtilityClass("MuxBottomNavigationAction", slot);
}

export const bottomNavigationActionClasses: BottomNavigationActionClasses =
  generateUtilityClasses("MuxBottomNavigationAction", [
    "root",
    "iconOnly",
    "selected",
    "label",
  ]);

export interface BottomNavigationActionOwnProps {
  /**
   * This prop isn't supported.
   * Use the `component` prop if you need to change the children structure.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<BottomNavigationActionClasses>;
  /**
   * The icon to display.
   */
  icon?: React.ReactNode;
  /**
   * The label element.
   */
  label?: React.ReactNode;
  /**
   * If `true`, the `BottomNavigationAction` will show its label.
   * By default, only the selected `BottomNavigationAction`
   * inside `BottomNavigation` will show its label.
   *
   * The prop defaults to the value (`false`) inherited from the parent BottomNavigation component.
   */
  showLabel?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * You can provide your own value. Otherwise, we fallback to the child position index.
   */
  value?: any;
}

export type BottomNavigationActionTypeMap<
  AdditionalProps,
  RootComponent extends React.ElementType,
> = ExtendButtonBaseTypeMap<{
  props: AdditionalProps & BottomNavigationActionOwnProps;
  defaultComponent: RootComponent;
}>;

export type BottomNavigationActionProps<
  RootComponent extends
    React.ElementType = ButtonBaseTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  BottomNavigationActionTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

const useUtilityClasses = (ownerState) => {
  const { classes, showLabel, selected } = ownerState;

  const slots = {
    root: [
      "root",
      !showLabel && !selected && "iconOnly",
      selected && "selected",
    ],
    label: [
      "label",
      !showLabel && !selected && "iconOnly",
      selected && "selected",
    ],
  };

  return composeClasses(slots, getBottomNavigationActionUtilityClass, classes);
};

const BottomNavigationActionRoot = styled(ButtonBase, {
  name: "MuxBottomNavigationAction",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      !ownerState.showLabel && !ownerState.selected && styles.iconOnly,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    transition: theme.transitions.create(["color", "padding-top"], {
      duration: theme.transitions.duration.short,
    }),
    padding: "0px 12px",
    minWidth: 80,
    maxWidth: 168,
    //color: (theme.vars || theme).palette.text.secondary,
    flexDirection: "column",
    flex: "1",
    [`&.${bottomNavigationActionClasses.selected}`]: {
      color: (theme.vars || theme).palette.primary.main,
    },
    variants: [
      {
        props: ({ showLabel, selected }) => !showLabel && !selected,
        style: {
          paddingTop: 14,
        },
      },
      {
        props: ({ showLabel, selected, label }) =>
          !showLabel && !selected && !label,
        style: {
          paddingTop: 0,
        },
      },
    ],
  })),
);

const BottomNavigationActionLabel = styled("span", {
  name: "MuxBottomNavigationAction",
  slot: "Label",
  overridesResolver: (props, styles) => styles.label,
})(
  memoTheme(({ theme }) => ({
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(12),
    opacity: 1,
    transition: "font-size 0.2s, opacity 0.2s",
    transitionDelay: "0.1s",
    [`&.${bottomNavigationActionClasses.selected}`]: {
      fontSize: theme.typography.pxToRem(14),
    },
    variants: [
      {
        props: ({ showLabel, selected }) => !showLabel && !selected,
        style: {
          opacity: 0,
          transitionDelay: "0s",
        },
      },
    ],
  })),
);

export const BottomNavigationAction = React.forwardRef<HTMLElement,BottomNavigationActionProps> (
  function BottomNavigationAction(inProps, ref) {
    const props = useMuiDefaultProps({
      props: inProps,
      name: "MuxBottomNavigationAction",
    });
    const {
      className,
      icon,
      label,
      onChange,
      onClick,
      // eslint-disable-next-line react/prop-types -- private, always overridden by BottomNavigation
      selected,
      showLabel,
      value,
      ...other
    } = props;

    const ownerState = props;
    const classes = useUtilityClasses(ownerState);

    const handleChange = (event) => {
      if (onChange) {
        onChange(event, value);
      }

      if (onClick) {
        onClick(event);
      }
    };

    return (
      <BottomNavigationActionRoot
        ref={ref}
        className={clsx(classes.root, className)}
        focusRipple
        onClick={handleChange}
        ownerState={ownerState}
        {...other}
      >
        {icon}
        <BottomNavigationActionLabel
          className={classes.label}
          ownerState={ownerState}
        >
          {label}
        </BottomNavigationActionLabel>
      </BottomNavigationActionRoot>
    );
  },
);
