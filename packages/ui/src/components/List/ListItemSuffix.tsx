import React, { useMemo } from "react";

// utils
import { twMerge } from "tailwind-merge";
import { SxComponentProps, styled } from "../../styles";
import { useListContext } from "./ListContext";
import { iconStyle } from "./styles";

const ListItemSuffixRoot = styled('div', {
  name: 'MuxListItemSuffix',
})({
  marginLeft: 'auto'
},iconStyle);

export interface ListItemSuffixProps extends SxComponentProps<"div">{};

export const ListItemSuffix = React.forwardRef<HTMLDivElement, ListItemSuffixProps>(({className, children, ...rest}, ref) => {
  
  const { base } = useListContext()!;
  
    // 3. set styles
  const listItemSuffixClasses = useMemo(
    () => base?.suffix ? twMerge(className, base?.suffix) : className,
    [className, base?.suffix ],
  );

  return (
    <ListItemSuffixRoot {...rest} ref={ref} className={listItemSuffixClasses}>
      {children}
    </ListItemSuffixRoot>
  );
});

ListItemSuffix.displayName = "Mux.ListItemSuffix";


export default ListItemSuffix;