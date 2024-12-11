import React, { isValidElement } from "react";
import type {ReactNode, ElementType, ComponentType} from "react";

// context
import { useTailwindTheme } from "../../theme";

// utils
import { twMerge } from "tailwind-merge";
// list item components
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";
import { useListContext } from "./ListContext";
import { SxComponentProps, styled } from "../../styles";
import { ListItemRipple } from "./ListItemRipple";
import { ButtonBase, type ButtonBaseProps } from "../Button";

//const has
const ListItemButtonRoot = styled(ButtonBase, {
  name: 'MuxListItemButton',
  slot: 'Root',
})({
  justifyContent: 'start'
});

export interface ListItemButtonProps extends ButtonBaseProps<any> {
  selected?: boolean;
  active?: boolean;
  hover?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  li?: boolean,
}

export const ListItemButton = React.forwardRef<HTMLElement, ListItemButtonProps>(
  ({ 
    className,
    as,
    component=as,
    disabled, 
    selected, 
    startIcon,
    endIcon,
    active,
    hover = true,
    children, 
    tabIndex,
    role,
    li=true,
    ...rest 
  }, ref) => {
    // 1. init
    const { list } = useTailwindTheme();
    const {defaultProps} = list;

    const {
      item: {ripple: contextRipple, rippleClassName}, 
      getItemStyle
    } = useListContext(true)!;
    
    // 2. set default props
    const ripple = rest.ripple ?? contextRipple ?? defaultProps.ripple;

    const itemStyles = twMerge(getItemStyle(disabled, selected, active, hover), className);
    //console.log("itemStyles:", itemStyles)
    
    const prefixComp = !isValidElement(startIcon) || (startIcon as any).type === ListItemPrefix 
          ? startIcon 
          : <ListItemPrefix>{startIcon}</ListItemPrefix>

    //if(active)
    //  console.log("ListItemButton: tabIndex:", tabIndex, ", itemStyles:", itemStyles)
    const suffixComp = !isValidElement(endIcon)  || (endIcon as any).type === ListItemSuffix 
      ? endIcon 
      : <ListItemSuffix>{endIcon}</ListItemSuffix>


    const isComp = typeof component !== 'string';

    const button = <ListItemButtonRoot
      {...(rest as any)}
      component={component}
      tabIndex={(component === 'li' || !li) ? tabIndex : undefined } 
      role={role}
      disabled={disabled}
      active={active ? `${active}` : undefined}
      selected={selected}
      ripple={ripple}
      ref={ref}
      className={itemStyles}>
        {prefixComp}  
        {children}
        {suffixComp}
    </ListItemButtonRoot>;

    if (component === 'li' || !li) {
      return button;
    }

    const inRest:any = rest;
    const areas = Object.keys(rest)
        .filter(k=> (k.startsWith('aria-')))
        .map(k => ({[k]: inRest[k]}))
        .reduce((prev, next)=> ({...prev, ...next }), {})
    
    return (
      <li 
        tabIndex={tabIndex} 
        area-disabled={disabled ? 'true' : undefined}
        role={role}
         {...areas}
        >
        {button}
      </li>
    );
  },
);


ListItemButton.displayName = "Mux.ListItemButton";

export type { ListItemPrefixProps, ListItemSuffixProps };
export { ListItemPrefix, ListItemSuffix };
export default Object.assign(ListItemButton, { Prefix: ListItemPrefix, Suffix: ListItemSuffix });
