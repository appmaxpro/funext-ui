import React from "react";

// context
import { useTailwindTheme } from "../../theme";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

import { SxComponentProps, styled } from "../../styles";

const ListItemSuffixRoot = styled('div', {
  name: 'MuxListItemSuffix',
  slot: 'Root',
})('');

export interface ListItemSuffixProps extends SxComponentProps<"div">{};


export const ListItemSuffix = React.forwardRef<HTMLDivElement, ListItemSuffixProps>(({className, children, ...rest}, ref) => {
  // 1. init
  const { list } = useTailwindTheme();
  const {
    styles: { base },
  } = list;

  // 3. set styles
  const listItemSuffixClasses = twMerge(classnames(objectsToString(base.itemSuffix)), className);

  return (
    <ListItemSuffixRoot {...rest} ref={ref} className={listItemSuffixClasses}>
      {children}
    </ListItemSuffixRoot>
  );
});

ListItemSuffix.displayName = "Mux.ListItemSuffix";


export default ListItemSuffix;