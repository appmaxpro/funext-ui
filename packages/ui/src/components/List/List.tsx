import React, { JSXElementConstructor, useContext } from "react";

// types
import type { ListContextValues } from "./types";

// list components
import { ListItem, type ListItemProps } from "./ListItem";
import { ListItemButton, type ListItemButtonProps } from "./ListItemButton";
import { ListItemAvatar, type ListItemAvatarProps } from "./ListItemAvatar";
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";
import { ItemDivider, type ItemDividerProps } from "./ItemDivider";

import {
  ListContextProvider,
  ListContextConsumer,
  useListContext,
} from "./ListContext";

import { SxComponentProps, styled, clsx } from "../../styles";
import { twMerge } from "tailwind-merge";
import ListSubheader from "./ListSubheader";
import ItemText from "./ItemText";
import Box from "../Box";

export * from "./ListSubheader";
export * from "./ItemText";
export * from "./ListContext";
export * from "./ListItemAvatar";

const ListRoot = styled(Box, {
  name: "MuxList",
  slot: "Root",
})({
  display: "flex",
  flexDirection: "column",
  minWidth: 160
}).withComponent('ul');

export interface ListProps<
  T extends
    | keyof JSX.IntrinsicElements
    | JSXElementConstructor<any>
    | never = "ul",
> extends SxComponentProps {
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

const List:React.FC<ListProps> = React.forwardRef<HTMLElement, ListProps>((props, ref) => {
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

  const ul = !component || component === "ul";
  let globalBase:ListContextValues|null = null;
  try {
    const {base} = useListContext(false)!;
    globalBase = !isolate && base?.global ? base : null;
    console.log("List Base ListContext:", base);
    if (
      !isolate &&
      base &&
      !base.global &&
      base.ul == ul &&
      base.divider == divider &&
      base.dense == dense &&
      base.gutters == gutters
    ) {
      return (
        <ListRoot
          {...(rest as any)}
          ref={ref as any}
          className={twMerge(base.className, className)}
        >
          {children}
        </ListRoot>
      );
    }
  } catch (e) {
    console.error(e);
  }
  console.log("List Base itemStyle:", globalBase?.item);
  return (
    <ListContextProvider
      value={{
        item: itemStyle && globalBase?.item
          ? {...itemStyle, className: twMerge(globalBase.className, itemStyle.className)}
          : itemStyle ?? globalBase?.item,
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
        suffix,
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

type ListItemIconProps = ListItemPrefixProps;

export type {
  ListItemProps,
  ListItemPrefixProps,
  ListItemSuffixProps,
  ListItemButtonProps,
  ListItemAvatarProps,
  ItemDividerProps,
  ListItemIconProps,
};

const ListItemIcon = ListItemPrefix;

export {
  ListItem,
  ListItemButton,
  ListItemPrefix,
  ListItemSuffix,
  ListItemAvatar,
  ItemDivider,
  ListItemIcon,
};

const MList = Object.assign(React.memo(List), {
  Item: ListItem,
  ItemButton: ListItemButton,
  ItemText,
  Prefix: ListItemPrefix,
  ItemIcon: ListItemIcon,
  Suffix: ListItemSuffix,
  Avatar: ListItemAvatar,
  Icon: ListItemAvatar,
  Divider: ItemDivider,
  Subheader: ListSubheader,
  Provider: ListContextProvider,
});

export default MList;

export { MList as List };
