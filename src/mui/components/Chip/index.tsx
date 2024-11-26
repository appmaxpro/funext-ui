import React, { useMemo } from "react";

// framer-motion
import {
  AnimatePresence,
  m,
  MotionProps,
  LazyMotion,
  domAnimation,
} from "framer-motion";

// utils
import classnames from "classnames";
import merge from "deepmerge";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import { OverrideProps } from "../../props";

// types
import type { NewAnimatePresenceProps } from "../../types/generic";
import type {
  animate,
} from "../../types/components/chip";

import IconButton from "../IconButton";
import { useThemeColor } from "../../hooks";
import { MaterialIcon } from "../../../icons/material-icon";

import { clsx, composeClasses, generateUtilityClass, memoTheme, styled, Theme, useMuiDefaultProps } from "../../styles";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import Button, {
  ButtonEndIcon,
  ButtonProps,
  ButtonRoot,
  ButtonStartIcon,
} from "../Button";

import { buttonClasses } from "../Button/ButtonType";
import { capitalize } from "../../utils";
import { lineHeight } from "@mui/system";


export function getChipUtilityClass(slot: string): string {
  return generateUtilityClass('MuxChip', slot);
}

const useUtilityClasses = (ownerState: any) => {
  const { color, disableElevation, fullWidth, size, variant, classes, xsm } =
    ownerState;

  const slots = {
    root: [
      "root",
      variant,
      `size${capitalize(size)}`,
      `color${capitalize(color)}`,
      disableElevation && "disableElevation",
      fullWidth && "fullWidth",
      xsm && "xsm",
    ],
    label: ["label"],
    startIcon: ["icon", "startIcon", `iconSize${capitalize(size)}`],
    endIcon: ["icon", "endIcon", `iconSize${capitalize(size)}`],
  };

  const composedClasses = composeClasses(slots, getChipUtilityClass, classes);

  return {
    ...classes, // forward the focused, disabled, etc. classes to the ButtonBase
    ...composedClasses,
  };
};
export interface ChipOwnProps extends ButtonProps {
  open?: boolean;
  onClose?: (event: React.MouseEvent<HTMLButtonElement> | undefined) => void;
  animate?: animate;
  label?: React.ReactNode;
  motionProps?: MotionProps;
}

export interface ChipTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = "div",
> {
  props: AdditionalProps & ChipOwnProps;
  defaultComponent: RootComponent;
}

export type ChipProps<
  RootComponent extends React.ElementType = ChipTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  ChipTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
  rounded?: boolean;
  xsm?: boolean;
};

const ChipRoot = styled(ButtonRoot, {
  name: "MuxChip",
  slot: "Root",
  shouldForwardProp: (prop) =>
    rootShouldForwardProp(prop) || prop === "classes",
  overridesResolver: (props, styles) => styles.root,
})(
  memoTheme(({ theme }:{theme:Theme}) => ({
  minWidth: "unset",
  variants: [
    {
      props: {
        isButton: false,
      },
      style: {
        boxShadow: "none",
      },
    },
    {
      props: {
        size: 'sm',
      },
      style: {
        padding: '2px 5px',
        fontSize: theme.typography.pxToRem(12),
        fontWeight: "normal",
        lineHeight: 1.3
      },
    },
    {
      props: {
        size: 'md',
      },
      style: {
        padding: '4px 8px',
        fontSize: theme.typography.pxToRem(14),
        lineHeight: 1.3
      },
    },
    {
      props: {
        size: 'lg',
      },
      style: {
        padding: '6px 10px',
        fontSize: theme.typography.pxToRem(15),
      },
    },
    {
      props: {
        size: "md",
        xsm: true,
      },
      style: {
        padding: '2px 6px',
        fontSize: theme.typography.pxToRem(12),
      },
    },
    {
      props: {
        size: "sm",
        xsm: true,
      },
      style: {
        padding: '0 4px',
        fontSize: theme.typography.pxToRem(11),
      },
    },
  ],
})));

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (props, ref) => {
    // 1. init

    const { chip } = useTailwindTheme();
    const { defaultProps, valid, styles } = chip;
    const { base, variants, sizes } = styles;

    props = useMuiDefaultProps({ props, name: "MuxChip" });

    let {
      variant,
      size,
      color,
      open,
      onClose,
      animate,
      className,
      label,
      children,
      motionProps,
      rounded,
      xsm,
      startIcon: startIconProp,
      endIcon: endIconProp,
      ...rest
    } = props;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = useThemeColor(color, defaultProps.color) as ChipOwnProps["color"];
    animate = animate ?? defaultProps.animate;
    open = open ?? defaultProps.open;
    onClose = onClose ?? defaultProps.onClose;

    const {
      component = "span",
      disabled = false,
      disableElevation = !rest.onClick,
      disableFocusRipple = false,
      focusVisibleClassName,
      fullWidth = false,
    } = props;

    const ownerState = {
      ...rest,
      color,
      component,
      disabled,
      disableElevation,
      disableFocusRipple,
      focusVisibleClassName,
      fullWidth,
      size,
      variant,
      isButton: !!rest.onClick,
      xsm
    };

    const classes = useUtilityClasses(ownerState);

    const { finalClassName, actionClasses, focusVisible } = useMemo(() => {
      // 3. set styles
      const chipBase = objectsToString(base.chip);
      const chipAction = objectsToString(base.action);

      const sizeVariant = findMatch(valid.sizes, size, "md");

      //const chipSize = objectsToString(sizes[sizeVariant]["chip"]);
      const actionSize = objectsToString(sizes[sizeVariant]["action"]);

      const finalClassName = twMerge(
        defaultProps.className,
        chipBase,
        rounded && "rounded-full",
        className,
      );

      const actionClasses = twMerge(classnames(chipAction, actionSize));

      return {
        finalClassName,
        actionClasses,
        focusVisible: clsx(classes.focusVisible, focusVisibleClassName),
      };
    }, [size, color, color, rounded, xsm, classes]);

    const startIcon = startIconProp && (
      <ButtonStartIcon className="shrink p-0 m-0 mx-1" ownerState={ownerState}>
        {startIconProp}
      </ButtonStartIcon>
    );

    const endIcon = (endIconProp || onClose) && (
      <ButtonEndIcon className="shrink p-0 m-0 ms-1" ownerState={ownerState}>
        {onClose ? (
          <IconButton
            onClick={onClose}
            size={size}
            variant="text"
            dense
            //@ts-ignore
            color={
              variant === "outlined" || variant === "ghost" ? color : "inherit"
            }
            className={actionClasses}
            disabled={rest.disabled}
          >
            <MaterialIcon icon="close" />
          </IconButton>
        ) : (
          endIconProp
        )}
      </ButtonEndIcon>
    );

    

    // 5. icon template

    const child = (
      <ChipRoot
        {...rest}
        ownerState={ownerState}
        className={finalClassName}
        component={component}
        disabled={disabled}
        focusRipple={!disableFocusRipple}
        focusVisibleClassName={focusVisible}
        ref={ref}
        classes={classes}
      >
        {startIcon}
        {label || children}
        {endIcon}
      </ChipRoot>
    );

    if (!motionProps) {
      return child;
    }

    // 4. set animation
    const mainAnimation = {
      unmount: {
        opacity: 0,
      },
      mount: {
        opacity: 1,
      },
    };

    const appliedAnimation = merge(mainAnimation, animate as any);

    // 6. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> =
      AnimatePresence;

    // 7. return
    return (
      <LazyMotion features={domAnimation}>
        <NewAnimatePresence>
          {open && (
            <m.div
              initial="unmount"
              exit="unmount"
              animate={open ? "mount" : "unmount"}
              variants={appliedAnimation}
              {...motionProps}
            >
              {child}
            </m.div>
          )}
        </NewAnimatePresence>
      </LazyMotion>
    );
  },
);

Chip.displayName = "Mux.Chip";

export default Chip;
