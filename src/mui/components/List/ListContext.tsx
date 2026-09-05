import React, { useCallback, useMemo } from "react";

// types
import type {
  ListContextProps,
  ListContextValues,
  ItemInteractive,
} from "../../types/components/list";
import type { ListStylesType } from "../../components/List/style";

import { useTailwindTheme } from "../../theme";
import { twMerge } from "tailwind-merge";
import objectsToString from "../..//utils/objectsToString";

export interface ListContextProviderProps {
  value: ListContextValues;
  children: React.ReactNode;
}

const ListContext = React.createContext<ListContextProps | null>(null);

ListContext.displayName = "Mux.ListContext";

const defaultListContext: ListContextProps = {
  getItemStyle: (
    disabled?: Boolean,
    selected?: Boolean,
    active?: Boolean,
    useHover?: boolean,
    divider?: boolean,
    gutters?: boolean,
    dense?: boolean,
  ) => "",
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
  },
};

export function useListContext(def: boolean = true) {
  try {
    const context = React.useContext(ListContext);
    //console.log("ListContext:", context);
    return context ?? (def ? defaultListContext : context) ;
  } catch (e) {
    if (!def) {
      throw e;
    }
  }

  return defaultListContext;
}

const createItemInteractive = (name: string, def: ItemInteractive) => {
  const active = name ? `${name}:` : "";
  return {
    ...def,
    bg: def.bg ? `${active}bg-${def.bg}` : undefined,
    color: def.color ? `${active}text-${def.color}` : undefined,
    opacity: def.opacity ? `${active}opacity-${def.opacity}` : undefined,
  };
};

export const ListContextProvider:React.FC<ListContextProviderProps> = ({
  value,
  children,
}: ListContextProviderProps) => {
  const {
    className:listClassName,
    item = {} as ListContextValues["item"],
    ripple = true,
    hover: hasHover,
    focus: hasFocus,
    select: hasSelect,
    active: hasActive,
    divider,
    gutters,
    dense,
    ul,
    prefix,
    suffix,
    global,
    ...otherValues
  } = value;

  const { list } = useTailwindTheme();
  const listTheme = list as ListStylesType;
  const { styles } = listTheme;

  const defaults = useMemo(() => {
    const asObject = (val: any) =>
      !val ? undefined : typeof val === "object" ? val : { cp: val };

    const listStyle = { ...styles?.base?.list, ...otherValues.list, divider: divider === true ? styles?.base?.divider : divider  };
    const styleItem = styles?.base?.item;
    const interactiveStyles = styleItem?.interactive;

    const {
      rippleClassName,
      className,
      active: itemActive,
      hover: itemHover,
      focus: itemFocus,
      selected: itemSelected,
      disabled: itemDisabled,
      initial: ctxItemInitial,
    } = item as any;

    const defaultItemActive = {
      ...interactiveStyles?.active,
      ...asObject(itemActive),
    };

    const defaultItemHover = {
      ...(asObject(itemHover) ?? interactiveStyles?.hover ?? defaultItemActive),
    };

    const defaultItemFocus = {
      ...(asObject(itemFocus) ?? interactiveStyles?.focus ?? defaultItemActive),
    };

    const defaultItemSelected = {
      ...defaultItemActive,
      ...(asObject(itemSelected) ?? interactiveStyles?.selected),
    };

    console.log("defaultItemSelected:", defaultItemSelected)

    const defaultItemDisabled = {
      ...styleItem?.initial,
      ...styleItem?.disabled,
      ...ctxItemInitial,
      ...createItemInteractive(
        "disabled",
        asObject(itemDisabled) ?? interactiveStyles?.disabled ?? {},
      ),
    };

    const active = hasActive
      ? twMerge(
          objectsToString(createItemInteractive("active", defaultItemActive)),
        )
      : undefined;
    const hover = hasHover
      ? twMerge(
          objectsToString(
            createItemInteractive("hover", defaultItemHover),
          ).replace("active:", ""),
        )
      : undefined;

    const focus = hasFocus
      ? twMerge(
          objectsToString(createItemInteractive("focus", defaultItemFocus)),
        )
      : undefined;

    const initial = twMerge(
      objectsToString({
        ...styleItem?.initial,
        ...ctxItemInitial,
        
        gutters: gutters === true ? styleItem?.gutters : gutters,
        dense: dense === true ? styleItem?.dense : dense,
      }),
    );
    const initialDefault = twMerge(initial, className);
    return {
      ...otherValues,
      list: twMerge(
        objectsToString(listStyle),
        listTheme.defaultProps?.className,
        listClassName,
      ),
      item: {
        initial: initialDefault,
        active: active,
        hover: hover,
        focus: focus,
        all: twMerge(initial, hover, className),
        default: twMerge(initial, active, focus, className),
        disabled: twMerge(objectsToString(defaultItemDisabled), className),
        selected: hasSelect
          ? twMerge(
              initial,
              objectsToString(createItemInteractive("", defaultItemSelected)),
              className,
            )
          : initialDefault,
        ripple,
        rippleClassName: rippleClassName,
      },
      prefix: twMerge(objectsToString(styles?.base?.itemPrefix), prefix),
      suffix: twMerge(objectsToString(styles?.base?.itemSuffix), suffix),
      global,
      divider,
      gutters,
      dense,
      ul,
      
    };
  }, [listClassName, hasActive, hasFocus, hasHover, hasSelect, item?.className]);

  const itemStyle = useCallback(
    (
      disabled?: Boolean,
      selected?: Boolean,
      active?: Boolean,
      useHover?: boolean,
    ) => {
      if (disabled) {
        return defaults.item.disabled;
      }
      if (selected) {
        return defaults.item.selected;
      }

      if (active) {
        return (
          useHover ?? hasHover ? defaults.item.all : defaults.item.default
        )?.replace(new RegExp("active:", 'g'), "");
      }      
      return useHover ?? hasHover ? defaults.item.all : defaults.item.initial;
    },
    [defaults],
  );

  const values = useMemo(() => ({
    ...defaults,
    getItemStyle: itemStyle,
  }), [itemStyle]);

  return <ListContext.Provider value={values}>{children}</ListContext.Provider>;
};

export const ListContextConsumer = ListContext.Consumer;

ListContextProvider.displayName = "Mux.ListContextProvider";
