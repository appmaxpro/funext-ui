import React from "react";
// @floating-ui
import MenuList,  { type MenuListProps } from "./MenuList";
import {Menu, type MenuProps} from "./Menu";
import {MenuHandler} from "./MenuHandler";
import {MenuItem} from "./MenuItem";


export interface MenuSubContextProviderProps {
  value: boolean;
  children: React.ReactNode;
}

export const MenuSubContext = React.createContext<boolean>(false);
MenuSubContext.displayName = "Mux.MenuSubContext";

export function useSubMenu() {
  const context = React.useContext(MenuSubContext);

  if (typeof context !== 'boolean') {
    throw new Error(
      "useSubMenu() must be used within a Menu. It happens when you use MenuCore, MenuHandler, MenuItem or MenuList components outside the Menu component.",
    );
  }

  return context;
}

export const MenuSubContextProvider = ({ value, children }: {value: boolean, children: React.ReactNode}) => {
  return <MenuSubContext.Provider value={value}>{children}</MenuSubContext.Provider>;
};

MenuSubContextProvider.displayName = "Mux.MenuSubContextProvider";



interface MenuSubListProps extends React.ComponentProps<any> {
    menuProps?: MenuProps;
    listProps?: MenuSubListProps;
    rtl?: boolean;
    item?: React.ReactNode;
}

export const MenuSubList = React.forwardRef<HTMLElement, MenuSubListProps>(
  ({ children, item, rtl, menuProps, listProps, ...rest }, ref) => {

    //const { getReferenceProps, reference, nested } = useMenu();

    //@ts-nocheck
    
    //const mergedRef = useMergeRefs([ref, reference as (instance: any) => void]);

    const [open, setOpen] = React.useState(false);

    //const handler = React.useCallback((open:boolean)=> setOpen(open), [open]);

    var allChilds = React.Children.toArray(children);
    const menuItem = item || allChilds.filter(a => (a as React.ReactElement).type ===  MenuItem)[0];
    const items = allChilds.filter(a => a != menuItem);
    const childs:Array<any> = [];
    childs.push(
      <MenuHandler {...rest} ref={ref}>
        {menuItem}
      </MenuHandler>
    );
    if((items && items.length > 0 || item)) {
      childs.push(
        <MenuList {...listProps}>
          {
            item 
              ? children
              : React.Children.map(items, 
                (item) => React.cloneElement(item as React.DetailedReactHTMLElement<any, HTMLElement>))
          }
        </MenuList>
      )
    }
    const memoChildren = React.useMemo(()=> 
    (<Menu {...(menuProps as any)} allowHover placement="right-start">
      {childs}
    </Menu>), [open, ])

    return <MenuSubContextProvider value={open}>
        {memoChildren}
    </MenuSubContextProvider>
});

MenuSubList.displayName = "Mux.MenuSubList";