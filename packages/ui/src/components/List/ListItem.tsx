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
import { itemStyle } from "./styles";
import { EMPTY_RECORD } from "../../lib/constants";

//const has
const ListItemRoot = styled("li", {
  name: "MuxListItem",
  slot: "Root",
})(itemStyle);

export interface ListItemProps extends Omit<SxComponentProps<"li">, 'title'> {
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  active?: boolean;
  hover?: boolean;
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  title?: ReactNode;
  button?: boolean;
  href?: string;
  divider?: boolean;
  gutters?: boolean;
  dense?: boolean;
  component?: React.ComponentType;
  li?: boolean;
}

export const ListItem = React.forwardRef<HTMLElement, ListItemProps>(
  (
    {
      className,
      disabled,
      selected,
      active,
      hover,

      itemType,
      startIcon: startIconProp,
      endIcon: endIconProp,
      title: titleProps,
      children: childrenProps,
      button,
      divider,
      gutters,
      dense,
      as,
      component=as,
      li: liProps,
      ...rest
    },
    ref,
  ) => {
    // 1. init

    const {
      getItemStyle,
      base
    } = useListContext()!;

    const {
      startIcon = startIconProp,
      endIcon = endIconProp,
      ul,
    } = base ?? EMPTY_RECORD;

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

    const li = (ul &&  (liProps !== false  && (!component || component !== 'li')))

    const title = titleProps ?? childrenProps;
    const children = titleProps ? childrenProps : null;
    const itemChild = children ? (
      <div className={itemStyles}>
        {prefixComp}
        {title}
        {suffixComp}
      </div>
    ) : (
      <>
        {prefixComp}
        {title}
        {suffixComp}
      </>
    );
    const item = (
      <ListItemRoot
        
        {...(rest as any)}
        as={component}
        disabled={typeof as === "string" && disabled ? `true` : undefined}
        area-disabled={disabled ? "true" : undefined}
        active={typeof active === "boolean" ? undefined : active}
        ref={ref}
        className={itemStyles}
        data-gutters={gutters ? '' : undefined}
        data-dense={dense ? '' : undefined}
        data-divider={divider ? '' : undefined}
      >
        {itemChild}
        {children}
      </ListItemRoot>
    );

    if (component || !li) {
      return item;
    }

    return <li  area-disabled={disabled ? "true" : undefined}>{item}</li>;
  },
);

ListItem.displayName = "Mux.ListItem";

export type { ListItemPrefixProps, ListItemSuffixProps };
export { ListItemPrefix, ListItemSuffix };
export default Object.assign(ListItem, {
  Prefix: ListItemPrefix,
  Suffix: ListItemSuffix,
});
