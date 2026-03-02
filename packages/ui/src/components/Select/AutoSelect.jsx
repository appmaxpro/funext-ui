"use client";
import * as React from "react";
import useAutocomplete from "../useAutocomplete/useAutocomplete";
import { createFilterOptions } from "../useAutocomplete/useAutocomplete";

import Popper from "../Popper";
import { ListSubheader } from "../List";
import Panel from "../Panel";
import { IconButton } from "../IconButton";
import Chip from "../Chip";
import Input from "../Input";
import {
  styled,
  useTheme,
  useMuxDefaultProps,
  composeClasses,
  useSlot,
  alpha,
  clsx,
  ThemeProvider,
  memoTheme,
  useTailwindTheme,
  twx
} from "../../styles";
import autoSelectClasses, {
  getAutoSelectUtilityClass,
} from "./autoSelectClasses";
import Close from "../internal/svg-icons/Close";
import { ChevronDown } from "../internal/svg-icons/chevron";

const useUtilityClasses = (ownerState) => {
  const {
    classes,
    disablePortal,
    expanded,
    focused,
    fullWidth,
    hasClearIcon,
    hasPopupIcon,
    inputFocused,
    popupOpen,
    size,
  } = ownerState;

  const slots = {
    root: [
      "root",
      expanded && "expanded",
      focused && "focused",
      fullWidth && "fullWidth",
      hasClearIcon && "hasClearIcon",
      hasPopupIcon && "hasPopupIcon",
      size,
    ],
    inputRoot: ["inputRoot"],
    input: ["input", inputFocused && "inputFocused"],
    tag: ["tag", `tag-size-${size}`],
    suffix: ["suffix"],
    extraAdornment: ["extraAdornment"],
    clearIndicator: ["clearIndicator"],
    popupIndicator: ["popupIndicator", popupOpen && "popupIndicatorOpen"],
    popper: ["popper", disablePortal && "popperDisablePortal"],
    panel: ["panel"],
    listbox: ["listbox"],
    loading: ["loading"],
    noOptions: ["noOptions"],
    option: ["option"],
    groupLabel: ["groupLabel"],
    groupUl: ["groupUl"],
  };

  return composeClasses(slots, getAutoSelectUtilityClass, classes);
};

const animation = {
  unmount: {
    opacity: 0,
    transformOrigin: "top",
    transform: "scale(0.95)",
    transition: { duration: 0.2, times: [0.4, 0, 0.2, 1] },
  },
  mount: {
    opacity: 1,
    transformOrigin: "top",
    transform: "scale(1)",
    transition: { duration: 0.2, times: [0.4, 0, 0.2, 1] },
  },
};

const AutoSelectRoot = styled("div", {
  name: "MuxAutoSelect",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { fullWidth, hasClearIcon, hasPopupIcon, inputFocused, size } =
      ownerState;

    return [
      { [`& .${autocompleteClasses.tag}`]: styles.tag },
      {
        [`& .${autocompleteClasses.tag}`]: styles[`tagSize${capitalize(size)}`],
      },
      { [`& .${autocompleteClasses.inputRoot}`]: styles.inputRoot },
      { [`& .${autocompleteClasses.input}`]: styles.input },
      {
        [`& .${autocompleteClasses.input}`]:
          inputFocused && styles.inputFocused,
      },
      styles.root,
      fullWidth && styles.fullWidth,
      hasPopupIcon && styles.hasPopupIcon,
      hasClearIcon && styles.hasClearIcon,
    ];
  },
})(
  memoTheme(({ theme }) => ({
  [`&.${autoSelectClasses.focused} .${autoSelectClasses.clearIndicator}`]: {
    visibility: "visible",
  },
  /* Avoid double tap issue on iOS */
  "@media (pointer: fine)": {
    [`&:hover .${autoSelectClasses.clearIndicator}`]: {
      visibility: "visible",
    },
  },
  [`& .${autoSelectClasses.tag}`]: {
    margin: 1,
    maxWidth: "calc(100% - 6px)",
    [`&.${autoSelectClasses.focusVisible}`]: {
      opacity: .8,
      //backgroundColor: `rgba(0, 0, 0, ${})`,
    }
  },
  [`& .${autoSelectClasses.input}`]: {
    flexGrow: 1,
    textOverflow: "ellipsis",
    opacity: 0,
  },
  variants: [
    {
      props: { fullWidth: true },
      style: { width: "100%" },
    },
    {
      props: { inputFocused: true },
      style: {
        [`& .${autoSelectClasses.input}`]: {
          opacity: 1,
        },
      },
    },
  ],
})));

const ExtraAdornment = styled("div", {
  name: "MuxAutoSelect",
  slot: "ExtraAdornment",
  overridesResolver: (props, styles) => styles.extraIndicator,
})({
  marginRight: 2,
  display: "inline-flex",
  flexWrap: "nowrap",
  alignItems: "center",
});

const AutoSelectClearIndicator = styled(IconButton, {
  name: "MuxAutoSelect",
  slot: "ClearIndicator",
  overridesResolver: (props, styles) => styles.clearIndicator,
})({
  padding: 4,
  visibility: "hidden",
  scale: 0.85,
});

const AutoSelectPopupIndicator = styled(IconButton, {
  name: "MuxAutoSelect",
  slot: "PopupIndicator",
  overridesResolver: ({ ownerState }, styles) => ({
    ...styles.popupIndicator,
    ...(ownerState.popupOpen && styles.popupIndicatorOpen),
  }),
})({
  padding: 4,
  variants: [
    {
      props: { popupOpen: true },
      style: {
        transform: "rotate(180deg)",
      },
    },
    {
      props: { readOnly: true },
      style: {
        pointerEvents: "none",
      },
    },
  ],
});

const AutoSelectPanel = styled(Panel, {
  name: "MuxAutoSelect",
  slot: "Panel",
  overridesResolver: (props, styles) => styles.panel,
})(
  memoTheme(({ theme }) => ({
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "100%",
  })),
);

const AutoSelectLoading = styled("div", {
  name: "MuxAutoSelect",
  slot: "Loading",
  overridesResolver: (props, styles) => styles.loading,
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    padding: "14px 16px",
  })),
);

const AutoSelectNoOptions = styled("div", {
  name: "MuxAutoSelect",
  slot: "NoOptions",
  overridesResolver: (props, styles) => styles.noOptions,
})(
  memoTheme(({ theme }) => ({
    color: (theme.vars || theme).palette.text.secondary,
    padding: "14px 16px",
  })),
);

const AutoSelectMenuHeader = styled("div", {
  name: "MuxAutoSelect",
  slot: "MenuHeader",
  overridesResolver: (props, styles) => styles.menuHeader,
})({
  display: "flex",
  width: "100%",
});

const AutoSelectMenuFooter = styled("div", {
  name: "MuxAutoSelect",
  slot: "MenuFooter",
  overridesResolver: (props, styles) => styles.menuFooter,
})({
  display: "flex",

  width: "100%",
});

const AutoSelectListbox = styled("ul", {
  name: "MuxAutoSelect",
  slot: "Listbox",
  overridesResolver: (props, styles) => styles.listbox,
})(
  memoTheme(({ theme }) =>
    !theme?.palette
      ? {}
      : {
          listStyle: "none",
          margin: 0,
          padding: "8px 0",
          maxHeight: "40vh",
          overflow: "auto",
          position: "relative",

          [`& .${autoSelectClasses.option}`]: {
            minHeight: 48,
            display: "flex",
            overflow: "hidden",
            justifyContent: "flex-start",
            alignItems: "center",
            cursor: "pointer",
            boxSizing: "border-box",
            outline: "0",
            WebkitTapHighlightColor: "transparent",
            paddingTop: 8,
            paddingBottom: 8,
            [theme.breakpoints.up("sm")]: {
              minHeight: "auto",
            },
            [`&.${autoSelectClasses.focused}`]: {
              //backgroundColor: (theme.vars || theme).palette.action.hover,
              backgroundColor: "rgb(var(--primary) / 30%)",
              // Reset on touch devices, it doesn't add specificity
              "@media (hover: none)": {
                backgroundColor: "transparent",
              },
            },
            '&[aria-disabled="true"]': {
              opacity: (theme.vars || theme).palette.action.disabledOpacity,
              pointerEvents: "none",
            },
            [`&.${autoSelectClasses.focusVisible}`]: {
              //backgroundColor: (theme.vars || theme).palette.action.focus,
              backgroundColor: twx.alpha('accent', '50%'),
            },
            '&[aria-selected="true"]': {
              backgroundColor: theme.vars
                ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
                : alpha(
                    theme.palette.primary.main,
                    theme.palette.action.selectedOpacity,
                  ),
              [`&.${autoSelectClasses.focused}`]: {
                backgroundColor: theme.vars
                  ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + .04))`
                  : alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity + 0.04,
                    ),
                // Reset on touch devices, it doesn't add specificity
                "@media (hover: none)": {
                  backgroundColor: (theme.vars || theme).palette.action
                    .selected,
                },
              },
              [`&.${autoSelectClasses.focusVisible}`]: {
                backgroundColor: theme.vars
                  ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.focusOpacity}))`
                  : alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity +
                        theme.palette.action.focusOpacity,
                    ),
              },
            },
          },
        },
  ),
);

const AutoSelectGroupLabel = styled(ListSubheader, {
  name: "MuxAutoSelect",
  slot: "GroupLabel",
  overridesResolver: (props, styles) => styles.groupLabel,
})(
  memoTheme(({ theme }) => ({
    backgroundColor: (theme.vars || theme).palette.background.panel,
    top: -8,
  })),
);

const AutoSelectGroupUl = styled("ul", {
  name: "MuxAutoSelect",
  slot: "GroupUl",
  overridesResolver: (props, styles) => styles.groupUl,
})({
  padding: 0,
  [`& .${autoSelectClasses.option}`]: {
    paddingLeft: 24,
  },
});

export { createFilterOptions };

export const AutoSelect = React.forwardRef(function AutoSelect(inProps, ref) {
  const theme = useTheme();
  //console.log("AutoSelect::inProps-variant:", inProps.variant)
  const props = useMuxDefaultProps({
    props: { ...inProps, theme },
    name: "MuxAuoSelect",
  });
  const {
    input: { defaultProps },
  } = useTailwindTheme();

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    variant = defaultProps.variant,
    size = defaultProps.size,
    freeSolo = false,
    autoComplete = false,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    clearOnSelect,
    className,
    clearIcon = <Close/>,
    clearOnBlur = freeSolo,
    selectOnFocus = !freeSolo,
    clearOnEscape = false,
    clearText = "Clear",
    closeText = "Close",
    defaultValue = props.multiple ? [] : null,
    disableClearable = clearIcon === false,
    disableCloseOnSelect,
    disabledItemsFocusable,
    disableListWrap,
    disabled = false,
    disableBorder,
    disablePortal = false,
    filterOptions,
    filterSelectedOptions = false,
    forcePopupIcon = "auto",

    fullWidth = false,
    getLimitTagsText = (more) => `+${more}`,
    getOptionDisabled,
    getOptionKey,
    optionEquals,
    optionMatches,
    getOptionLabel: getOptionLabelProp,
    groupBy,
    handleHomeEndKeys = !freeSolo,
    id: idProp,
    includeInputInList = false,
    allowFilter,
    inputValue: inputValueProp,
    limitTags = -1,
    loading = false,
    loadingText = "Loading…",
    multiple = false,
    noOptionsText = "No options",
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open,
    openOnFocus = false,
    openText = "Open",
    options = [],
    popupIcon = <ChevronDown/>,
    renderGroup: renderGroupProp,
    label,
    placeholder,
    name,
    required,
    readOnly = false,
    renderInput = ({ ref, ...params }) => <Input {...params} ref={ref} />,
    renderOption: renderOptionProp,
    renderTags,
    slots = {},
    slotProps = {},
    value: valueProp,
    menuHeader,
    menuFooter,
    extraAdornment,
    error,
    shrink,
    disablePopper,
    itemFocusClassName,
    itemFocusVisibleClassName,
    theme: _th,
    renderOutside,
    renderInputValue,
    onCompleteState,
    ...other
  } = props;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  //console.log("AutoSelect::variant:", props.variant)

  const [openState, setOpenState] = React.useState(!!open);

  const handleOpenState = React.useCallback((openState) => {
    setOpenState(openState);
    onCompleteState && onCompleteState(openState);
    //console.log("handleOpenState:", openState)
  }, [setOpenState, onCompleteState])


  const {
    getRootProps,
    getInputProps,
    getInputLabelProps,
    getPopupIndicatorProps,
    getClearProps,
    getTagProps,
    getListboxProps,
    getOptionProps,
    value,
    dirty,
    expanded,
    id,
    popupOpen: asPopupOpen,
    focused,
    focusedTag,
    anchorEl,
    setAnchorEl,
    inputValue,
    groupedOptions,
    handleClose,
    handleOpen,
  } = useAutocomplete({
    ...props,
    disableClearable,
    inOpen: openState,
    options,
    componentName: "AutoSelect",
    renderOutside: !!renderOutside,
  });

  const popupOpen = asPopupOpen || !!open;

  const onOpenChange = (open, event, reason) => {
    //console.log("MuxSelect onOpenChange: open", open, ", reason:", reason);
    if (popupOpen !== open) {
      if (open) {
        //action.current.handleOpen(event)
      } else {
        //action.current.handleOpen(event, reason);
        handleClose(event, reason, true);
      }
    }
  };

  const hasClearIcon =
    !loading && !disableClearable && !disabled && dirty && !readOnly;
  const hasPopupIcon =
    forcePopupIcon !== false && (!freeSolo || forcePopupIcon === true);

  //const { onMouseDown: handleInputMouseDown } = getInputProps();
  const { ref: listboxRef, ...otherListboxProps } = getListboxProps();

  const defaultGetOptionLabel = (option) => option.label ?? option;
  const getOptionLabel = getOptionLabelProp || defaultGetOptionLabel;
  const buttonSize = size === "lg" ? "md" : "sm";
  // If you modify this, make sure to keep the `AutoSelectOwnerState` type in sync.
  const ownerState = {
    ...props,
    disablePortal,
    expanded,
    focused,
    fullWidth,
    getOptionLabel,
    hasClearIcon,
    hasPopupIcon,
    inputFocused: focusedTag === -1,
    popupOpen,
    size,
    buttonSize,
    disablePopper,
  };

  const classes = useUtilityClasses(ownerState);

  const externalForwardedProps = {
    slots: {
      ...slots,
    },
    slotProps: {
      ...slotProps,
    },
  };

  const [ListboxSlot, listboxProps] = useSlot("listbox", {
    elementType: "ul",
    externalForwardedProps,
    ownerState,
    className: classes.listbox,
    additionalProps: otherListboxProps,
    ref: listboxRef,
  });

  const [PanelSlot, panelProps] = useSlot("panel", {
    elementType: Panel,
    externalForwardedProps,
    ownerState,
    className: classes.panel,
  });

  let prefix;

  if (renderInputValue) {
    prefix = renderInputValue(value);
  } else {
    if (multiple && value.length > 0) {
      const getCustomizedTagProps = (params) => ({
        className: clsx(classes.tag, ownerState.focusedTag === params && autoSelectClasses.focusVisible),
        disabled,
        ...getTagProps(params),
        size,
        //xsm: true,
      });

      if (renderTags) {
        prefix = renderTags(value, getCustomizedTagProps, ownerState);
      } else {
        prefix = value.map((option, index) => {
          const { key, ...customTagProps } = getCustomizedTagProps(index);
          return (
            <Chip
              key={key}
              label={getOptionLabel(option)}
              {...customTagProps}
              {...externalForwardedProps.slotProps.chip}
            />
          );
        });
      }
    }

    if (limitTags > -1 && Array.isArray(prefix)) {
      const more = prefix.length - limitTags;
      if ((!focused || limitTags === 0) && more > 0) {
        prefix = prefix.splice(0, limitTags);
        prefix.push(
          <Chip key={prefix.length} size={size}>
            {getLimitTagsText(more)}
          </Chip>,
        );
      }
    }
    if (prefix && prefix.length) {
      prefix = <>{prefix}</>;
    }
  }

  const defaultRenderGroup = (params) => (
    <li key={params.key}>
      <AutoSelectGroupLabel
        className={classes.groupLabel}
        ownerState={ownerState}
        component="div"
      >
        {params.group}
      </AutoSelectGroupLabel>
      <AutoSelectGroupUl className={classes.groupUl} ownerState={ownerState}>
        {params.children}
      </AutoSelectGroupUl>
    </li>
  );

  const renderGroup = renderGroupProp || defaultRenderGroup;
  const defaultRenderOption = (props, option) => {
    // Need to clearly apply key because of https://github.com/vercel/next.js/issues/55642
    const { key, ...otherProps } = props;
    return (
      <li key={key} {...otherProps}>
        {getOptionLabel(option)}
      </li>
    );
  };
  const renderOption = renderOptionProp || defaultRenderOption;

  const renderListOption = (option, index) => {
    const optionProps = getOptionProps(option, index);

    return renderOption(
      { ...optionProps, className: classes.option },
      option,
      {
        selected: optionProps["aria-selected"],
        index,
        inputValue,
      },
      ownerState,
    );
  };

  const clearIndicatorSlotProps =
    externalForwardedProps.slotProps.clearIndicator;
  const popupIndicatorSlotProps =
    externalForwardedProps.slotProps.popupIndicator;
  const popperSlotProps = externalForwardedProps.slotProps.popper;

  const preventClick = (event) => {
    event.preventDefault();
    //event.stopPorpgation()
  };

  const createPopperProps = React.useCallback(
    () => ({
      reference: anchorEl,
      ...(renderOutside
        ? popperSlotProps
        : {
            animate: false,
            portal: false,
            sideOffset: 6,
            alignOffset: 6,
            boundaryPadding: 10,
            autoFlip: { padding: 10 },
            matchReferenceWidth: true,
            strategy: 'fixed',
            hideWhenDetached: true,
            ...popperSlotProps,
            onPresent: setOpenState
          }),

      className: clsx(`${classes.popper} z-modal`, popperSlotProps?.className),
      open: popupOpen,
      roles: { role: "presentation" },
      dismiss: {},
      handler: onOpenChange,
      onCompleteState: handleOpenState,
    }),
    [renderOutside, anchorEl, handleOpenState, popperSlotProps, popupOpen],
  );

  const renderAutoSelectPopperChildren = (children) =>
    disablePopper ? (
      renderOutsideChildren(children)
    ) : (
      <Popper {...createPopperProps()} type="select">
        {renderOutsideChildren(children)}
      </Popper>
    );

  const renderAutoSelectPanelChildren = (children) => (
    <AutoSelectPanel as={PanelSlot} fill {...panelProps}>
      {menuHeader && (
        <AutoSelectMenuHeader onMouseDown={preventClick}>
          {menuHeader}
        </AutoSelectMenuHeader>
      )}
      {children}
      {menuFooter && (
        <AutoSelectMenuFooter onMouseDown={preventClick}>
          {menuFooter}
        </AutoSelectMenuFooter>
      )}
    </AutoSelectPanel>
  );

  const renderOutsideChildren = (children) =>
    renderOutside
      ? renderOutside(
          getRootProps,
          () => ({ ...getInputProps(), onMouseDown: () => {}, placeholder }),
          ({ className, ...rest }) =>
            !loading && !disabled && !readOnly && inputValue ? (
              <AutoSelectClearIndicator
                {...getClearProps(true)}
                aria-label={clearText}
                title={clearText}
                ownerState={ownerState}
                {...clearIndicatorSlotProps}
                className={clsx(
                  classes.clearIndicator,
                  clearIndicatorSlotProps?.className,
                  className,
                )}
                sx={{
                  visibility: "visible",
                }}
                {...rest}
              >
                {clearIcon}
              </AutoSelectClearIndicator>
            ) : null,
          !!open,
          renderAutoSelectPanelChildren(children),
        )
      : renderAutoSelectPanelChildren(children);

  let autoSelectPopper = null;
  if (popupOpen || openState) {
    if (groupedOptions.length > 0) {
      autoSelectPopper = renderAutoSelectPopperChildren(
        <AutoSelectListbox as={ListboxSlot} {...listboxProps}>
          {groupedOptions.map((option, index) => {
            if (groupBy) {
              return renderGroup({
                key: option.key,
                group: option.group,
                children: option.options.map((option2, index2) =>
                  renderListOption(option2, option.index + index2),
                ),
              });
            }
            return renderListOption(option, index);
          })}
        </AutoSelectListbox>,
      );
    } else if (groupedOptions.length === 0) {
      autoSelectPopper = loading
        ? renderAutoSelectPopperChildren(
            <AutoSelectLoading
              className={classes.loading}
              ownerState={ownerState}
            >
              {loadingText}
            </AutoSelectLoading>,
          )
        : renderAutoSelectPopperChildren(
            <AutoSelectNoOptions
              className={classes.noOptions}
              ownerState={ownerState}
              role="presentation"
              onMouseDown={(event) => {
                // Prevent input blur when interacting with the "no options" content
                event.preventDefault();
              }}
            >
              {noOptionsText}
            </AutoSelectNoOptions>,
          );
    }
  }

  //console.log("AutoSelect outsideDirty:", outsideDirty, ", inputValue:", inputValue)
  return (
    <>
      <AutoSelectRoot
        ref={ref}
        className={clsx(classes.root, className)}
        ownerState={ownerState}
        {...getRootProps(other)}
      >
        {renderInput({
          disableBorder,
          fullWidth: true,
          size: size,
          labelProps: getInputLabelProps(),
          label,
          error,
          shrink,
          rootProps: {
            ref: setAnchorEl,
            className: clsx(
              classes.inputRoot,
              "max-w-inherit",
              multiple ? "min-w-inherit" : "min-w-[30px]",
            ),
          },
          prefix,
          variant,
          nativeClassName: classes.input,
          placeholder,
          name,
          forceInline: !!renderInputValue
            ? React.isValidElement(prefix)
            : multiple && limitTags !== 0,
          required,

          onClick: (event) => {
            
            if (event.target === event.currentTarget) {
              //handleInputMouseDown(event);
            }
            if (renderOutside && !disabled && !readOnly) {
              open ? onClose?.("toggleInput", event) : onOpen?.(event);
            }
          },

          ...((hasClearIcon ||
            hasPopupIcon ||
            React.isValidElement(extraAdornment)) && {
            suffix: (
              <>
                {hasClearIcon ? (
                  <AutoSelectClearIndicator
                    {...getClearProps()}
                    aria-label={clearText}
                    title={clearText}
                    ownerState={ownerState}
                    {...clearIndicatorSlotProps}
                    size="inherit"
                    className={clsx(
                      classes.clearIndicator,
                      clearIndicatorSlotProps?.className,
                    )}
                  >
                    {clearIcon}
                  </AutoSelectClearIndicator>
                ) : null}

                {extraAdornment ? (
                  <ExtraAdornment
                    className={classes.extraAdornment}
                    ownerState={ownerState}
                  >
                    {extraAdornment}
                  </ExtraAdornment>
                ) : null}

                {hasPopupIcon ? (
                  <AutoSelectPopupIndicator
                    {...getPopupIndicatorProps()}
                    disabled={disabled}
                    aria-label={popupOpen ? closeText : openText}
                    title={popupOpen ? closeText : openText}
                    ownerState={ownerState}
                    {...popupIndicatorSlotProps}
                    size="inherit"
                    className={clsx(
                      classes.popupIndicator,
                      popupIndicatorSlotProps?.className,
                    )}
                  >
                    {popupIcon}
                  </AutoSelectPopupIndicator>
                ) : null}
              </>
            ),
          }),
          ...getInputProps(),
          ...(renderOutside && {
            onBlur: () => {},
            ref: null,
            readOnly: true,
            value:
              !value || renderInputValue || multiple
                ? ""
                : getOptionLabel(value),
          }),
        })}
      </AutoSelectRoot>
      {autoSelectPopper}
    </>
  );
});

export default AutoSelect;