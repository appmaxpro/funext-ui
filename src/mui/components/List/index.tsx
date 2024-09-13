import React, { useContext } from "react";

// types
import type { ListContextValues } from "../../types/components/list";

// list components
import { ListItem, type ListItemProps } from "./ListItem";
import { ListItemButton, type ListItemButtonProps } from "./ListItemButton";
import { ListItemAvatar, type ListItemAvatarProps } from "./ListItemAvatar";
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";

import { ListContextProvider, ListContext } from "./ListContext";
import ItemDivider from "./ItemDivider";

import { SxComponentProps, styled, clsx } from "../../styles";
export * from "./ListSubheader";

const ListRoot = styled('ul', {
  name: 'MuxList',
  slot: 'Root',
})('');

export interface ListProps extends SxComponentProps<"ul"> {
  listStyle?: ListContextValues['list'],
  itemStyle?: ListContextValues['item'],
  hover?:boolean;
  select?:boolean;
  active?:boolean;
  focus?:boolean;
  ripple?: boolean;
  isolate?:boolean;
  component?: React.ComponentType | string;
}

export const List = React.forwardRef<HTMLElement, ListProps>(
  ({ 
    className, 
    children, 
    listStyle, 
    itemStyle, 
    hover,
    select,
    active,
    focus,
    ripple,
    as,
    component=as,
    isolate = false,
    ...rest 
  }, ref) => {

    const context = useContext(ListContext);

    if (context && !isolate ){
      return (<ListRoot 
        {...(rest as any)} 
        ref={ref as any} 
        className={clsx(className, context.list)}>
        {children}
      </ListRoot>);
    }

    return (
      <ListContextProvider 
          value={{
            list: listStyle, 
            item: itemStyle,
            className: className,
            hover,
            active,
            select,
            focus,
            ripple
          }}>
          <ListContext.Consumer>
              {({list}:any) => (
                  <ListRoot {...(rest as any)} ref={ref as any} className={list} as={component}>
                    {children}
                  </ListRoot>)
              }
          </ListContext.Consumer>  
           
      </ListContextProvider>
      
    );

  },
);

List.displayName = "Mux.List";

export type { 
  ListItemProps, 
  ListItemPrefixProps, 
  ListItemSuffixProps,
  ListItemButtonProps,
  ListItemAvatarProps
};

export { ListItem, ListItemButton, ListItemPrefix, ListItemSuffix, ListItemAvatar, ItemDivider };
export default Object.assign(List, {
  Item: ListItem,
  ItemButton: ListItemButton,
  ItemPrefix: ListItemPrefix,
  ItemSuffix: ListItemSuffix,
  Avatar: ListItemAvatar,
  Divider: ItemDivider
});
