import { forwardRef } from "react";
import { clsx } from "../clsx";

import styles from "./scrollable.module.scss";

export type ScrollableProps = {
  overflowX?: boolean;
  overflowY?: boolean;
  withPadding?: boolean;
} & React.HTMLProps<HTMLDivElement>;

export const Scrollable = forwardRef<HTMLDivElement, ScrollableProps>(
  (props, ref) => {
    const {
      overflowX = false,
      overflowY = true,
      withPadding = true,
      ...restProps
    } = props;
    const className = getScrollClasses({ overflowX, overflowY, withPadding });
    return <div {...restProps} className={className} ref={ref} />;
  },
);

export function getScrollClasses({
  overflowX = false,
  overflowY = true,
  withPadding = false,
}: {
  overflowX?: boolean;
  overflowY?: boolean;
  withPadding?: boolean;
} = {}) {
  const className = clsx(styles.scrollable, {
    [styles.overflowX]: overflowX && !overflowY,
    [styles.overflowY]: overflowY && !overflowX,
    [styles.overflow]: overflowY && overflowX,
    [styles.withPadding]: withPadding,
  });

  return className;
}

Scrollable.displayName = "Scrollable";
