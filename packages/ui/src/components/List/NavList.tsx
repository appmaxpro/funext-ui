import React from "react";

// context
import { useTailwindTheme } from "../../theme";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

import { SxComponentProps, styled } from "../../styles";

const ListItemPrefixRoot = styled('div', {
  name: 'istItemPrefix',
  slot: 'Root',
})('');

export interface ListItemPrefixProps extends SxComponentProps<"div"> {
  className?: string;
}

export const ListItemPrefix = React.forwardRef<HTMLDivElement, ListItemPrefixProps>(
  ({ className, children, ...rest }, ref) => {
    // 1. init
    const { list } = useTailwindTheme();
    const {
      styles: { base },
    } = list;

    // 3. set styles
    const listItemPrefixClasses = twMerge(
      classnames(objectsToString(base.itemPrefix)),
      className,
    );

    return (
      <div {...rest} ref={ref} className={listItemPrefixClasses}>
        {children}
      </div>
    );
  },
);

ListItemPrefix.displayName = "Mux.ListItemPrefix";

export default ListItemPrefix;
