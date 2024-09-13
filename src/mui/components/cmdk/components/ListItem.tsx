import Icon, { Variant } from "./Icon";
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

import { IconName, RenderLink } from "../types";
import { OpenContext, RenderLinkContext, SelectContext } from "../lib/context";
import { classNames } from "../lib/utils";
import type { IconProps } from "./Icon";
export type ListItemType = "Link" | "Action";

function getListItemWrapperStyles(selected: boolean, disabled?: boolean) {
  return classNames(
    "command-palette-list-item block grow text-justify gap-3 ps-4 pe-2 py-2.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-1 focus:ring-slate-300 focus:outline-none flex items-center justify-between",
    selected && !disabled
      ? "bg-slate-200/50 dark:bg-slate-800"
      : "bg-transparent",
    disabled
      ? "cursor-default pointer-events-none opacity-50"
      : "cursor-pointer"
  );
}

interface ListItemBaseProps {
  closeOnSelect?: boolean;
  icon?: FC | IconName;
  iconProps?: Omit<IconProps, 'icon'>;
  showType?: boolean;
  disabled?: boolean;
  keywords?: string[];
  index: number;
}

export interface LinkProps
  extends ListItemBaseProps,
    DetailedHTMLProps<
      AnchorHTMLAttributes<HTMLAnchorElement>,
      HTMLAnchorElement
    > {
  renderLink?: RenderLink;
}

export function Link({
  renderLink: localRenderLink,
  closeOnSelect = true,
  disabled = false,
  showType = true,
  className,
  children,
  onClick,
  index,
  icon,
  iconProps,
  ...rest
}: LinkProps) {
  const { renderLink: globalRenderLink } = useContext(RenderLinkContext);
  const { onChangeOpen } = useContext(OpenContext);
  const { selected } = useContext(SelectContext);

  const renderLink = localRenderLink || globalRenderLink;

  function renderLinkContent() {
    return (
      <ListItemContent
        type={showType ? "Link" : undefined}
        icon={icon}
        iconProps={iconProps}
      >
        {children}
      </ListItemContent>
    );
  }

  const styles = classNames(
    getListItemWrapperStyles(selected === index, disabled),
    className
  );

  function clickAndClose(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    if (rest.href && !disabled) {
      if (onClick) {
        onClick(e);
      }

      if (closeOnSelect) {
        onChangeOpen(false);
      }
    }
  }

  return renderLink ? (
    <Fragment>
      {renderLink({
        ...rest,
        "data-close-on-select": closeOnSelect,
        children: renderLinkContent(),
        "aria-disabled": disabled,
        onClick: clickAndClose,
        className: styles,
      })}
    </Fragment>
  ) : (
    <a
      {...rest}
      data-close-on-select={closeOnSelect}
      aria-disabled={disabled}
      onClick={clickAndClose}
      className={styles}
    >
      {renderLinkContent()}
    </a>
  );
}

export interface ButtonProps
  extends ListItemBaseProps,
    DetailedHTMLProps<
      ButtonHTMLAttributes<HTMLButtonElement>,
      HTMLButtonElement
    > {}

export function Button({
  closeOnSelect = true,
  showType = true,
  className,
  children,
  onClick,
  index,
  iconProps,
  icon,
  ...rest
}: ButtonProps) {
  const { selected } = useContext(SelectContext);
  const { onChangeOpen } = useContext(OpenContext);

  function clickAndClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      onClick(e);

      if (closeOnSelect) {
        onChangeOpen(false);
      }
    }
  }

  return (
    <button
        {...rest}
        aria-disabled={rest.disabled ?? false}
        data-close-on-select={closeOnSelect}
        onClick={clickAndClose}
        className={classNames(
          getListItemWrapperStyles(selected === index, rest.disabled),
          className
        )}
      >
        <ListItemContent
          type={showType ? "Action" : undefined}
          iconProps={iconProps}
          icon={icon}
        >
          {children}
        </ListItemContent>
      </button>
  );
}

export function Li({
  closeOnSelect = true,
  showType = true,
  className,
  children,
  onClick,
  index,
  iconProps,
  icon,
  ...rest
}: ButtonProps) {
  const { selected } = useContext(SelectContext);
  const { onChangeOpen } = useContext(OpenContext);

  function clickAndClose(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (onClick) {
      onClick(e);

      if (closeOnSelect) {
        onChangeOpen(false);
      }
    }
  }

  const Comp:React.ElementType = 'li' as const;

  return (
    <Comp
      {...rest}
      aria-disabled={rest.disabled ?? false}
      data-close-on-select={closeOnSelect}
      onClick={clickAndClose}
      className={classNames(
        getListItemWrapperStyles(selected === index, rest.disabled),
        className
      )}
    >
      <ListItemContent
        type={showType ? "Action" : undefined}
        iconProps={iconProps}
        icon={icon}
      >
        {children}
      </ListItemContent>
      
    </Comp>
  );
}


interface ListItemContentProps {
  icon?: FC<any> | IconName;
  iconProps?: Omit<IconProps, 'icon'>;
  children: ReactNode;
  type?: ListItemType;
}

function ListItemContent({
  icon: ListItemIcon,
  iconProps,
  children,
  type,
}: ListItemContentProps) {
  return (
    <>
      <div className="flex grow items-center gap-2.5">
        {ListItemIcon &&
          (typeof ListItemIcon === "string" ? (
            <Icon icon={ListItemIcon as IconName} {...iconProps} />
          ) : (
            <ListItemIcon className="item-text" />
          ))}

        {typeof children === "string" ? (
          <span className="truncate max-w-md">{children}</span>
        ) : (
          children
        )}
      </div>

      {type && <span className="item-text text-sm shrink">{type}</span>}
    </>
  );
}



export default function ListItem(props: ButtonProps & LinkProps) {
  const Wrapper = props.href 
    ? Link 
    : !props.showType 
      ? Li 
      : Button;
  
  if (Wrapper !== Li) {
    return <li className="inline-flex"><Wrapper {...props} /></li>
  }
  
  return <Wrapper {...props} />;
}
