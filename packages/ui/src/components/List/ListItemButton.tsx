import React, { isValidElement, useMemo } from "react";

// context
import { useTailwindTheme } from "../../theme";

// utils
import { twMerge } from "tailwind-merge";
// list item components
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";
import { useListContext } from "./ListContext";
import { SxComponentProps, styled } from "../../styles";
import { ButtonBase, type ButtonBaseProps } from "../Button";
import { itemStyle } from "./styles";
import { EMPTY_RECORD } from "../../lib/constants";

//const has
const ListItemButtonRoot = styled(ButtonBase, {
  name: 'MuxListItemButton',
  slot: 'Root',
})(itemStyle);

export interface ListItemButtonProps extends ButtonBaseProps<any> {
  selected?: boolean;
  active?: boolean;
  hover?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  li?: boolean,
  divider?: boolean;
  gutters?: boolean;
  dense?: boolean;
}

export const ListItemButton = React.forwardRef<HTMLElement, ListItemButtonProps>(
  ({ 
    className,
    as,
    component=as,
    disabled, 
    selected, 
    startIcon: startIconProp,
    endIcon: endIconProp,
    active,
    hover = true,
    children, 
    tabIndex,
    role,
    divider,
    gutters,
    dense,
    li: liProps,
    ...rest 
  }, ref) => {
    // 1. init
    //const { list } = useTailwindTheme();
    //const {defaultProps} = list;

    const {
      item, 
      getItemStyle,
      base
    } = useListContext()!;

   
    const {
      startIcon = startIconProp,
      endIcon = endIconProp,
      ul,
      ripple = rest.ripple ?? item?.ripple 
    } = base ?? EMPTY_RECORD;

    const li = liProps ?? (ul && (!component || component !== 'li'))
    
    // 2. set default props
    //const ripple = rest.ripple ?? item?.ripple ?? defaultProps.ripple;


    const itemStyles = useMemo(
          () =>
            twMerge(
              getItemStyle(
                disabled,
                selected,
                active,
                hover,
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
            hover,
            className,
            divider,
            gutters,
            dense,
          ],
        );
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
      tabIndex={tabIndex} 
      role={role}
      disabled={disabled}
      active={active ? `${active}` : undefined}
      selected={selected}
      ripple={ripple}
      ref={ref}
      rippleClassName={item.rippleClassName}
      data-gutters={gutters ? '' : undefined}
      data-dense={dense ? '' : undefined}
      data-divider={divider ? '' : undefined}
      className={itemStyles}>
        {prefixComp}  
        {children}
        {suffixComp}
    </ListItemButtonRoot>;

    if (component === 'li' || !li) {
      return button;
    }

    const inRest:any = rest;
    /*
    const areas = Object.keys(rest)
        .filter(k=> (k.startsWith('aria-')))
        .map(k => ({[k]: inRest[k]}))
        .reduce((prev, next)=> ({...prev, ...next }), {})*/
        const areas = {};
    return (
      <li 
        tabIndex={tabIndex ?? -1} 
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
