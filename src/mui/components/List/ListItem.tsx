import React, { isValidElement, useMemo } from "react";
import type { ReactNode } from "react";

// context
// utils
import { twMerge } from "tailwind-merge";
// list item components
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";
import { useListContext } from "./ListContext";
import { type SxComponentProps, styled } from "../../styles";
import { ButtonBase } from "../Button";

//const has
const ListItemRoot = styled("li", {
  name: "MuxListItem",
  slot: "Root",
})({
  justifyContent: "start",
});

const ListItemButtonRoot = styled(ButtonBase, {
  name: 'MuxListItemButton',
  slot: 'Root',
})({
  justifyContent: 'start'
});

export interface ListItemProps extends SxComponentProps<"li"> {
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  active?: boolean;
  hover?: boolean;
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  button?: boolean;
  href?: string;
  divider?: boolean;
  gutters?: boolean;
  dense?: boolean;
}

export const ListItem = React.forwardRef<HTMLElement, ListItemProps>(
  (
    {
      className,
      disabled,
      selected,
      active,
      hover,
      children,
      itemType,
      startIcon,
      endIcon,
      button,
      divider,
      gutters,
      dense,
      as,
      ...rest
    },
    ref,
  ) => {
    // 1. init

    const { getItemStyle } = useListContext()!;

    const hasHover: any = hover ?? (button ? true : undefined);

    const itemStyles = useMemo(
      () =>
        twMerge(
          getItemStyle(
            disabled,
            selected,
            active,
            hasHover,
            divider,
            gutters,
            dense,
          ),
          className,
        ),
      [
        disabled,
        selected,
        active,
        hasHover,
        className,
        divider,
        gutters,
        dense,
      ],
    );

    const prefixComp =
      !isValidElement(startIcon) ||
      (startIcon as any).type == ListItemPrefix ? (
        startIcon
      ) : (
        <ListItemPrefix>{startIcon}</ListItemPrefix>
      );

    const suffixComp =
      !isValidElement(endIcon) || (endIcon as any).type == ListItemSuffix ? (
        endIcon
      ) : (
        <ListItemSuffix>{endIcon}</ListItemSuffix>
      );

    const item = (
      <ListItemRoot
        {...(rest as any)}
        disabled={typeof as === "string" && disabled ? `true` : undefined}
        area-disabled={disabled ? "true" : undefined}
        active={typeof active === "boolean" ? undefined : active}
        ref={ref}
        as={as}
        className={itemStyles}
      >
        {prefixComp}
        {children}
        {suffixComp}
      </ListItemRoot>
    );

    if (as === "li" || !as) {
      return item;
    }

    return <li area-disabled={disabled ? "true" : undefined}>{item}</li>;
  },
);

ListItem.displayName = "Mux.ListItem";

export type { ListItemPrefixProps, ListItemSuffixProps };
export { ListItemPrefix, ListItemSuffix };
export default Object.assign(ListItem, {
  Prefix: ListItemPrefix,
  Suffix: ListItemSuffix,
});
