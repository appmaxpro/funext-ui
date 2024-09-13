import { useCallback, useMemo, useState, Fragment, useRef, forwardRef } from "react";
import { MaterialIcon, MaterialIconProps } from "../../icons/material-icon";
//import { Button, ButtonProps } from "../button";
//import { ButtonGroup } from "../button-group";
import { clsx } from "../clsx";
import { Image } from "../image";
import { 
  Menu, 
  MenuItem, 
  styled, 
  ButtonGroup, 
  Button, 
  type ButtonProps, 
  IconButton,
  Tooltip,
  MenuHandler,
  MenuList,
  MenuDivider
} from "../../mui";

import Divider from "../../mui/components/Divider";

import { useClassNames } from "../styles";

import styles from "./command-bar.module.scss";
import { useForwardedRef, useRefs } from "../hooks";


export interface CommandItemProps {
  key: string;
  text?: string;
  subtext?: string;
  description?: string;
  color?: ButtonProps["color"];
  menuProps?: { 
    showArrow?: boolean; 
    arrowSide?: "left" | "right" | "center";
    menuSide?: "left" | "right" | "center";
    rounded?: boolean;
  };
  imageProps?: {
    src: string;
    alt: string;
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
  render?: (props: CommandItemProps) => JSX.Element | null;
}

export interface CommandBarProps {
  items: CommandItemProps[];
  className?: string;
  menuProps?: { showArrow?: boolean; rounded?: boolean, side?: "left" | "right";};
  iconProps?: Omit<MaterialIconProps, "icon">;
  iconOnly?: boolean;
  
}

export const CommandItem = forwardRef<HTMLElement, CommandItemProps>(function(props, ref) {
  const {
    text,
    subtext,
    description,
    color = "default",
    menuProps,
    imageProps,
    icon: Icon,
    iconProps,
    iconSide,
    iconOnly,
    checked,
    disabled,
    divider,
    hidden,
    render,
    onClick,
    items = [],
    showDownArrow = false,
    showAsMenuItem,
    className,
  } = props;
  const classNames = useClassNames();
  const [show, setShow] = useState(false);
  const anchorRef = useRef(null);

  const targetRef = useForwardedRef(ref);

  const handleClick = useCallback(
    (e: any) => {
      if (onClick) onClick(e);
    },
    [onClick],
  );

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
      if (showAsMenuItem) handleClick(e);
      if (menu.onClick) menu.onClick(e);
    },
    [showAsMenuItem, hideMenu, handleClick],
  );

  const allItemsHidden = useMemo(
    () => items.length > 0 && items.filter((item) => !item.hidden).length === 0,
    [items],
  );

  if (hidden || allItemsHidden) {
    return null;
  }

  if (render) {
    return render({ ...props, render: undefined });
  }

  if (divider) {
    return <Divider vertical sx={{height: '70%'}}/>;
  }

  const isSplit = onClick && items.length > 0 && !showAsMenuItem;
  const Wrapper = ButtonGroup;

  const showArrow = showDownArrow && !isSplit && items.length > 0;

  const buttonProps =
    isSplit || items.length === 0
      ? {
          onClick: disabled ? undefined : handleClick,
          ref: targetRef,
        }
      : {
          ref: showAsMenuItem ? undefined : targetRef,
          onClick: showMenu,
        };

  const splitProps = {
    ref: targetRef,
    onClick: showMenu,
  };

  const hasContent = !showAsMenuItem && (imageProps || Icon || iconProps || text || showArrow);
  const useWrapperGroup = hasContent && isSplit;
  const useContent = (hasContent  && (isSplit || (text && !iconOnly)));
  const WrapperEl = useWrapperGroup ? Wrapper : Fragment;
  
  const showArrowIn = showArrow && !useContent;

  const iconComp = (Icon 
          ? <Icon className={styles.icon}/> 
          : iconProps?.icon 
            ? <MaterialIcon {...iconProps} className={styles.icon}/>
            : imageProps?.src && 
                  <Image  {...imageProps} className={clsx(styles.image, imageProps.className)}/>)
                   || null;  

  return (
    <>
      {showAsMenuItem ? (
        <SubMenuButton 
        handleMenuClick={handleMenuClick} 
        targetRef={targetRef} 
        showAsMenuItem 
        items={items} {...menuProps}>
          <MenuItem 
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
            
          </MenuItem>
        </SubMenuButton>  
      ) : (
        <WrapperEl {...(useWrapperGroup && {className, color, variant:"text"})}>
          {hasContent && (
            <SubMenuButton items={isSplit ? [] : items } handleMenuClick={handleMenuClick}  {...menuProps}>
              <StyledButton 
                useContent={useContent} 
                color={color}
                title={description || text}
                showTip={!items.length}
                aria-haspopup={!isSplit && items.length > 0 ? "true" : undefined}
                {...buttonProps}
                className={clsx(
                  classNames({
                    active: checked,
                  }),
                  buttonProps.className,
                  'relative inline-flex item-center justify-between'
                )}
                disabled={disabled}
                endIcon={
                  ((iconComp && iconSide === "end") || showArrow) && <>
                      {iconComp}
                      {showArrow && <MaterialIcon
                        icon="arrow_drop_down"
                        className={ styles.arrowIcon}
                      />}
                  </>
                }
                startIcon={
                  iconSide === "end" 
                  ? undefined
                  : iconComp
                }
                text={text}
              > 
                {!iconOnly ? text : null}
              </StyledButton>
            </SubMenuButton>
          )}
          {isSplit && (
            <SubMenuButton items={items} handleMenuClick={handleMenuClick}  {...menuProps}>
              <StyledButton
                useContent={useContent}
                color={color}
                aria-haspopup="true"
                aria-expanded={show ? 'true' : undefined}
                disabled={disabled}
                className={clsx(styles.item, 'min-w-0')}
                showTip={!items.length}
                {...splitProps}
                endIcon={<MaterialIcon
                  icon="arrow_drop_down"
                  className={styles.arrowIcon}
                />}
                />
            
            </SubMenuButton>
          )}
          
        </WrapperEl>)
      }
      
    </>
  );
});

export function CommandBar(props: CommandBarProps) {
  const { className, iconOnly, iconProps = {}, items = [] } = props;
  return (
    <div className={clsx(className, styles.bar)}>
      {items.map(({ iconProps: icon, menuProps, ...item }) => (
        <CommandItem
          iconOnly={iconOnly}
          iconProps={{ ...iconProps, ...icon } as MaterialIconProps}
          menuProps={{
            ...props.menuProps,
            ...menuProps,
          }}
          {...item}
        />
      ))}
    </div>
  );
}

const StyledButton = forwardRef(({useContent, color='default', endIcon, title, text, showTip, ...props}:any, ref) => {
    let button;
    if (useContent) {
      button = (<Button  tabIndex={-1} color={color} {...props} 
        variant="text" 
        endIcon={endIcon} ref={ref} />);

    } else {
      const {children, startIcon, ...iconProps} = props;
      button = (<IconButton {...iconProps} ref={ref} tabIndex={-1}>
            {children}
            {endIcon || startIcon}
      </IconButton>);
    }


    if (showTip && (title || text)) {
      return <Tooltip content={title || text}>
        {button}
      </Tooltip>
    }
    return button;
});


const SubMenuButton = forwardRef(({items=[], handleMenuClick, targetRef, children, showAsMenuItem, ...props}:any, ref) => {
  
  if (!items.length) return children;
  
  return (<Menu placement={!showAsMenuItem ? "bottom-end" : "right-start"} {...props} ref={ref} allowHover={!!showAsMenuItem}>
    <MenuHandler ref={targetRef}>
      {children}
    </MenuHandler>
    <MenuList>
      {items.map((item:any) => {
        const { key, divider, hidden, render } = item;

        if (hidden) {
          return null;
        }
        if (divider) {
          return <MenuDivider key={key}/>;
        }

        const itemProps = {
          ...item,
          showAsMenuItem: true,
          role: 'menuitem',
          onClick: (e: any) => handleMenuClick(e, item),
        };

        if (render) {
          return render({ ...itemProps, render: undefined });
        }

        return <CommandItem {...itemProps} />;
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