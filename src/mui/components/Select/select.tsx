/** @jsxImportSource @emotion/react */
import { css } from "@emotion/react";
import * as React from "react";
import {
  useRole,
  useDismiss,
  useListNavigation,
  useTypeahead,
  useFocus,
  OpenChangeReason,
} from "@floating-ui/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { OverridableStringUnion } from "../../props";

import { MaterialIcon } from "../../../icons/material-icon";
import { useControlled, useRefs } from "../../hooks";
import { styled, clsx, type Theme } from "../../styles";
import { IconButton } from "../IconButton";
import Chip from "../Chip";
import { type InputProps, Input } from "../Input";
import {
  Popper,
  PopperPortal,
  type PopperContextProps,
  PopperContent,
  usePopperContext,
} from "../Popper";
import { Panel, PanelRoot, type PanelProps } from "../Panel";
import { List, ListItem, ListItemProps, type ListProps } from "../List";
import usePrevious  from "../../hooks/usePrevious";

//console.log("Select styles:", styles);
const isElementInListbox = (listboxRef:any) =>
  listboxRef.current !== null && listboxRef.current.parentElement?.contains(document.activeElement);

const PanelSelectRoot = styled(Panel, {
  name: "MuxSelect",
  slot: "Panel",
  overridesResolver: (props: any, styles: any) => styles.panel,
})('');

const ListSelectRoot = styled(List, {
  name: "MuxSelect",
  slot: "List",
  overridesResolver: (props: any, styles: any) => styles.list,
})("");

const SelectClearIndicator = styled(IconButton, {
  name: "MuxSelect",
  slot: "ClearIndicator",
  overridesResolver: (props: any, styles: any) => styles.clearIndicator,
})({
  marginRight: -2,
  padding: 4,
  visibility: "hidden",
});

const SelectPopupIndicator = styled(IconButton, {
  name: "MuxSelect",
  slot: "PopupIndicator",
  overridesResolver: ({ ownerState }: any, styles: any) => ({
    ...styles.popupIndicator,
    ...(ownerState.popupOpen && styles.popupIndicatorOpen),
  }),
})({
  padding: 2,
  marginRight: -2,
  variants: [
    {
      props: { popupOpen: true },
      style: {
        transform: "rotate(180deg)",
      },
    },
  ],
});

const SelectInputRoot = styled(Input, {
  name: "MuxSelect",
  slot: "Root",
  overridesResolver: ({ ownerState }: any, styles: any) => ({
    ...styles.popupIndicator,
    ...(ownerState.popupOpen && styles.popupIndicatorOpen),
  }),
})('');


const SelectLoading = styled('div', {
  name: 'MuxSelect',
  slot: 'Loading',
  overridesResolver: (props:any, styles:any) => styles.loading,
})(({ theme }:any) => ({
  color: (theme.vars || theme).palette.text.secondary,
  padding: '14px 16px',
}));

const SelectNoOptions = styled('div', {
  name: 'MuxSelect',
  slot: 'NoOptions',
  overridesResolver: (props:any, styles:any) => styles.noOptions,
})(({ theme }:any) => ({
  color: (theme.vars || theme).palette.text.secondary,
  padding: '14px 16px',
}));

const SelectOption = styled(ListItem, {
  name: 'MuxSelect',
  slot: 'Option',
  overridesResolver: (props:any, styles:any) => styles.option,
})('');

const HeaderRoot = styled('div', {
  name: "MuxSelect",
  slot: "Header",
  overridesResolver: (props: any, styles: any) => styles.header,
})("");

const FooterRoot = styled('div', {
  name: "MuxSelect",
  slot: "Footer",
  overridesResolver: (props: any, styles: any) => styles.footer,
})("");

export type CloseOpenChangeReason = OpenChangeReason | "item-select" | 'blur';

export type SelectValue<Type, Multiple extends boolean> =
  | (Multiple extends true ? Type[] : Type)
  | null
  | undefined;

export type SelectIcon = {
  key?: string | number;
  icon: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export interface SelectRenderOptionState {
  inputValue: string;
  index: number;
  selected: boolean;
}

export interface SelectOptionProps<Type> {
  props: React.HTMLAttributes<HTMLLIElement> & { key: any };
  option: Type;
  state: SelectRenderOptionState;
}

export interface SelectCustomOption {
  key: string | number;
  title: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface SelectProps<Type, Multiple extends boolean>
  extends Partial<
    Omit<
      InputProps,
      | "children"
      | "value"
      | "type"
      | "defaultValue"
      | "onChange"
      | "autoComplete"
      | "multiLines"
      | "forceInline"
    >
  > {
  options: Type[];
  customOptions?: SelectCustomOption[];
  autoComplete?: boolean;
  multiple?: Multiple;
  value?: SelectValue<Type, Multiple>;
  defaultValue?: SelectValue<Type, Multiple>;
  open?: boolean;
  openOnFocus?: boolean | number;
  clearOnBlur?: boolean;
  clearOnEscape?: boolean;
  removeOnBackspace?: boolean;
  removeOnDelete?: boolean;
  closeOnSelect?: boolean;
  toggleIcon?: React.ReactNode | false;
  disablePortal?: boolean;
  
  /**
   * The icon to display in place of the default clear icon.
   * @default <ClearIcon fontSize="small" />
   */
  clearIcon?: React.ReactNode | false;
  /**
   * Override the default text for the *clear* icon button.
   *
   * For localization purposes, you can use the provided [translations](/material-ui/guides/localization/).
   * @default 'Clear'
   */
  clearText?: string;
  /**
   * Override the default text for the *close popup* icon button.
   *
   * For localization purposes, you can use the provided [translations](/material-ui/guides/localization/).
   * @default 'Close'
   */
  closeText?: string;

  openText?: string;
  /**
   * Force the visibility display of the popup icon.
   * @default 'auto'
   */
  forcePopupIcon?: true | false | "auto";
  disableClearable?: boolean;
  /**
   * If `true`, the input will take up the full width of its container.
   * @default false
   */
  fullWidth?: boolean;
  /**
   * The label to display when the tags are truncated (`limitTags`).
   *
   * @param {number} more The number of truncated tags.
   * @returns {ReactNode}
   * @default (more) => `+${more}`
   */
  getLimitTagsText?: (more: number) => React.ReactNode;

  loading?: boolean;
  loadingText?: React.ReactNode;
  noOptionsText?: React.ReactNode;
  
  icons?: SelectIcon[];
  
  menuOptions?: {
    offset?: number;
    padding?: number;
    sizePadding?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  onChange?: (value: SelectValue<Type, Multiple>) => void;
  onOpen?: (reason?: CloseOpenChangeReason) => void;
  onClose?: (reason?: CloseOpenChangeReason) => void;
  onInputChange?: (value: string) => void;
  optionKey: (option: Type) => string | number;
  optionLabel: (option: Type) => string;
  optionEqual?: (option: Type, value: Type) => boolean;
  optionMatch?: (option: Type, text: string) => boolean;
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: any },
    option: Type,
    state: SelectRenderOptionState,
  ) => JSX.Element | null;
  renderValue?: (type: Type, index: number) => JSX.Element | null;
  renderTag?: (
    props: React.HTMLAttributes<HTMLElement> & { key: any },
    option: Type,
  ) => JSX.Element | null;
  renderCustomOption?: (option: SelectCustomOption) => JSX.Element | null;
  isOptionDisabled?: (option: Type) => boolean;
  /**
   * Render the input.
   *
   * @param {object} params
   * @returns {ReactNode}
   */
  limitTags?: number;
  slots?: {
    panel?: React.JSXElementConstructor<React.HTMLAttributes<HTMLLIElement>>;
    list?: React.JSXElementConstructor<React.HTMLAttributes<HTMLLIElement>>;
    item?: React.JSXElementConstructor<React.HTMLAttributes<HTMLLIElement>>;
    header?: React.JSXElementConstructor<React.HTMLAttributes<HTMLElement>>;
    footer?: React.JSXElementConstructor<React.HTMLAttributes<HTMLElement>>;
  };
  slotProps?: {
    popper?: Partial<PopperContextProps>;
    panel?: Partial<Omit<React.HTMLAttributes<HTMLElement>, "children">>;
    list?: Partial<Omit<ListProps, "children">>;
    item?: React.HTMLAttributes<HTMLLIElement>;
    header?: React.HTMLAttributes<HTMLElement>;
    footer?: React.HTMLAttributes<HTMLElement>;
  };
}

function isEmpty(value: unknown) {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim().length === 0) ||
    (Array.isArray(value) && value.length === 0)
  );
}

export const Select = forwardRef(function Select<
  Type,
  Multiple extends boolean,
>(props: SelectProps<Type, Multiple>, ref: React.ForwardedRef<HTMLDivElement>) {
  const {
    id,
    autoFocus,
    autoComplete = true,
    multiple = false,
    options,
    customOptions,
    loadingText = 'Loading…',
    noOptionsText = 'No options',
    required,
    readOnly,
    disabled,
    error,
    openOnFocus = true,
    clearOnBlur,
    clearOnEscape,
    removeOnBackspace = true,
    removeOnDelete = true,
    closeOnSelect = true,
    menuOptions,
    optionKey,
    optionLabel,
    optionEqual: isOptionEqual,
    optionMatch,
    isOptionDisabled,
    onOpen,
    onClose,
    onChange,
    onInputChange,
    renderOption: renderOptionProp,
    renderCustomOption,
    renderValue,
    startAdornment,
    endAdornment,
    limitTags,
    disablePortal = false,
    clearIcon = <MaterialIcon icon="close" />,
    toggleIcon =  <MaterialIcon icon="keyboard_arrow_down" />,
    clearText,
    closeText,
    openText,
    forcePopupIcon,
    disableClearable = true,
    loading,
    renderTag,
    getLimitTagsText = (more) => `+${more}`,
    size = "md",
    focused,
    slots,
    slotProps,
    
    ...rest
  } = props;


  const ListSlot = slots?.list;
  const PanelSlot = slots?.panel;
  const ItemSlot = slots?.item;

  const [value, setValue] = useControlled({
    name: "Select",
    prop: "value",
    state: props.value,
    defaultState: props.defaultValue,
  });

  const [open, setOpenx] = useControlled<boolean>({
    name: "Select",
    prop: "open",
    state: props.open,
    defaultState: false,
  });

  const setOpen = useCallback((open:boolean)=> {
        setOpenx(open);
  }, [setOpenx]);

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const reasonRef = useRef<CloseOpenChangeReason | undefined>();
  const valueRef = useRef<SelectValue<Type, Multiple>>();
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const ignoreFocus = React.useRef(false);
  const firstFocus = React.useRef(true);

  const rootExRef = useRef<HTMLElement>(null);

  const rootRef = useRefs(ref, rootExRef as any);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const optionEqual = useCallback(
    (a: Type, b: Type) =>
      isOptionEqual?.(a, b) ?? (a === b || optionKey(a) === optionKey(b)),
    [isOptionEqual, optionKey],
  );

  const resetInput = useCallback(() => {
    const text = multiple || isEmpty(value) ? "" : optionLabel(value as Type);
    setInputValue(text);
    setSearchValue("");
    onInputChange?.("");
  }, [multiple, onInputChange, optionLabel, value]);

  const handleOpenChange = useCallback(
    (open: boolean, event?: Event, reason?: OpenChangeReason) => {
      reasonRef.current = reason;
      if (open) {
        handleOpen(reason)
      } else {
        handleClose(reason)
      }
      //setOpen(open);
    },
    [],
  );

  useEffect(() => {
    if (valueRef.current !== value) {
      resetInput();
      valueRef.current = value;
    }
  }, [resetInput, value]);

  const searchOptions = useCallback(
    (option: Type, text: string) =>
      optionLabel(option).toLowerCase().startsWith(text.toLowerCase()),
    [optionLabel],
  );

  const items = useMemo(() => {
    const matches = optionMatch ?? searchOptions;
    return options.filter((option) => matches(option, searchValue));
  }, [optionMatch, options, searchOptions, searchValue]);

  /*
  const selectedIndex = useMemo(() => {
    const item = Array.isArray(value) ? value[value.length - 1] : value;
    return open && item ? items?.findIndex((x) => optionEqual(x, item)) : -1;
  }, [items, open, optionEqual, value]);*/

  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  const listContentRef = React.useRef([
    ...(items?.map((child) => {
      return optionKey(child);
    }) ?? []),
  ]);

  React.useEffect(() => {
    if (!multiple && value) {
      setSelectedIndex(Math.min(-1, listContentRef.current.indexOf(optionKey(value as Type))));
    }
  }, [value]);

  const handleOpen = useCallback(
    (reason?: CloseOpenChangeReason) => {
      
      if (open || disabled || readOnly) return;
      console.log("handleOpen:", reason)
      reasonRef.current = reason || "click";
      setOpen(true);
      //onOpen?.();
    },
    [disabled, onOpen, open, readOnly, setOpen],
  );

  const handleClose = useCallback(
    (reason?: CloseOpenChangeReason) => {
      
      if (open) {
        console.log("handleClose:", reason)
        reasonRef.current = reason;
        setOpen(false);
      }
    },
    [onClose, open, setOpen],
  );

  useEffect(() => {
    if (open) {
      onOpen?.(reasonRef.current);
    } else {
      onClose?.(reasonRef.current);
    }
  }, [onClose, onOpen, open]);
  

  const acceptOption = useCallback(
    (value: SelectValue<Type, Multiple>, option: Type) => {
      const selected = [value].flat().filter(Boolean) as Type[];
      const found = selected.find((item) => optionEqual(item, option));
      if (found) {
        return value;
      }
      const selection = multiple ? [...selected, option] : option;
      return selection as SelectValue<Type, Multiple>;
    },
    [multiple, optionEqual],
  );

  const updateValue = useCallback(
    (option: Type | null, shouldCloseOnSelect = true) => {
      const next = option ? acceptOption(value, option) : null;
      const text = multiple ? "" : option ? optionLabel(option) : "";

      setActiveIndex(null);
      setInputValue(text);
      setSearchValue("");

      if (closeOnSelect && shouldCloseOnSelect) {
        handleClose("item-select");
      }

      inputRef.current?.focus();

      if (next !== value) {
        setValue(next);
        onChange?.(next);
      }
    },
    [
      acceptOption,
      closeOnSelect,
      handleClose,
      multiple,
      onChange,
      optionLabel,
      setValue,
      value,
    ],
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const text = event.target.value;
      setInputValue(text);
      setSearchValue(text);
      onInputChange?.(text);
      console.log("handleInputChange:", text);
      
      if (text) {
        handleOpen("focus");
        setActiveIndex(0);
      } else if (!multiple) {
        updateValue(null, false);
      }
    },
    [handleOpen, multiple, onInputChange, updateValue],
  );

  const handleInputKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape" && clearOnEscape) {
        resetInput();
      }
      if (event.key === "Enter" && activeIndex !== null) {
        event.preventDefault();
        const option = items[activeIndex];
        if (option) {
          updateValue(option);
        } else {
          // custom option
          const ref = listRef.current[activeIndex];
          if (ref) {
            handleClose("item-select");
            ref.click();
          }
        }
      }

      // delete the last item from the selection
      if (multiple && event.key === "Backspace") {
        if (inputValue) return;
        if (Array.isArray(value)) {
          const items = value.slice(0, value.length - 1);
          const next = items.length
            ? (items as SelectValue<Type, Multiple>)
            : null;
          setValue(next);
          onChange?.(next);
          return;
        }
      }
      
      if (
        canRemoveValue &&
        ((event.key === "Backspace" && removeOnBackspace) ||
        (event.key === "Delete" && removeOnDelete))
      ) {
        if (isEmpty(value)) return;
        if (multiple && inputValue) return;
        event.preventDefault();
        setValue(null);
        onChange?.(null);
      }

      if (open) return;
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        handleOpen("list-navigation");
      }
    },
    [
      activeIndex,
      clearOnEscape,
      handleClose,
      handleOpen,
      inputValue,
      items,
      multiple,
      onChange,
      open,
      removeOnBackspace,
      removeOnDelete,
      resetInput,
      setValue,
      updateValue,
      value,
    ],
  );

  const handleRootKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (autoComplete) return;
      if (event.target !== event.currentTarget) return;
      if (event.key === "Enter" && activeIndex !== null) {
        event.preventDefault();
        const option = items[activeIndex];
        if (option) {
          updateValue(option);
        }
      }
      if (open) return;
      if (
        event.key === "ArrowUp" ||
        event.key === "ArrowDown" ||
        event.key === " "
      ) {
        event.preventDefault();
        handleOpen("list-navigation");
      }
    },
    [activeIndex, autoComplete, handleOpen, items, open, updateValue],
  );

  const handleToggleClick = useCallback(() => {
    if (readOnly || disabled) return;
    if (open) {
      handleClose("outside-press");
    } else {
      handleOpen("click");
    }
  }, [disabled, handleClose, handleOpen, open, readOnly]);

  // Focus the input when interacting with the combobox
  const handleRootClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || event.isDefaultPrevented()) return;
      if (!event.currentTarget.contains(event.target as any)) {
        return;
      }

      const oldHasFocus = hasFocus;
      if (inputRef.current) inputRef.current.focus();
      if (openOnFocus) {
        //setFocusOnce(false);
        //setFocusNow(false);
      }
      if (readOnly) return;
      if (
        //selectOnFocus &&
        firstFocus.current &&
        //@ts-ignore
        (inputRef.current!.selectionEnd - inputRef.current!.selectionStart) === 0
      ) {
        inputRef.current!.select();
      }
  
      firstFocus.current = false;

      if (
        event.target === event.currentTarget ||
        event.target === inputRef.current ||
        event.target === contentRef.current ||
        contentRef.current?.contains(event.target as Node)
      ) {
        // keep open if input text is set
        if (autoComplete && inputRef.current?.value) {
           // handleOpen("click");
        } else {
         // handleToggleClick();
        }
      }
    },
    [
      autoComplete,
      disabled,
      handleOpen,
      handleToggleClick,
      openOnFocus,
      readOnly,
    ],
  );

  const [hasFocus, setHasFocus] = useState(false);
  const prevFocus = usePrevious(false);


  const hasOptions = options.length + (customOptions?.length ?? 0) > 0;


  useEffect(()=> {
    const isFocused = (document.activeElement === inputRef.current);
    setHasFocus(isFocused);
  }, [inputRef, open])

  
  const handleBlur = useCallback((event:React.FocusEvent) => {
    // Ignore the event when using the scrollbar with IE11
    if (isElementInListbox(panelRef) 
      || document.activeElement === inputRef.current) {
      console.log("handleBlur: ignore")
      inputRef.current?.focus();
      return;
    }
    console.log("handleBlur: to:", document.activeElement)
    setHasFocus(false);
    firstFocus.current = true;
    ignoreFocus.current = false;
    /*
    if (autoSelect && highlightedIndexRef.current !== -1 && popupOpen) {
      selectNewValue(event, filteredOptions[highlightedIndexRef.current], 'blur');
    } else if (autoSelect && freeSolo && inputValue !== '') {
      selectNewValue(event, inputValue, 'blur', 'freeSolo');
    } else*/
  }, [open]);

  const handleFocus = (event:any) => {
    setHasFocus(true);
    console.log("handleFocus: ignoreFocus:", ignoreFocus.current)
    if (openOnFocus && !ignoreFocus.current) {
      handleOpen("focus");
    }
  };

  useEffect(() => {
    if (!hasFocus) {
      const timer = setTimeout(() => {
        if (!hasFocus && open) {
          if (clearOnBlur && open) {
            //resetInputValue(event, value, 'blur');
            resetInput();
          }
      
          handleClose('blur');
        }
      }, 300);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [hasFocus, open]);

  const handleClearClick = (event:any) => {
    if (readOnly || disabled) return;

    ignoreFocus.current = true;
    setSearchValue('');

    if (onInputChange) {
      onInputChange('clear');
    }

    setValue( (multiple ? [] : null) as any);
  };

  /*
  const handleRootKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Tab" && focusOnTab) {
        setFocusOnTab(false);
        setFocusNow(true);
      }
    },
    [focusOnTab],
  );*/



  const canRemoveValue = (!readOnly && !disabled && inputValue.length == 0 && [value].flat().filter(Boolean).length > 0);
  const canClear = !clearIcon && canRemoveValue;
  
  
  // 5. set animation

  const contextValue = usePopperContext({
    open: !!open,
    handler: handleOpenChange,
    placement: "bottom-start",
    offset: menuOptions?.offset ?? 6,
    autoFlip: { padding: menuOptions?.padding ?? 10 },
    target: rootRef,
    strategy: 'fixed',
    autoSize: {
      padding: menuOptions?.sizePadding ?? 10,
      apply({ rects, availableHeight, elements }: any) {
        Object.assign(elements?.floating?.style, {
          width: `${rects?.reference?.width}px`,
        });
      },
    },
    
    interactions: (context) => [
      useRole(context, { role: "combobox" }),
      useDismiss(context),
      useListNavigation(context, {
        listRef,
        activeIndex,
        selectedIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
        allowEscape: true
      }),
      useTypeahead(context, {
        enabled: !autoComplete,
        listRef: listContentRef as any,
        activeIndex,
        selectedIndex,
        onMatch: open ? setActiveIndex : setSelectedIndex,
      }),
      useFocus(context, {
        enabled: inputValue.length > 0,
      })
    ],
    ...slotProps?.popper,
  });

  const { getItemProps, getReferenceProps, floating: {context} } = contextValue;
  
  const renderMultiple = useCallback(() => {
    const items = value as Type[] || null;
    const _hasFocus = hasFocus || open;

    if (!items ||  items.length == 0)
      return null;

    const maxTags =
      !_hasFocus && limitTags && items ? Math.min(items.length, limitTags) : -1;
    const itemToRender = maxTags > -1 ? items?.slice(0, maxTags) : items;

    if (itemToRender && itemToRender.length > 0) {
      const rem = items!.length - itemToRender.length;
      const chipSize = size === "lg" ? "md" : "sm";
      const chipProps = (item: Type, index: number) => ({
        key: optionKey?.(item) ?? `id-tag-${index}`,
        label: optionLabel(item),
        tapIndex: -1,
        variant: "outlined",
        size: chipSize,
        onClose:
          !readOnly && !disabled
            ? () =>{
              var newValue = items!.filter((i) => i != item) as SelectValue<
                      Type,
                      Multiple
                    >;
              
              setValue(newValue);
              onChange?.(newValue);
            }
            : undefined,
      });

      const renderTagNow = renderTag 
        ? renderTag 
        : (props:any, it:any) => <Chip {...props} />
        itemToRender 
      return (
        <>
          {itemToRender.map(chipProps).map((props, index) => 
            renderTagNow(props, itemToRender[index]))}

          {rem > 0 ? (
            <Chip
              size={chipSize}
              //variant="outlined"
              label={getLimitTagsText(rem)}
            />
          ) : null}
        </>
      );
    }
  }, [optionKey, optionLabel, renderTag, value, hasFocus, open]);

  const listboxAvailable = open && items.length > 0 && !readOnly;

  const notValid = useMemo(() => {
    if (error) return true;
    if (value) return false;
    if (required) return true;
    return false;
  }, [required, error, value]);

  const forceReadOnly = readOnly || disabled || !autoComplete;
  const buttonSize = size === "lg" ? "md" : "sm";
  const hasPopupIcon = toggleIcon !== false;
  const popupOpen = open;
  const hasItems = items && items.length > 0;

  // If you modify this, make sure to keep the `SelectOwnerState` type in sync.
  const ownerState = {
    ...props,
    disablePortal,
    optionLabel,
    hasPopupIcon,
    focused: focused && hasFocus,
    popupOpen,
    hasItems,
    loading,
    size,
  };
  const SlotListItem = slots?.item;

  const defaultRenderOption = (props: any, option: any) => {
    // Need to clearly apply key because of https://github.com/vercel/next.js/issues/55642
    const { key, ...otherProps } = props;
    return (
      <SelectOption  key={key} selected={otherProps['aria-selected']} {...otherProps}>
        {optionLabel(option)}
      </SelectOption>
    );
  };

  const getOptionProps = (option:any, index:number) => {
    const selected = selectedIndex === index;
    const bounded = index < listRef.current.length;
    const disabled = bounded && isOptionDisabled ? isOptionDisabled(option) : false;
    
    const key = (bounded ? optionKey?.(option) : undefined) ?? `${id}-option-${index}`;

    return {
      ...(slotProps?.item),
      key: key,
      tabIndex: -1,
      role: "option",
      id: `${id}-option-${index}`,
      ref: (node:any) => (listRef.current[index] = node),
      //onMouseMove: handleOptionMouseMove,
      //onClick: handleOptionClick,
      //onTouchStart: handleOptionTouchStart,
      active: index === activeIndex,
      "data-option-index": index,
      "aria-active": activeIndex === index,
      "aria-disabled": disabled,
      "aria-selected": selected,
      ...(slotProps?.item),
      ...(getItemProps!({
        key: key,
        disabled,
        selected,
        onClick(event:any) {
          updateValue(option);
          slotProps?.item?.onClick?.(event);
        },
        onKeyDown(event: React.KeyboardEvent) {

          slotProps?.item?.onKeyDown?.(event as any);

          if (event.key === "Enter" || (event.key === " " && !context.dataRef.current.typing)) {
            event.preventDefault();
            updateValue(option, true);
          }
        }
      }) as Partial<React.HTMLAttributes<HTMLLIElement>>),
    };
  };
  const renderOption = renderOptionProp || defaultRenderOption;

  const renderListOption = (option: any, index: number) => {
    const props = getOptionProps(option, index);

    return renderOption(props, option, {
      selected: props["aria-selected"] as boolean,
      index,
      inputValue,
    });
  };

  {/*customOptions?.map(renderCustomOption)*/}
  
  const hasCustoms = customOptions && customOptions.length > 0;
  const Header = slots?.header;

   
  return (
    <>
      <SelectInputRoot
        {...rest}
        forceInline={multiple}
        readOnly={forceReadOnly}
        disabled={disabled}
        focused={hasFocus || open || focused}
        error={notValid}
        size={size}
        value={inputValue}
        autoFocus={autoComplete}
        type="text"
        aria-disabled={disabled ? true : undefined}
        aria-readonly={readOnly ? true : undefined}
        aria-invalid={notValid ? true : undefined}
        // if open then this is handled imperatively so don't let react override
        // only have an opinion about this when closed
        aria-activedescendant={popupOpen ? "" : undefined}
        aria-autocomplete={autoComplete ? "both" : "list"}
        aria-controls={listboxAvailable ? `${id}-listbox` : undefined}
        aria-expanded={listboxAvailable}
        // Disable browser's suggestion that might overlap with the popup.
        // Handle autocomplete but not autofill.
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        role="combobox"
        ownerState={ownerState}
        rootProps= {getReferenceProps({
          ref: rootRef,
          onClick: handleRootClick,
          //onKeyUp: handleRootKeyUp,
          onKeyDown: handleRootKeyDown,
          className: 'flex'
        })}
        ref={inputRef}
        tabIndex={autoComplete || disabled ? undefined : 0}
        onChange={!forceReadOnly ? handleInputChange : undefined}
        onKeyDown={!forceReadOnly ? handleInputKeyDown : undefined}
        onFocus={!forceReadOnly ? handleFocus : undefined}
        onBlur={!forceReadOnly ? handleBlur : undefined}
        className='grow'
        startAdornment={
          (React.isValidElement(startAdornment) || (multiple && items && items.length)) 
            ? (
              <>
                {startAdornment}
                {multiple ? renderMultiple() : null}
              </>
            ) 
            : null
        }
        endAdornment={
          <> 
            {canClear ? (
              <SelectClearIndicator
                onClick={handleClearClick}
                aria-label={clearText}
                title={clearText}
                size={buttonSize}
                ownerState={ownerState}
                tabIndex={-1}
                type="button"
              >
                {clearIcon}
              </SelectClearIndicator>
            ) : null}

            {endAdornment}

            {toggleIcon ? (
              <SelectPopupIndicator
                onClick={forceReadOnly ? undefined : handleToggleClick}
                disabled={disabled}
                aria-label={popupOpen ? closeText : openText}
                title={popupOpen ? closeText : openText}
                size={buttonSize}
                ownerState={ownerState}
                //tabIndex={-1}
                type="button"
              >
                {toggleIcon}
              </SelectPopupIndicator>
            ) : null}
          </>
        }
      />
      {open  && (
        <PopperPortal
          disablePortal={disablePortal}
          keepMounted
          context={contextValue}
          renderContent={false}
          focusProps={{
            //key: hasDropdownOpen ? "opened" : "closed",
            initialFocus: -1,
            visuallyHiddenDismiss: true,
            returnFocus: true,
      
          }}
        >
          <PopperContent animation={animation} >
            <PanelSelectRoot 
              as={PanelSlot} 
              elevation={2} 
              ownerState={ownerState} 
              className="text-body-tertiary border border-current"
              {...slotProps?.panel}
              ref={panelRef}
              >

              { slotProps?.header && <HeaderRoot as={Header} {...slotProps?.header} ownerState={ownerState}/>}
              
              {loading  
                ? <SelectLoading>{loadingText}</SelectLoading>
                : (!hasItems)
                ? <SelectNoOptions>{noOptionsText}</SelectNoOptions>  
                : <ListSelectRoot 
                      as={ListSlot} 
                      ownerState={ownerState} 
                      hover
                      select
                      active
                      role="listbox"
                      ref={contentRef}
                      itemStyle={{
                        hover: 'cursor-pointer select-none',
                        active: 'active:bg-primary active:text-primary-50',
                        disabled: '',
                        className: size === 'lg' ? 'px-3 py-3' : 'px-3 py-2',
                      }}
                      {...slotProps?.list}
                      className={`text-item max-h-96 overflow-auto ${slotProps?.list?.className}`}
                      >
                    {items.map(renderListOption)}
                  </ListSelectRoot>
              }
              {slotProps?.footer && <FooterRoot {...slotProps?.footer} ownerState={ownerState}/>}
            </PanelSelectRoot>
          </PopperContent>
        </PopperPortal>)
      }
    </>
  );
}) as unknown as <Type, Multiple extends boolean>(
  props: SelectProps<Type, Multiple> & {
    ref?: React.Ref<HTMLDivElement>;
  },
) => React.ReactNode;


