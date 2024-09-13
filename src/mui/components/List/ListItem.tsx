import React, { isValidElement } from "react";
import type {ReactNode} from "react";

// context
// utils
import { twMerge } from "tailwind-merge";
// list item components
import { ListItemPrefix, type ListItemPrefixProps } from "./ListItemPrefix";
import { ListItemSuffix, type ListItemSuffixProps } from "./ListItemSuffix";
import { useListContext } from "./ListContext";
import { type SxComponentProps, styled } from "../../styles";

//const has
const ListItemRoot = styled('li', {
  name: 'MuxListItem',
  slot: 'Root',
})('');

export interface ListItemProps extends SxComponentProps<'li'> {
  className?: string;
  disabled?: boolean;
  selected?: boolean;
  active?: boolean;
  hover?:boolean;
  children: ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  button?:boolean;
  href?:string;
}

export const ListItem = React.forwardRef<HTMLElement, ListItemProps>(
  ({ 
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
    as,
    ...rest 
  }, ref) => {
    // 1. init
    
    const {getItemStyle} = useListContext()!;

    const hasHover:any = hover ?? (button ? true : undefined);

    const itemStyles = twMerge(getItemStyle(disabled, selected, active, hasHover), className);

    const prefixComp = !isValidElement(startIcon) || (startIcon as any).type == ListItemPrefix 
          ? startIcon 
          : <ListItemPrefix>{startIcon}</ListItemPrefix>

    //if(active)
    //  console.log("ListItemButton: tabIndex:", tabIndex, ", itemStyles:", itemStyles)
    const suffixComp = !isValidElement(endIcon)  || (endIcon as any).type == ListItemSuffix 
      ? endIcon 
      : <ListItemSuffix>{endIcon}</ListItemSuffix>
  
    const item = (
      <ListItemRoot 
          tabIndex={0}
          {...(rest as any)}
          disabled={(typeof as === 'string' && disabled) ? `true` : undefined}
          area-disabled={disabled ? 'true' : undefined}
          active={typeof active === 'boolean' ? undefined : active}
          ref={ref}
          as={as}
          className={itemStyles}>

          {suffixComp}
          {children}
          {prefixComp}  
        </ListItemRoot>);

    if (as === 'li' || !as) {
        return item;
    }

    return <li area-disabled={disabled ? 'true' : undefined}>{item}</li>;
  },
);


ListItem.displayName = "Mux.ListItem";

export type { ListItemPrefixProps, ListItemSuffixProps };
export { ListItemPrefix, ListItemSuffix };
export default Object.assign(ListItem, { Prefix: ListItemPrefix, Suffix: ListItemSuffix });
