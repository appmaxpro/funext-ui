import React from "react";

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
  variant,
  color,
  icon,
  open,
  onClose,
  action,
  animate,
  className,
  value,
  size,
} from "../../types/components/chip";

import IconButton from "../IconButton";
import { useThemeColor } from "../../hooks";
import { MaterialIcon } from "../../../icons/material-icon";

import { styled } from "../../styles";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import Button, {ButtonProps} from "../Button";


export interface ChipOwnProps extends Omit<ButtonProps, 'color'> {
  size?: size;
  color?: color;
  open?: open;
  onClose?: (event: React.MouseEvent<HTMLButtonElement> | undefined) => void;
  animate?: animate;
  label?: value;
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
};

const ChipRoot = styled(Button, {
  name: "MuxChip",
  slot: "Root",
  shouldForwardProp: (prop) => rootShouldForwardProp(prop) || prop === 'classes',
  overridesResolver: (props, styles) => styles.root,
})({
  minWidth: 'unset'
});

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      variant,
      size,
      color,
      open,
      onClose,
      action,
      animate,
      className,
      label,
      children,
      motionProps,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { chip } = useTailwindTheme();
    const { defaultProps, valid, styles } = chip;
    const { base, variants, sizes } = styles;

    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = useThemeColor(color, defaultProps.color);
    animate = animate ?? defaultProps.animate;
    open = open ?? defaultProps.open;
    action = action ?? defaultProps.action;
    onClose = onClose ?? defaultProps.onClose;
    className = twMerge(defaultProps.className || "", className);

    // 3. set styles
    const chipBase = objectsToString(base.chip);
    const chipAction = objectsToString(base.action);
    const chipVariant = objectsToString(
      variants[findMatch(valid.variants, variant, "filled")][
        findMatch(valid.colors, color, "")
      ],
    );

    const sizeVariant = findMatch(valid.sizes, size, "md");

    const chipSize = objectsToString(
      sizes[sizeVariant]["chip"],
    );
    const actionSize = objectsToString(
      sizes[sizeVariant]["action"],
    );

    const classes = twMerge(
      classnames(chipBase, chipVariant, chipSize),
      className,
    );

    const actionClasses = twMerge(classnames(chipAction, actionSize));
    
    const ownerState = {
      size: '',
      color: '',
      variant,
      classes:{
        startIcon: 'shrink p-0 m-0 mx-3',
        endIcon: 'shrink p-0 m-0 ms-3'
      } 
    }
    // 5. icon template

    const child = <ChipRoot
        {...rest}
        ref={ref}
        className={classes}
        ownerState={ownerState}
        component='span'
        endIcon={ onClose 
           ? <IconButton
           onClick={onClose}
           size={size}
           variant="text"
           color={
             variant === "outlined" || variant === "ghost"
               ? color
               : "inherit"
           }
           className={actionClasses}
           disabled={rest.disabled}
         >
           <MaterialIcon icon="close"/>
         </IconButton>
         : rest.endIcon 
        }
    >
      <span className="grow">{label ? label : (children as any)}</span>
    </ChipRoot>

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
