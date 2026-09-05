import iconNames from "bootstrap-icons/font/bootstrap-icons.json";
import { forwardRef } from "react";

import { TForeground } from "../../core";
import { clsx, Box, getThemeColorClass } from "../../mui";

import styles from "./bootstrap-icon.module.scss";

export type BootstrapIconName = keyof typeof iconNames;

export interface BootstrapIconProps {
  icon: BootstrapIconName;
  fill?: boolean;
  fontSize?: number | string;
  color?: TForeground;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export const BootstrapIcon = forwardRef<HTMLElement, BootstrapIconProps>(
  (props, ref) => {
    const { className, onClick, icon, fill, color, fontSize } = props;
    const name = fill && !icon?.endsWith("-fill") ? `${icon!}-fill` : icon;
    const cls = `bi-${name}`;
    
    let clsName = clsx(className, styles.icon, styles.bi, styles[cls], 'bs-icon');
    if(color){
      const {className} = getThemeColorClass(color, clsName, color, 'text');
      clsName = className!;
    }

    return (
      <span
        className={clsName}
        style={{ fontSize }}
        onClick={onClick}
        ref={ref}
      />
    );
  },
);
