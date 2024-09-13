import React from "react";

// framer-motion
import { AnimatePresence, m, MotionProps, LazyMotion, domAnimation } from "framer-motion";

// utils
import classnames from "classnames";
import merge from "deepmerge";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";
import {OverrideProps} from "../../props";

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

export interface ChipOwnProps extends Omit<MotionProps, "animate"> {
  variant?: variant;
  size?: size;
  color?: color;
  icon?: icon;
  open?: open;
  onClose?: (event: React.MouseEvent<HTMLButtonElement> | undefined) => void;
  action?: action;
  animate?: animate;
  className?: className;
  label?: value;
}

export interface ChipTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps & ChipOwnProps;
  defaultComponent: RootComponent;
}

export type ChipProps<
  RootComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<ChipTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    { variant, size, color, icon, open, onClose, action, animate, className, label, children, ...rest },
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
    const chipIcon = objectsToString(base.icon);
    const chipVariant = objectsToString(
      variants[findMatch(valid.variants, variant, "filled")][
        findMatch(valid.colors, color, "gray")
      ],
    );
    const chipSize = objectsToString(sizes[findMatch(valid.sizes, size, "md")]["chip"]);
    const actionSize = objectsToString(sizes[findMatch(valid.sizes, size, "md")]["action"]);
    const iconSize = objectsToString(sizes[findMatch(valid.sizes, size, "md")]["icon"]);
    const classes = twMerge(classnames(chipBase, chipVariant, chipSize), className);
    const actionClasses = classnames(chipAction, actionSize, 'ms-3');
    const iconClasses = classnames(chipIcon, iconSize, 'me-3');
    const contentClasses = classnames("grow");

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

    // 5. icon template
    const iconTemplate = <div className={iconClasses}>{icon}</div>;

    // 6. Create an instance of AnimatePresence because of the types issue with the children
    const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

    // 7. return
    return (
      <LazyMotion features={domAnimation}>
        <NewAnimatePresence>
          {open && (
            <m.div
              {...rest}
              ref={ref}
              className={classes}
              initial="unmount"
              exit="unmount"
              animate={open ? "mount" : "unmount"}
              variants={appliedAnimation}
            >
              {icon && iconTemplate}
              <span className={contentClasses}>
                {(label ? label : (children as any))}
              </span>
              {onClose && !action && (
                <IconButton
                  onClick={onClose}
                  size={size}
                  variant="text"
                  color={(variant === "outlined" || variant === "ghost") ? color : "inherit"}
                  className={actionClasses}
                >
                  <MaterialIcon icon="close"/>
                </IconButton>
              )}
              {action || null}
            </m.div>
          )}
        </NewAnimatePresence>
      </LazyMotion>
    );
  },
);

Chip.displayName = "Mux.Chip";

export default Chip;
