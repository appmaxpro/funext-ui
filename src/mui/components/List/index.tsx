import React, { useContext } from "react";

// types
import type { ListContextValues } from "../../types/components/list";

// list components
import { ListItem, type ListItemProps } from "./ListItem";
import { ListItemButton, type ListItemButtonProps } from "./ListItemButton";
import { ListItemAvatar, type ListItemAvatarProps } from "./ListItemAvatar";
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";
import {ItemDivider, type ItemDividerProps} from "./ItemDivider";

import {
  ListContextProvider,
  ListContextConsumer,
  useListContext,
} from "./ListContext";

import { SxComponentProps, styled, clsx } from "../../styles";
import { twMerge } from "tailwind-merge";
import ListSubheader from "./ListSubheader";
export * from "./ListSubheader";
export * from "./ListSubheader";
export * from "./ListContext";

const ListRoot = styled("ul", {
  name: "MuxList",
  slot: "Root",
})("");

export interface ListProps extends SxComponentProps<"ul"> {
  listStyle?: ListContextValues["list"] & { className?: string };
  itemStyle?: ListContextValues["item"];
  hover?: boolean;
  select?: boolean;
  active?: boolean;
  focus?: boolean;
  ripple?: boolean;
  isolate?: boolean;
  divider?: boolean;
  gutters?: boolean;
  dense?: boolean;
  prefix?: string;
  suffix?: string;
  component?: React.ComponentType | string;
}

const List = React.forwardRef<HTMLElement, ListProps>((props, ref) => {
  const {
    className,
    children,
    listStyle,
    itemStyle,
    hover,
    select,
    active,
    focus,
    ripple,
    divider,
    gutters,
    dense,
    as,
    component = as,
    isolate = false,
    prefix,
    suffix,
    ...rest
  } = props;

  const ul = component === "ul";
  try {
    const context = useListContext(false);
    //console.log("List ListContext:", context);
    if (!isolate && context && !context.global && context.ul == ul) {
      return (
        <ListRoot
          {...(rest as any)}
          ref={ref as any}
          className={twMerge(context.list, className)}
        >
          {children}
        </ListRoot>
      );
    }
  } catch (e) {
    console.error(e);
  }

  return (
    <ListContextProvider
      value={{
        list: listStyle,
        item: itemStyle ?? {},
        className: className,
        hover,
        active,
        select,
        focus,
        ripple,
        divider,
        gutters,
        dense,
        ul,
        prefix,
        suffix
      }}
    >
      <ListContextConsumer>
        {({ list }: any) => (
          <ListRoot
            {...(rest as any)}
            ref={ref as any}
            className={list}
            as={component}
          >
            {children}
          </ListRoot>
        )}
      </ListContextConsumer>
    </ListContextProvider>
  );
});

List.displayName = "Mux.List";

export type {
  ListItemProps,
  ListItemPrefixProps,
  ListItemSuffixProps,
  ListItemButtonProps,
  ListItemAvatarProps,
  ItemDividerProps
};

export {
  ListItem,
  ListItemButton,
  ListItemPrefix,
  ListItemSuffix,
  ListItemAvatar,
  ItemDivider,
};

const MList = Object.assign(List, {
  Item: ListItem,
  ItemButton: ListItemButton,
  ItemPrefix: ListItemPrefix,
  ItemSuffix: ListItemSuffix,
  Avatar: ListItemAvatar,
  Icon: ListItemAvatar,
  Divider: ItemDivider,
  Subheader: ListSubheader,
  ContextProvider: ListContextProvider
});

export default MList;

export { MList as List };
