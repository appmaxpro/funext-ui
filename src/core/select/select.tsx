// @ts-nocheck
/** @jsxImportSource @emotion/react */
import { css} from '@emotion/react'
import {
  FloatingFocusManager,
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  size,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useListNavigation,
  useRole,
} from "@floating-ui/react";
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SxProps } from '@mui/system';
import { OverridableStringUnion } from '@mui/types';

import { MaterialIcon } from "../../icons/material-icon";
import { Badge } from "../badge";
import { clsx } from "../clsx";
import { useControlled, useRefs } from "../hooks";
import { Chevron } from "../common";

import styles from "./select.module.scss";
import {styled, useTheme, type Theme, } from '../../mui/styles';
import { MenuItem, Divider, Input } from "../../mui";
import { MenuItemProps } from '../menu';
//console.log("Select styles:", styles);

export type SelectValue<Type, Multiple extends boolean> =
  | (Multiple extends true ? Type[] : Type)
  | null
  | undefined;

export type SelectIcon = {
  key?: string | number;
  icon: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
};

export interface SelectOptionProps<Type> {
  option: Type;
  active?: boolean;
}

export interface SelectCustomOption {
  key: string | number;
  title: React.ReactNode;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface SelectProps<Type, Multiple extends boolean> {
  id?: string;
  className?: string;
  placeholder?: string;
  options: Type[];
  autoFocus?: boolean;
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
  toggleIcon?: SelectIcon | false;
  startAdornment: React.ReactNode;
  endAdornment: React.ReactNode;

  /**
   * The icon to display in place of the default clear icon.
   * @default <ClearIcon fontSize="small" />
   */
  clearIcon?: React.ReactNode;
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
  /**
   * Force the visibility display of the popup icon.
   * @default 'auto'
   */
  forcePopupIcon?: true | false | 'auto';
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
  noOptionsText?: React.ReactNode;
  size?: OverridableStringUnion<'small' | 'medium', AutocompletePropsSizeOverrides>;

  icons?: SelectIcon[];
  required?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  bordered?: boolean;
  rounded?: boolean;
  customOptions?: SelectCustomOption[];
  menuOptions?: {
    offset?: number;
    padding?: number;
    maxWidth?: number;
    maxHeight?: number;
  };
  onChange?: (value: SelectValue<Type, Multiple>) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onInputChange?: (value: string) => void;
  optionKey: (option: Type) => string | number;
  optionLabel: (option: Type) => string;
  optionEqual?: (option: Type, value: Type) => boolean;
  optionMatch?: (option: Type, text: string) => boolean;
  renderOption?: (props: SelectOptionProps<Type>) => JSX.Element | null;
  renderValue?: (props: SelectOptionProps<Type>) => JSX.Element | null;
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
    placeholder,
    autoFocus,
    autoComplete = true,
    multiple,
    className,
    options,
    customOptions,
    icons = [],
    required,
    readOnly,
    disabled,
    invalid,
    openOnFocus,
    clearOnBlur,
    clearOnEscape,
    removeOnBackspace = true,
    removeOnDelete = true,
    closeOnSelect = true,
    bordered=true, 
    rounded=true,
    menuOptions,
    optionKey,
    optionLabel,
    optionEqual: isOptionEqual,
    optionMatch,
    onOpen,
    onClose,
    onChange,
    onInputChange,
    renderOption,
    renderValue,
  } = props;

  const [value, setValue] = useControlled({
    name: "Select",
    prop: "value",
    state: props.value,
    defaultState: props.defaultValue,
  });

  const [open, setOpen] = useControlled({
    name: "Select",
    prop: "open",
    state: props.open,
  });

  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const valueRef = useRef<SelectValue<Type, Multiple>>();

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

  const selectedIndex = useMemo(() => {
    const item = Array.isArray(value) ? value[value.length - 1] : value;
    return open && item ? items?.findIndex((x) => optionEqual(x, item)) : -1;
  }, [items, open, optionEqual, value]);

  const handleOpen = useCallback(() => {
    if (open || disabled || readOnly) return;
    setOpen(true);
    onOpen?.();
  }, [disabled, onOpen, open, readOnly, setOpen]);

  const handleClose = useCallback(() => {
    if (open) {
      setOpen(false);
      onClose?.();
    }
  }, [onClose, open, setOpen]);

  useEffect(() => {
    if (open) {
      onOpen?.();
    } else {
      onClose?.();
    }
  }, [onClose, onOpen, open]);

  const { refs, floatingStyles, context } = useFloating<HTMLDivElement>({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    placement: "bottom-start",
    strategy: "fixed",
    middleware: [
      offset(menuOptions?.offset ?? 6),
      flip({ padding: menuOptions?.padding ?? 10 }),
      size({
        apply({ rects, availableHeight, elements }) {
          const height = menuOptions?.maxHeight ?? availableHeight;
          const minWidth = rects.reference.width;
          const maxHeight = Math.min(350, height);
          const maxWidth = menuOptions?.maxWidth ?? minWidth;
          elements.floating.style.minWidth = `${minWidth}px`;
          elements.floating.style.maxWidth = `${maxWidth}px`;
          elements.floating.style.maxHeight = `${maxHeight}px`;
        },
        padding: 10,
      }),
    ],
  });

  const role = useRole(context, { role: "listbox" });
  const dismiss = useDismiss(context);
  const listRef = useRef<Array<HTMLElement | null>>([]);
  const listNav = useListNavigation(context, {
    listRef,
    activeIndex,
    selectedIndex,
    onNavigate: setActiveIndex,
    virtual: true,
    loop: true,
  });

  const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions(
    [role, dismiss, listNav],
  );

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
        handleClose();
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
      if (text) {
        handleOpen();
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
            handleClose();
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
        (event.key === "Backspace" && removeOnBackspace) ||
        (event.key === "Delete" && removeOnDelete)
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
        handleOpen();
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
        handleOpen();
      }
    },
    [activeIndex, autoComplete, handleOpen, items, open, updateValue],
  );

  const rootRef = useRefs(ref, refs.setReference);
  const inputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleToggleClick = useCallback(() => {
    if (readOnly || disabled) return;
    if (open) {
      handleClose();
    } else {
      handleOpen();
    }
  }, [disabled, handleClose, handleOpen, open, readOnly]);

  const handleRootClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || event.isDefaultPrevented()) return;
      if (inputRef.current) inputRef.current.focus();
      if (openOnFocus) {
        setFocusOnce(false);
        setFocusNow(false);
      }
      if (readOnly) return;
      if (
        event.target === event.currentTarget ||
        event.target === inputRef.current ||
        event.target === contentRef.current ||
        contentRef.current?.contains(event.target as Node)
      ) {
        // keep open if input text is set
        if (autoComplete && inputRef.current?.value) {
          handleOpen();
        } else {
          handleToggleClick();
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

  const [focusOnTab, setFocusOnTab] = useState(false);
  const [focusOnce, setFocusOnce] = useState(true);
  const [focusNow, setFocusNow] = useState(false);

  const hasOptions = options.length + (customOptions?.length ?? 0) > 0;
  const hasDropdownOpen = open && hasOptions;

  const focusDelay = useMemo(
    () => (typeof openOnFocus === "number" ? openOnFocus : 300),
    [openOnFocus],
  );

  const handleBlur = useCallback(() => {
    setFocusNow(false);
    setFocusOnTab(Boolean(openOnFocus));
    if (clearOnBlur && !open) {
      resetInput();
    }
  }, [clearOnBlur, open, openOnFocus, resetInput]);

  const handleFocus = useCallback(() => {
    if (openOnFocus && focusOnce) {
      setFocusNow(true);
    }
  }, [focusOnce, openOnFocus]);

  const handleRootKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Tab" && focusOnTab) {
        setFocusOnTab(false);
        setFocusNow(true);
      }
    },
    [focusOnTab],
  );

  useEffect(() => {
    if (focusNow) {
      const timer = setTimeout(() => {
        setFocusOnce(false);
        setFocusNow(false);
        handleOpen();
      }, focusDelay);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [focusDelay, focusNow, handleOpen]);

  const handleClearClick = useCallback(() => {
    if (readOnly || disabled) return;
    updateValue(null);
  }, [disabled, readOnly, updateValue]);

  const toggleIcon = useMemo(() => {
    if (props.toggleIcon === false) return false;
    return {
      icon: (
        <Chevron direction="down"/>
      ),
      onClick: handleToggleClick,
      ...props.toggleIcon,
    };
  }, [props.toggleIcon, hasDropdownOpen, handleToggleClick]);

  const clearIcon = useMemo(() => {
    if (props.clearIcon === false) return false;
    return {
      icon: <MaterialIcon icon="close" fontSize="1rem" />,
      onClick: handleClearClick,
      ...props.clearIcon,
    };
  }, [props.clearIcon, handleClearClick]);

  

  const renderMultiple = useCallback(() => {
    const items = value as Type[] | null;
    return items?.map((item) => {
      return (
        <div key={optionKey(item)} 
            css={{
                  display: 'flex',
                  overflow: 'hidden',
                  'alignItems': 'center'
              }}>
          {!!renderValue && renderValue({ option: item })}
          {!!renderValue || (
            <Badge
              bg="secondary"
              key={optionKey(item)}
              css={{
                padding: '0.375rem',
                overflow: 'hidden',
                'textOverflow': 'ellipsis'
            }}>
              {optionLabel(item)}
            </Badge>
          )}
        </div>
      );
    });
  }, [optionKey, optionLabel, renderValue, value]);

  const theme = useTheme();

  const renderSelector = useCallback(() => {
    const shouldShowEmptyBox = readOnly && isEmpty(value);
    if (autoComplete || shouldShowEmptyBox) {
      return (
        <input
          id={id}
          ref={inputRef}
          type="text"
          autoFocus={autoFocus}
          value={inputValue ?? ""}
          readOnly={readOnly || disabled}
          placeholder={
            inputValue || (multiple && !isEmpty(value))
              ? undefined
              : placeholder
          }
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          css={css`
            flex: 1;
            min-width: 25%;
            padding: 0;
            border: none;
            outline: none;
            appearance: none;
            background-color: transparent;
            color: inherit;
            &:placeholder-shown {
              text-overflow: ellipsis;
            }
            &::placeholder {
              color: ${theme.palette.text.secondary};
            }
            &[disabled] {
              background: ${theme.palette.background.default};
              color: ${theme.palette.text.disabled};
              cursor: not-allowed;
              &::placeholder {
                color: ${theme.palette.text.disabled};
              }
            }
          `}
        />
      );
    }
    
    if (multiple) return null;
    if (value) {
      return (
        <div className={styles.value}>
          {!!renderValue && renderValue({ option: value as Type })}
          {!!renderValue || optionLabel(value as Type)}
        </div>
      );
    }
    if (placeholder) {
      return <span className={styles.placeholder}>{placeholder}</span>;
    }
    return null;
  }, [
    autoComplete,
    multiple,
    value,
    placeholder,
    id,
    autoFocus,
    inputValue,
    readOnly,
    disabled,
    handleInputChange,
    handleInputKeyDown,
    handleFocus,
    handleBlur,
    renderValue,
    optionLabel,
  ]);

  const canClear =
    clearIcon &&
    [value].flat().filter(Boolean).length > 0 &&
    !readOnly &&
    !disabled;

  const notValid = useMemo(() => {
    if (invalid) return true;
    if (value) return false;
    if (required) return true;
    return false;
  }, [required, invalid, value]);




  return (
    <> 

      <StyledSelect theme={theme}
        className={clsx(className, {
          'open': open,
          'required': required,
          'readonly': readOnly,
          'bordered': bordered,
          'rounded': rounded,
        })}
        readOnly={readOnly}
        invalid={notValid}
        autoFocus={autoComplete ? undefined : autoFocus}
        aria-disabled={disabled ? true : undefined}
        aria-readonly={readOnly ? true : undefined}
        aria-invalid={notValid ? true : undefined}
        {...getReferenceProps({
          ref: rootRef,
          tabIndex: autoComplete || disabled ? undefined : 0,
          onClick: handleRootClick,
          onKeyDown: handleRootKeyDown,
          onKeyUp: handleRootKeyUp,
          onFocus: autoComplete ? undefined : handleFocus,
          onBlur: autoComplete ? undefined : handleBlur,
        })}
      >
        <Input ref={inputRef}
          { ...({
              InputProps: {
                ref: inputRef,

              }
           })
          }
        >
          {multiple && renderMultiple()}
          {renderSelector()}
        </Input>
        <div tabIndex={-1} className={styles.actions} onClick={handleClose}>
          {canClear && (
            <div
              className={clsx(styles.action, styles.clearIcon)}
              onClick={clearIcon.onClick}
            >
              {clearIcon.icon}
            </div>
          )}
          {icons.map((icon, index) => (
            <div
              key={icon.key ?? index}
              data-index={index}
              className={clsx(styles.action)}
              onClick={icon.onClick}
            >
              {icon.icon}
            </div>
          ))}
          {toggleIcon && (
            <div
              className={clsx(styles.action, styles.toggleIcon)}
              onClick={toggleIcon.onClick}
            >
              {toggleIcon.icon}
            </div>
          )}
        </div>
      </StyledSelect>
      {open && (
        <FloatingPortal id={styles['drop-down-floating-portal']}>
          <FloatingFocusManager
            key={hasDropdownOpen ? "opened" : "closed"}
            context={context}
            initialFocus={-1}
            visuallyHiddenDismiss
          >
            <div
              {...getFloatingProps({
                ref: refs.setFloating,
                className: styles.list,
                style: floatingStyles,
              })}
            >
              {items.map((item, index) => (
                /* tslint:disable-next-line */
                <MenuItem
                  {...getItemProps({
                    key: optionKey(item),
                    ref(node) {
                      listRef.current[index] = node;
                    },
                    onClick() {
                      updateValue(item);
                    },
                  }) as Partial<MenuItemProps>
                 }
                  selected={!multiple && selectedIndex === index}
                  role="option"
                  active={activeIndex === index}
                  className={clsx({ 
                    'active': activeIndex === index
                  })}
                >
                  {!!renderOption || optionLabel(item)}
                  {!!renderOption &&
                    renderOption({
                      option: item,
                      active: activeIndex === index,
                    })}
                </MenuItem>
              ))}
              {customOptions?.map((item, index) => (
                /* tslint:disable-next-line */
                <MenuItem
                  {...getItemProps({
                    ref(node) {
                      listRef.current[items.length + index] = node;
                    },
                    onClick(event) {
                      if (item.disabled) return;
                      handleClose();
                      setActiveIndex(null);
                      item.onClick?.(event);
                    },
                  })}
                  key={item.key}
                  disabled={item.disabled}
                  aria-disabled={item.disabled}
                  active={
                    !item.disabled && activeIndex === items.length + index
                  }
                  className={clsx({ 
                    'disabled': item.disabled,
                    'active': !item.disabled && activeIndex === items.length + index
                  })}
                >
                  {item.title}
                </MenuItem>
              ))}
            </div>
          </FloatingFocusManager>
        </FloatingPortal>
      )}
    </>
  );
}) as unknown as <Type, Multiple extends boolean>(
  props: SelectProps<Type, Multiple> & {
    ref?: React.Ref<HTMLDivElement>;
  },
) => React.ReactNode;

type SelectItemProps = React.HTMLProps<HTMLDivElement> & {
  active: boolean;
  selected?: boolean;
};

const SelectItem = forwardRef<HTMLDivElement, SelectItemProps>(
  function SelectOption(props, ref) {
    const { active, selected, children, className, ...rest } = props;
    const id = useId();
    return (
      <div
        ref={ref}
        role="option"
        id={id}
        aria-selected={active}
        className={clsx(className, styles.option, {
          [styles.active]: active,
          [styles.selected]: selected,
        })}
        {...rest}
      >
        {children}
      </div>
    );
  },
);

interface InputStylesProps {
  theme: Theme;
  monospace?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
}

const StyledSelect = styled('div')(({theme, ...p}: InputStylesProps) => css`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: ${ theme.palette.background.paper};
  /*border: 1px solid ${ theme.palette.divider};*/
  color: ${theme.palette.text.primary};
  padding: var(--ax-input-padding);
  outline: none;
  font-size: 1rem;
  line-height: 1.5;
  transition: border 0.1s, box-shadow 0.1s;
  ${p.readOnly ? 'cursor: default;' : ''}
  &.bordered{
    outline: none;
    border: 1px solid ${theme.palette.text.primary};
    box-shadow: ${theme.shadows[1]};
    transition: border 0.15s ease 0s, box-shadow 0.3s ease 0.15s;
    &:focus-within{
      outline: none;
      border-color: ${theme.palette.primary.main};
      box-shadow: ${theme.palette.primary.main} 0 0 0 1px;
    }
    &:invalid,
    &.invalid {
      border-color: ${theme.palette.error.main};
      &:focus,
      &:focus-within {
        border-color: ${theme.palette.error.main};
        box-shadow:  ${theme.shadows[1]};
      }
    }
  }
  &.rounded{
    border-radius: ${theme.shape.borderRadius}px;
  }
  & ::placeholder {
    color: ${theme.palette.text.disabled};
  }
  &[aria-disabled=true] {
    background-color: ${theme.palette.action.disabled};
    user-select: none;
    cursor: not-allowed;
    &::placeholder {
      color: ${theme.palette.text.disabled};
    }
  }
`);

