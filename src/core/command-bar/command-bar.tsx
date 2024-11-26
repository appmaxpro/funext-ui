import * as React from "react";
import { useCallback, useMemo, useState, Fragment, useRef, forwardRef, FC } from "react";

import { MaterialIcon, MaterialIconProps } from "../../icons/material-icon";
//import { Button, ButtonProps } from "../button";
//import { ButtonGroup } from "../button-group";
import { clsx } from "../clsx";
import { Image } from "../image";
import { 
  Menu, 
  MenuProps,
  MenuItem, 
  styled, 
  ButtonGroup, 
  Button, 
  type ButtonProps, 
  IconButton,
  Tooltip,
  MenuHandler,
  MenuList,
  MenuListProps,
  MenuDivider,
  TooltipProps,
  Divider
} from "../../mui";


import { useClassNames } from "../styles";

import styles from "./command-bar.module.scss";
import { useForwardedRef, useRefs } from "../hooks";


export interface CommandItemProps {
  key?: any;
  text?: string;
  subtext?: string;
  description?: string;
  menuProps?: Omit<MenuProps, 'children'>;
  menuListProps?: Omit<MenuListProps, 'children'>;
  imageProps?: {
    src: string;
    alt: string;
    className?: string;
  };
  icon?: (props?: { className?: string }) => JSX.Element | null;
  iconProps?: MaterialIconProps;
  iconOnly?: boolean;
  iconSide?: "start" | "end";
  
  disabled?: boolean;
  checked?: boolean;
  divider?: boolean;
  hidden?: boolean;
  onClick?: React.EventHandler<
    React.MouseEvent<HTMLElement, MouseEvent> | React.KeyboardEvent<HTMLElement>
  >;
  items?: CommandItemProps[];
  showDownArrow?: boolean;
  
  showAsMenuItem?: boolean;
  className?: string;
  asSplit?: boolean;
  outer?: FC<CommandItemProps>;
  inner?: FC<Omit<CommandItemProps  & {children: React.ReactNode}, 'outer' | 'inner'>>;
  props?: any;
  size?: ButtonProps['size'];
  variant?: ButtonProps['variant'];
  color?: ButtonProps['color'];
}

export interface CommandBarProps {
  items: CommandItemProps[];
  className?: string;
  menuProps?: Omit<MenuProps, 'children'>;
  menuListProps?: Omit<MenuListProps, 'children'>;
  iconProps?: Omit<MaterialIconProps, "icon">;
  iconOnly?: boolean;
  //size?: 
}

export const CommandItem = forwardRef<HTMLElement, CommandItemProps>(function(props, ref) {
  const {
    text,
    subtext,
    description,
    color = "default",
    size,
    variant='text',
    menuProps,
    menuListProps,
    imageProps,
    icon: Icon,
    iconProps,
    iconSide,
    iconOnly,
    checked,
    disabled,
    divider,
    hidden,
    outer:OuterRender,
    onClick,
    items = [],
    showDownArrow = false,
    showAsMenuItem,
    className,
    asSplit,
  } = props;
  const classNames = useClassNames();
  const [show, setShow] = useState(false);
  const anchorRef = useRef(null);

  const targetRef = useForwardedRef(ref);

  const showMenu = useCallback(() => {
    console.log("showMenu");
    setShow(true);
  }, []);

  const hideMenu = useCallback(() => {
    setShow(false);
  }, []);

  const handleMenuClick = useCallback(
    (e: any, menu: CommandItemProps) => {
      hideMenu();
      if (showAsMenuItem) onClick?.(e);
      if (menu.onClick) menu.onClick(e);
    },
    [showAsMenuItem, hideMenu, onClick],
  );

  const allItemsHidden = useMemo(
    () => items.length > 0 && items.filter((item) => !item.hidden).length === 0,
    [items],
  );

  if (hidden || allItemsHidden) {
    return null;
  }

  if (divider) {
    return <Divider vertical variant="middle" flexItem/>;
  }

  if (OuterRender) {
    const {outer, inner, ...rest} = props;
    //@ts-ignore
    return <OuterRender {...rest} ref={targetRef as any}/>;
  }

  const isSplit = asSplit ?? (onClick && items.length > 0 && !showAsMenuItem);
  const Wrapper = ButtonGroup;

  const showArrow = showDownArrow && !isSplit && items.length > 0;

  const buttonProps =
    isSplit || items.length === 0
      ? {
          onClick: disabled ? undefined : onClick,
          ref: targetRef,
        }
      : {
          ref: showAsMenuItem ? undefined : targetRef,
          onClick: showMenu,
        };

  const splitProps = {
    ref: targetRef,
    onClick: asSplit ? (onClick ?? showMenu) : showMenu,
  };

  const hasContent = !asSplit && !showAsMenuItem && (imageProps || Icon || iconProps || text || showArrow);
  const useWrapperGroup = hasContent && isSplit;
  const useContent = (hasContent  && (isSplit || (text && !iconOnly)));
  const WrapperEl:React.FC<any> = useWrapperGroup ? Wrapper : Fragment;
  
  const showArrowIn = showArrow && !useContent;

  const iconComp = (Icon 
          ? <Icon className={styles.icon}/> 
          : iconProps?.icon 
            ? <MaterialIcon {...iconProps} className={styles.icon} />
            : imageProps?.src && 
                  <Image  {...imageProps} className={clsx(styles.image, imageProps.className)}/>)
                   || undefined;  

  
  const MenuEl:React.FC<any> = MenuItem;
  return (
    <>
      {showAsMenuItem ? (
        <SubMenuButton 
          handleMenuClick={handleMenuClick} 
          targetRef={targetRef} 
          showAsMenuItem 
          items={items} 
          item={props}
          menuProps={menuProps} 
          menuListProps={menuListProps}>
          <MenuEl 
             {...buttonProps} 
             disabled={disabled} 
             endIcon={items?.length > 0
                ? (
                  <MaterialIcon icon="arrow_right" className={styles.icon} fontSize={18}/>
                )
                : null
              }
             >
            {subtext ? (
              <div className={styles.menuTexts}>
                <span className={styles.menuTitle}>{text}</span>
                <span className={styles.menuSub}>{subtext}</span>
              </div>
            ) : text
            }
            
          </MenuEl>
        </SubMenuButton>  
      ) : (
        <WrapperEl {...(useWrapperGroup && {className, color, variant})}>
          {hasContent && (
            <SubMenuButton 
              items={isSplit ? [] : items } 
              item={props}
              handleMenuClick={handleMenuClick}  
              menuProps={menuProps} 
              menuListProps={menuListProps}
              targetRef={buttonProps.ref}>

              <StyledButton 
                useContent={useContent} 
                
                title={description || text}
                showTip={!items.length}
                aria-haspopup={!isSplit && items.length > 0 ? "true" : undefined}
                {...buttonProps}
                className={clsx(
                  classNames({
                    active: checked,
                  }),
                  'relative inline-flex item-center justify-between',
                  className,
                )}
                disabled={disabled}
                endIcon={
                  ((iconComp && iconSide === "end") || showArrow) && <>
                      {iconSide === "end" ? iconComp : null}
                      {showArrow && <MaterialIcon
                        icon="arrow_drop_down"/>}
                  </>
                }
                startIcon={
                  iconSide === "end" 
                  ? undefined
                  : iconComp
                }
                text={text}
                color={color}
                variant={variant}
                size={size}
              > 
                {!iconOnly ? text : null}
              </StyledButton>
            </SubMenuButton>
          )}
          {isSplit && (
            <SubMenuButton 
              items={items} 
              item={props}
              handleMenuClick={handleMenuClick}
              menuProps={menuProps} 
              menuListProps={menuListProps}>
              <StyledButton
                useContent={useContent}
                color={color}
                aria-haspopup="true"
                aria-expanded={show ? 'true' : undefined}
                disabled={disabled}
                className={clsx(styles.item, 'min-w-0', className)}
                showTip={!items.length}
                {...splitProps}
                endIcon={
                  (asSplit && iconComp)
                  ? iconComp 
                  : <MaterialIcon
                    icon="arrow_drop_down"
                  />
                }
                variant={variant}
                size={size}
                />
            
            </SubMenuButton>
          )}
          
        </WrapperEl>)
      }
      
    </>
  );
});

export function CommandBar(props: CommandBarProps) {
  const { className, iconOnly, iconProps = {}, items = [], menuListProps } = props;
  return (
    <div className={clsx(className, styles.bar)}>
      {items.map(({ iconProps: icon, hidden, menuProps, outer:OuterRender=CommandItem, divider, ...item }, index) => (

       divider 
        ? <Divider vertical variant="middle" flexItem key={`${index}`}/>
        : hidden 
          ? null
          : <OuterRender
              iconOnly={iconOnly}
              iconProps={{ ...iconProps, ...icon } as MaterialIconProps}
              menuListProps={menuListProps}
              {...item}
              menuProps={{
                ...props.menuProps,
                ...menuProps,
              }}
              key={`${index}`}
          />
      ))}
    </div>
  );
}

let _hoverProps:TooltipProps['hoverProps'] = undefined;

function getHoverProps() {
  if(!_hoverProps) {
    _hoverProps = {
      delay: {
        open: 2000,
        close: 0
      },
      restMs: 1000
    }
  }
  return _hoverProps;
}

const StyledButton = forwardRef(({
  useContent, 
  color='default', 
  endIcon, 
  title, 
  text, 
  showTip, 
  ...props}:any, 
  ref) => {
    let button;
    if (useContent) {
      button = (<Button  tabIndex={-1} color={color} {...props} 
        variant="text" 
        endIcon={endIcon} ref={ref} />);

    } else {
      const {children, startIcon, ...iconProps} = props;
      button = (<IconButton {...iconProps} color={color} ref={ref} tabIndex={-1}>
            {children}
            {endIcon || startIcon}
      </IconButton>);
    }


    if (showTip && (title || text)) {
      button = (<Tooltip content={title || text} hoverProps={getHoverProps()}>
        {button}
      </Tooltip>)
    }
    return button;
});



const SubMenuButton = forwardRef(({
  items=[], 
  item,
  handleMenuClick, 
  targetRef, 
  children, 
  showAsMenuItem, 
  menuProps,
  menuListProps,
  ...props
}:any, ref) => {
  
  
  
  let itemProps = item;
  let InnerRender;
  if (item.inner) {
    const {inner, outer, ...rest} = item;
    InnerRender = inner;
    itemProps =  rest;
  }

  if (!items.length) {
    if (InnerRender) {
      return <InnerRender {...itemProps}>{children}</InnerRender>
    }

    return children;
  }

  const placement = menuProps?.placement ?? showAsMenuItem ? "right-start" : "bottom-end";
  const [side1, side2] = placement.split('-');
  const isTopOrBottom = !showAsMenuItem && (side1 === 'bottom' || side1 === 'top');

  const childPlacement = 
    isTopOrBottom && (side2 === 'end' || side2 === 'start')
    ? side2 === 'end'
      ? 'right-start'
      : 'left-end'
    : placement;
  
  let handler = (<MenuHandler ref={targetRef}>
          {children}
        </MenuHandler>);


  if (item.iconOnly) {
    const tip = item.description ?? item.title ?? item.text ;
    if (tip) {
      const btn = handler;
      handler = (
        <Tooltip 
          content={tip}
          hoverProps={getHoverProps()}
        >
          {btn}
        </Tooltip>);
    }
  }

  if (InnerRender) {
    const btn = handler;
    handler = <InnerRender {...itemProps}>{btn}</InnerRender> 
  }

  return (<Menu 
    placement={!showAsMenuItem ? "bottom-start" : "right-start"}
    strategy="fixed"
    {...menuProps} 
    ref={ref}
    allowHover={!!showAsMenuItem}>
    {handler}
    <MenuList {...menuListProps}>
      {items.map((item:any, index: any) => {
        const { key=index, divider, hidden, outer:OuterRender, ...rest } = item;

        if (hidden) {
          return null;
        }
        if (divider) {
          return <MenuDivider key={key}/>;
        }

        const itemProps = {
          menuListProps: (item.items?.length ?? 0) > 0 ? menuListProps : undefined,
          menuProps: (item.items?.length ?? 0) > 0 ? {
            ...menuProps,
            placement: childPlacement
          } : undefined,
          ...rest,
          showAsMenuItem: true,
          role: 'menuitem',
          onClick: (e: any) => handleMenuClick(e, item),
        };

        if (OuterRender) {
          return <OuterRender { ...itemProps} key={key}/>;
        }

        return <CommandItem {...itemProps} key={key}/>;
      })}
    </MenuList>
  </Menu>);

})

/*
const StyledMenu = styled((arrow, side, ...props) => (
  <Menu
    elevation={(arrow ? 0 : undefined)}
    PaperProps={(arrow ? {
      elevation: 0,
      sx: {
        overflow: 'visible',
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
        mt: 1.5,
        '&::before': {
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          right: 14,
          width: 10,
          height: 10,
          bgcolor: 'background.paper',
          transform: 'translateY(-50%) rotate(45deg)',
          zIndex: 0,
        },
      },
    }: undefined)}
    transformOrigin={side ? { horizontal: side, vertical: 'top' } : undefined}
    anchorOrigin={side ? { horizontal: side, vertical: 'bottom' } : undefined}
    {...props}
  />
))(({ theme }) => ({}));
*/