import React, { useCallback, useMemo } from "react";

// types
import type { ListContextProps, ListContextValues, ItemInteractive } from "../../types/components/list";
import type { ListStylesType } from "../../components/List/style";

import { useTailwindTheme } from "../../theme";
import { twMerge } from "tailwind-merge";
import objectsToString from "../..//utils/objectsToString";

export interface ListContextProviderProps {
  value: ListContextValues;
  children: React.ReactNode;
}

export const ListContext = React.createContext<ListContextProps | null>(null);

ListContext.displayName = "Mux.ListContext";

const defaultListContext:ListContextProps = {
  getItemStyle: (disabled?: Boolean, selected?: Boolean, active?: Boolean, useHover?: boolean) => '',
  item: {
    hover: undefined,
    focus: undefined,
    active: undefined,
    selected: undefined,
    disabled: undefined,
    default: undefined,
    all: undefined,
    ripple: undefined,
    rippleClassName: undefined
  }
} 

export function useListContext(def:boolean = true) {
  const context = React.useContext(ListContext);

  return context || (def ? defaultListContext : context);
}

const createItemInteractive = (name: string, def: ItemInteractive) => {
  const active = name ? `${name}:` : '';
  return {
      ...def,
      bg: def.bg ? `${active}bg-${def.bg}` : undefined,
      color: def.color ? `${active}text-${def.color}` : undefined,
      opacity: def.opacity ? `${active}opacity-${def.opacity}` : undefined,
  }
}



export const ListContextProvider = ({ value, children }: ListContextProviderProps) => {
  const { 
    className, 
    item= {} as ListContextValues['item'], 
    ripple = true,
    hover:hasHover,
    focus:hasFocus,
    select:hasSelect,
    active:hasActive
  } = value;

  const { list } = useTailwindTheme();
  const listTheme = list as ListStylesType;
  const {styles} = listTheme;
  
  const defaults = useMemo(()=> {

    const asObject = (val:any) => 
        !val ? undefined : typeof val === 'object' ? val : {cp: val};

    const listStyle = {...styles?.base?.list, ...value.list};
    const styleList = styles?.base?.list;
    const styleItem = styles?.base?.item;
    const interactiveStyles = styleItem?.interactive;

    const {
      rippleClassName,
      className,   
      active:itemActive,
      hover:itemHover,
      focus:itemFocus,
      selected:itemSelected,
      disabled:itemDisabled,
      ...otherItem
    } = item;
    
    const defaultItemActive = {
      ...interactiveStyles?.active,
      ...asObject(itemActive)
    };

    const defaultItemHover = {
      ...(asObject(itemHover) ??  interactiveStyles?.hover ?? defaultItemActive),
    };

    const defaultItemFocus = {
      ...(asObject(itemFocus) ?? interactiveStyles?.focus ?? defaultItemActive)
    };

    const defaultItemSelected = {
      ...defaultItemActive,
      ...(asObject(itemSelected) ?? interactiveStyles?.selected)
    };

    const defaultItemDisabled = {
      ...styleItem?.initial,
      ...styleItem?.disabled,
      ...otherItem.initial,
      ...createItemInteractive('disabled', asObject(itemDisabled) ?? interactiveStyles?.disabled ?? {}),
    };

    const active = hasActive 
        ? twMerge(objectsToString(createItemInteractive('active', defaultItemActive)))
        : undefined;
    const hover = hasHover 
        ? twMerge(objectsToString(createItemInteractive('hover', defaultItemHover)).replace("active:", ""))
        : undefined;
  
    const focus = hasFocus
        ? twMerge(objectsToString(createItemInteractive('focus', defaultItemFocus)))
        : undefined;
    
    const initial = twMerge(objectsToString({
        ...styleItem?.initial,
        ...otherItem.initial,
      })
    );
    const initialDefault = twMerge(initial, className);
    return {
      list: twMerge(objectsToString(listStyle), listTheme.defaultProps?.className, value.className),
      item: {
        initial: initialDefault,
        active: active,
        hover: hover,
        focus: focus,
        all: twMerge(initial, hover, className),
        default: twMerge(initial, active, focus, className),
        disabled: twMerge(objectsToString(defaultItemDisabled), className),
        selected: hasSelect
            ? twMerge(initial, objectsToString(createItemInteractive('', defaultItemSelected)), className)
            : initialDefault,
        ripple,
        rippleClassName: rippleClassName
      }
    }
  }, [className, hasActive, hasFocus, hasHover, hasSelect, item?.className]);

  const itemStyle = useCallback((disabled?:Boolean, selected?:Boolean, active?:Boolean, useHover?: boolean)=> {
      if (disabled) {
        return defaults.item.disabled;
      }
      if (selected) {
        return defaults.item.selected;
      }

      if (active) {
        return (useHover ?? hasHover 
          ? defaults.item.all 
          : defaults.item.default
        )?.replaceAll("active:", "");
      }

      return useHover ?? hasHover 
          ? defaults.item.all 
          : defaults.item.initial;

  }, [className, hasActive, hasFocus, hasHover, hasSelect, item?.className]) ;

  const values = {
    ...defaults,
    getItemStyle: itemStyle,
  } ;

  //console.log("ListContext:", values)

  return <ListContext.Provider value={values}>
    {children}
    </ListContext.Provider>;
};

ListContextProvider.displayName = "Mux.ListContextProvider";
