import React, { useMemo } from "react";

// context
import { useTailwindTheme } from "../../theme";

// utils
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import objectsToString from "../../utils/objectsToString";

import { SxComponentProps, styled } from "../../styles";
import { useListContext } from "./ListContext";

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

  const { suffix } = useListContext()!;

  // 3. set styles
  const listItemSuffixClasses = useMemo(
    () => twMerge(classnames(objectsToString(base.itemPrefix)), className, suffix),
    [className, suffix],
  );

  return (
    <ListItemSuffixRoot {...rest} ref={ref} className={listItemSuffixClasses}>
      {children}
    </ListItemSuffixRoot>
  );
});

ListItemSuffix.displayName = "Mux.ListItemSuffix";


export default ListItemSuffix;