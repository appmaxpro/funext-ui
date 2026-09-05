import React, { memo } from "react";
import { useClassNames } from "../core";
import * as TYPES from "./types";
import styles from "./grid.module.scss";
import { styled } from "..";

const defaultColClasses = {
  classes: {
    root: "MuxGridColumn",
  },
};
export const GridColumn = memo(function GridColumn(
  props: TYPES.GridColumnProps & {
    renderChildren?: (
      column: TYPES.GridColumn,
      value: TYPES.GridColumnProps["value"],
    ) => React.ReactNode;
  },
) {
  const {
    children: _children,
    className,
    data,
    value,
    index,
    selected,
    renderer,
    renderChildren,
    onClick,
    type,
  } = props;

  const children = renderChildren ? renderChildren(data, value) : _children;

  const { width, minWidth, padding } = data;
  const ColumnComponent = renderer || MuxGridColumn;
  const rendererProps = renderer ? props : defaultColClasses;
  const columnRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (selected && columnRef.current) {
      const focusable = columnRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable) {
        const timer = setTimeout(() => {
          (focusable as HTMLElement).focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [selected]);

  const classNames = useClassNames();
  const $width = Math.max(width || 0, minWidth || 0);
  const header = type === "header";

  return (
    <ColumnComponent
      {...(renderer ? {} : { ref: columnRef })}
      {...rendererProps}
      onClick={(e) => onClick && onClick(e, data, index)}
      className={classNames(
        styles.column,
        data.type === "row-checked"
          ? styles.center
          : data.action && !header && styles.action,
        selected && styles.selected,
        !padding && !header && styles.padding,
        className,
        !header && data.$css,
      )}
      style={
        $width > 0
          ? {
              width: $width,
              maxWidth: $width,
              ...(padding && { padding: padding }),
            }
          : { flex: 1 }
      }
    >
      {children}
    </ColumnComponent>
  );
});

const MuxGridColumn = styled("div", {
  //name: 'MuxGridColumn',
  //slot: '',
})({
  display: "flex",
  alignItems: "center",
});
