import React, { useMemo } from "react";

import { twMerge } from "tailwind-merge";

import { SxComponentProps, styled } from "../../styles";
import { useListContext } from "./ListContext";
import { iconStyle } from "./styles";

const ListItemPrefixRoot = styled("div", {
  name: "MuxListItemPrefix",
})<SxComponentProps<"div">>({
  marginRight: 4
}, iconStyle);

export interface ListItemPrefixProps extends SxComponentProps<"div"> {}

export const ListItemPrefix = React.forwardRef<
  HTMLDivElement,
  ListItemPrefixProps
>(({ className, children, ...rest }, ref) => {
  // 1. init
  
  const { prefix } = useListContext()!;

  // 3. set styles
  const listItemPrefixClasses = useMemo(
    () => twMerge(className, prefix),
    [className, prefix],
  );

  return (
    <ListItemPrefixRoot {...rest} ref={ref} className={listItemPrefixClasses}>
      {children}
    </ListItemPrefixRoot>
  );
});

ListItemPrefix.displayName = "Mux.ListItemPrefix";

export default ListItemPrefix;
