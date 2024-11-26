import React, {
  Fragment,
  useContext,
} from "react";

import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  FC,
  ReactNode,
} from "react";

import { IconName, RenderLink } from "./types";
import Icon, { type IconProps } from "./Icon";

import { clsx } from "../../styles";
import { useCmdkContext } from "./CmdContext";
import { twMerge } from "tailwind-merge";
import ListItem from "../List/ListItem";
import ListItemButton, { ListItemButtonProps } from "../List/ListItemButton";

export type ListItemType = "Link" | "Action";

function getListItemWrapperStyles({selected, disabled}:{selected: boolean, disabled?: boolean}) {
  return clsx(
    "command-palette-list-item block grow text-justify gap-3 ps-4 pe-2 py-2.5 rounded-md hover:bg-hd-md focus:ring-1 focus:bg-hd-md focus:outline-none flex items-center justify-between",
    selected && !disabled
      ? "bg-hd-sx"
      : "",
    disabled
      ? "cursor-default pointer-events-none opacity-50"
      : "cursor-pointer"
  );
}

export interface ButtonProps extends ListItemButtonProps {
  closeOnSelect?: boolean;
  Icon?: FC | IconName;
  iconProps?: Omit<IconProps, 'icon'>;
  value?: any;
}

export function Button({
  closeOnSelect = true,
  showType = true,
  className,
  children,
  onClick,
  index,
  iconProps,
  Icon:IconOrName,
  value,
  disabled,
  ...rest
}: ButtonProps) {

  const { 
    setOpen, 
    isSelected, 
    getItemStyle = getListItemWrapperStyles,

  } = useCmdkContext();
  
  const selected = isSelected(value);


  function clickAndClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      onClick(e);

      if (closeOnSelect) {
        setOpen?.(false);
      }
    }
  }

  const classes = twMerge(
    getItemStyle({selected, disabled}),
    className
  );

  const Comp = onClick ? ListItem : ListItemButton;

  return (
    <Comp
        startIcon={
          IconOrName &&
          (typeof IconOrName === "string" ? (
            <Icon icon={IconOrName as IconName} {...iconProps} />
          ) : (
            <IconOrName/>
          ))
        }
        {...rest}
        aria-disabled={disabled ? 'true' : undefined}
        data-close-on-select={closeOnSelect}
        onClick={clickAndClose as any}
        className={classes}>
        {typeof children === "string" ? (
          <span className="truncate max-w-md">{children}</span>
        ) : (
          children
        )}
      </Comp>
  );
}
