'use client';
import * as React from 'react';
import useAutocomplete from '../useAutocomplete/useAutocomplete';
import { createFilterOptions } from '../useAutocomplete/useAutocomplete';

import Popper from '../Popper';
import {ListSubheader} from '../List';
import Panel from '../Panel';
import {IconButton} from '../IconButton';
import Chip from '../Chip';
import Input from '../Input';
import { 
  styled, 
  useTheme, 
  useMuiDefaultProps, 
  composeClasses,
  useSlot,
  alpha,
  clsx,
  ThemeProvider,
  memoTheme
} from '../../styles';
import autoSelectClasses, { getAutoSelectUtilityClass } from './autoSelectClasses';
import { MaterialIcon } from '../../../icons/material-icon';

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
      'root',
      expanded && 'expanded',
      focused && 'focused',
      fullWidth && 'fullWidth',
      hasClearIcon && 'hasClearIcon',
      hasPopupIcon && 'hasPopupIcon',
    ],
    inputRoot: ['inputRoot'],
    input: ['input', inputFocused && 'inputFocused'],
    tag: ['tag', `tag-size-${size}`],
    endAdornment: ['endAdornment'],
    extraAdornment: ['extraAdornment'],
    clearIndicator: ['clearIndicator'],
    popupIndicator: ['popupIndicator', popupOpen && 'popupIndicatorOpen'],
    popper: ['popper', disablePortal && 'popperDisablePortal'],
    panel: ['panel'],
    listbox: ['listbox'],
    loading: ['loading'],
    noOptions: ['noOptions'],
    option: ['option'],
    groupLabel: ['groupLabel'],
    groupUl: ['groupUl'],
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

const AutoSelectRoot = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { fullWidth, hasClearIcon, hasPopupIcon, inputFocused, size } = ownerState;

    return [
      { [`& .${autoSelectClasses.tag}`]: styles.tag },
      { [`& .${autoSelectClasses.tag}`]: styles[`tag-size-${capitalize(size)}`] },
      { [`& .${autoSelectClasses.inputRoot}`]: styles.inputRoot },
      { [`& .${autoSelectClasses.input}`]: styles.input },
      { [`& .${autoSelectClasses.input}`]: inputFocused && styles.inputFocused },
      styles.root,
      fullWidth && styles.fullWidth,
      hasPopupIcon && styles.hasPopupIcon,
      hasClearIcon && styles.hasClearIcon,
    ];
  },
})({
  [`&.${autoSelectClasses.focused} .${autoSelectClasses.clearIndicator}`]: {
    visibility: 'visible',
  },
  /* Avoid double tap issue on iOS */
  '@media (pointer: fine)': {
    [`&:hover .${autoSelectClasses.clearIndicator}`]: {
      visibility: 'visible',
    },
  },
  [`& .${autoSelectClasses.tag}`]: {
    margin: 3,
    maxWidth: 'calc(100% - 6px)',
  },
  [`& .${autoSelectClasses.input}`]: {
    flexGrow: 1,
    textOverflow: 'ellipsis',
    opacity: 0,
  },
  variants: [
    {
      props: { fullWidth: true },
      style: { width: '100%' },
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
});


const ExtraAdornment = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'ExtraAdornment',
  overridesResolver: (props, styles) => styles.extraIndicator,
})({
  marginRight: 2,
  display: 'inline-flex',
  flexWrap: 'nowrap',
  alignItems: 'center'
});

const AutoSelectClearIndicator = styled(IconButton, {
  name: 'MuxAutoSelect',
  slot: 'ClearIndicator',
  overridesResolver: (props, styles) => styles.clearIndicator,
})({
  padding: 6,
  visibility: 'hidden',
});

const AutoSelectPopupIndicator = styled(IconButton, {
  name: 'MuxAutoSelect',
  slot: 'PopupIndicator',
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
        transform: 'rotate(180deg)',
      },
    },
  ],
});

const AutoSelectPanel = styled(Panel, {
  name: 'MuxAutoSelect',
  slot: 'Panel',
  overridesResolver: (props, styles) => styles.panel,
})(memoTheme(({ theme }) => ({
  ...theme.typography.body1,
  overflow: 'auto',
  backgroundColor: theme.palette.background.paper,
  variants: [
    {
      props: ()=> {
        //console.log("MuxAutoSelect:Panel:theme", theme);
        return false;
      },
      style: {
      }

    }
  ]
})));

const AutoSelectLoading = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'Loading',
  overridesResolver: (props, styles) => styles.loading,
})(memoTheme(({ theme }) => ({
  color: (theme.vars || theme).palette.text.secondary,
  padding: '14px 16px',
})));

const AutoSelectNoOptions = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'NoOptions',
  overridesResolver: (props, styles) => styles.noOptions,
})(memoTheme( ({theme}) => ({
  color: (theme.vars || theme).palette.text.secondary,
  padding: '14px 16px',
})));

const AutoSelectMenuHeader = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'MenuHeader',
  overridesResolver: (props, styles) => styles.menuHeader,
})({
  display: 'flex',
  width: '100%'
});

const AutoSelectMenuFooter = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'MenuFooter',
  overridesResolver: (props, styles) => styles.menuFooter,
})({
  display: 'flex',

  width: '100%'
});


const AutoSelectListbox = styled('div', {
  name: 'MuxAutoSelect',
  slot: 'Listbox',
  overridesResolver: (props, styles) => styles.listbox,
})(memoTheme(({ theme }) => (!theme?.palette ? {} : {
  listStyle: 'none',
  margin: 0,
  padding: '8px 0',
  maxHeight: '40vh',
  overflow: 'auto',
  position: 'relative',
  //
  [`& .${autoSelectClasses.option}`]: {
    minHeight: 48,
    display: 'flex',
    overflow: 'hidden',
    justifyContent: 'flex-start',
    alignItems: 'center',
    cursor: 'pointer',
    boxSizing: 'border-box',
    outline: '0',
    WebkitTapHighlightColor: 'transparent',
    paddingTop: 8,
    paddingBottom: 8,
    [theme.breakpoints.up('sm')]: {
      minHeight: 'auto',
    },
    [`&.${autoSelectClasses.focused}`]: {
      //backgroundColor: (theme.vars || theme).palette.action.hover,
      backgroundColor: 'rgb(var(--tw-primary-rgb) / 30%)',
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        backgroundColor: 'transparent',
      },
    },
    '&[aria-disabled="true"]': {
      opacity: (theme.vars || theme).palette.action.disabledOpacity,
      pointerEvents: 'none',
    },
    [`&.${autoSelectClasses.focusVisible}`]: {
      //backgroundColor: (theme.vars || theme).palette.action.focus,
      backgroundColor: 'rgb(var(--tw-primary-rgb) / 50%)',
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.palette.action.activeGray ?? (theme.vars
        ? `rgba(${theme.vars.palette.primary.mainChannel} / ${theme.vars.palette.action.selectedOpacity})`
        : alpha(theme.palette.primary.main, theme.palette.action.selectedOpacity)),
      [`&.${autoSelectClasses.focused}`]: {
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + .04))`
          : alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity + .04,
            ),
        // Reset on touch devices, it doesn't add specificity
        '@media (hover: none)': {
          backgroundColor: (theme.vars || theme).palette.action.selected,
        },
      },
      [`&.${autoSelectClasses.focusVisible}`]: {
        backgroundColor: theme.vars
          ? `rgba(${theme.vars.palette.primary.mainChannel} / calc(${theme.vars.palette.action.selectedOpacity} + ${theme.vars.palette.action.focusOpacity}))`
          : alpha(
              theme.palette.primary.main,
              theme.palette.action.selectedOpacity + theme.palette.action.focusOpacity,
            ),
      },
    },
  },
})));

const AutoSelectGroupLabel = styled(ListSubheader, {
  name: 'MuxAutoSelect',
  slot: 'GroupLabel',
  overridesResolver: (props, styles) => styles.groupLabel,
})(memoTheme(({ theme }) => ({
  backgroundColor: (theme.vars || theme).palette.background.panel,
  top: -8,
})));

const AutoSelectGroupUl = styled('ul', {
  name: 'MuxAutoSelect',
  slot: 'GroupUl',
  overridesResolver: (props, styles) => styles.groupUl,
})({
  padding: 0,
  [`& .${autoSelectClasses.option}`]: {
    paddingLeft: 24,
  },
});

export { createFilterOptions };

const AutoSelect = React.forwardRef(function AutoSelect(inProps, ref) {

  const theme = useTheme();

  const props = useMuiDefaultProps({props: {...inProps, theme}, name: "MuxAuoSelect"});
  
  /* eslint-disable @typescript-eslint/no-unused-vars */
  const {
    autoComplete = false,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    ChipProps: ChipPropsProp,
    className,
    clearIcon = <MaterialIcon icon='close'/>,
    clearOnBlur = !props.freeSolo,
    clearOnEscape = false,
    clearText = 'Clear',
    closeText = 'Close',
    componentsProps,
    defaultValue = props.multiple ? [] : null,
    disableClearable = false,
    disableCloseOnSelect = false,
    disabled = false,
    disabledItemsFocusable = false,
    disableListWrap = false,
    disablePortal = false,
    filterOptions,
    filterSelectedOptions = false,
    forcePopupIcon = 'auto',
    freeSolo = false,
    fullWidth = false,
    getLimitTagsText = (more) => `+${more}`,
    getOptionDisabled,
    getOptionKey,
    optionEquals,
    optionMatches,
    getOptionLabel: getOptionLabelProp,
    groupBy,
    handleHomeEndKeys = !props.freeSolo,
    id: idProp,
    includeInputInList = false,
    inputValue: inputValueProp,
    limitTags = -1,
    ListboxComponent: ListboxComponentProp,
    ListboxProps: ListboxPropsProp,
    loading = false,
    loadingText = 'Loading…',
    multiple = false,
    noOptionsText = 'No options',
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open,
    openOnFocus = false,
    openText = 'Open',
    options = [],
    popperProps,
    PanelComponent: PanelComponentProp,
    popupIcon = <MaterialIcon icon='keyboard_arrow_down'/>,
    renderGroup: renderGroupProp,
    variant,
    label,
    placeholder,
    name,
    required,
    readOnly = false, 
    renderInput = (params) => (<Input {...params}/>),
    renderOption: renderOptionProp,
    renderTags,
    selectOnFocus = !props.freeSolo,
    size = 'md',
    slots = {},
    slotProps = {},
    value: valueProp,
    menuHeader,
    menuFooter,
    extraAdornment,
    ...other
  } = props;
  /* eslint-enable @typescript-eslint/no-unused-vars */

  const action = React.useRef(null);

  
  const [openState, setOpenState] = React.useState(!!open);
  
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

  } = useAutocomplete({ ...props, inOpen: openState , options, componentName: 'AutoSelect' });

  
  const onOpenChange = (open, event, reason) => {
    if (open) {
      //action.current.handleOpen(event) 
    } else {
      //action.current.handleOpen(event, reason); 
    }
  }
   
  const popupOpen = asPopupOpen || !!open;
  
  const hasClearIcon = !disableClearable && !disabled && dirty && !readOnly;
  const hasPopupIcon = (!freeSolo || forcePopupIcon === true) && forcePopupIcon !== false;

  const { onMouseDown: handleInputMouseDown } = getInputProps();
  const { ref: listboxRef, ...otherListboxProps } = getListboxProps();

  const defaultGetOptionLabel = (option) => option.label ?? option;
  const getOptionLabel = getOptionLabelProp || defaultGetOptionLabel;

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
  };

  const classes = useUtilityClasses(ownerState);


  const externalForwardedProps = {
    slots: {
      listbox: ListboxComponentProp,
      panel: PanelComponentProp,
      ...slots,
    },
    slotProps: {
      chip: ChipPropsProp,
      listbox: ListboxPropsProp,
      ...componentsProps,
      ...slotProps,
    },
  };

  const [ListboxSlot, listboxProps] = useSlot('listbox', {
    elementType: 'ul',
    externalForwardedProps,
    ownerState,
    className: classes.listbox,
    additionalProps: otherListboxProps,
    ref: listboxRef,
  });

  const [PanelSlot, panelProps] = useSlot('panel', {
    elementType: Panel,
    externalForwardedProps,
    ownerState,
    className: classes.panel,
  });

  const buttonSize = size === 'lg' ? 'md' : 'sm'; 
  let startAdornment;

  if (multiple && value.length > 0) {
    const getCustomizedTagProps = (params) => ({
      className: classes.tag,
      disabled,
      ...getTagProps(params),
    });

    if (renderTags) {
      startAdornment = renderTags(value, getCustomizedTagProps, ownerState);
    } else {
      startAdornment = value.map((option, index) => {
        const { key, ...customTagProps } = getCustomizedTagProps({ index });
        return (
          <Chip
            key={key}
            label={getOptionLabel(option)}
            size={buttonSize}
            {...customTagProps}
            {...externalForwardedProps.slotProps.chip}
          />
        );
      });
    }
  }

  if (limitTags > -1 && Array.isArray(startAdornment)) {
    const more = startAdornment.length - limitTags;
    if (!focused && more > 0) {
      
      startAdornment = startAdornment.splice(0, limitTags);
      startAdornment.push(
        (<Chip key={startAdornment.length} size={buttonSize}>
          {getLimitTagsText(more)}
        </Chip>) 
      );
    }
  }
  if (startAdornment && startAdornment.length) {
    startAdornment = <>{startAdornment}</>;
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
  const defaultRenderOption = (props2, option) => {
    // Need to clearly apply key because of https://github.com/vercel/next.js/issues/55642
    const { key, ...otherProps } = props2;
    return (
      <li key={key} {...otherProps}>
        {getOptionLabel(option)}
      </li>
    );
  };
  const renderOption = renderOptionProp || defaultRenderOption;

  const renderListOption = (option, index) => {
    const optionProps = getOptionProps(option, index );

    return renderOption(
      { ...optionProps, className: classes.option },
      option,
      {
        selected: optionProps['aria-selected'],
        index,
        inputValue,
      },
      ownerState,
    );
  };

  const clearIndicatorSlotProps = externalForwardedProps.slotProps.clearIndicator;
  const popupIndicatorSlotProps = externalForwardedProps.slotProps.popupIndicator;

  const preventClick =  (event)=>{
    event.preventDefault();
    //event.stopPorpgation()
  }
  const createPopperProps = ()=> ({
    className: `${classes.popper} z-modal`,
    animate: false,
    disablePortal,
    offset: 6,
    autoFlip: { padding: 10 },
    autoSize: {
      padding:  10,
      apply({ rects, availableHeight, elements }) {
        Object.assign(elements?.floating?.style, {
          width: `${rects?.reference?.width}px`,
        });
      },
    },
    
    ...popperProps,
    open: popupOpen,
    roles: { role: "presentation" },
    dismiss: {},
    handler: onOpenChange,
    target: anchorEl,
    onCompleteState: setOpenState
  });

  const renderAutoSelectPopperChildren = (children) => (
    <Popper {...createPopperProps()}>
      <ThemeProvider theme={theme}>
        <AutoSelectPanel as={PanelSlot} {...panelProps}>
          {menuHeader && <AutoSelectMenuHeader onMouseDown={preventClick}>{menuHeader}</AutoSelectMenuHeader>}
          {children}
          {menuFooter && <AutoSelectMenuFooter onMouseDown={preventClick}>{menuFooter}</AutoSelectMenuFooter>}
        </AutoSelectPanel>
      </ThemeProvider>
    </Popper>
  );

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
    } else if (loading && groupedOptions.length === 0) {
      autoSelectPopper = renderAutoSelectPopperChildren(
        <AutoSelectLoading className={classes.loading} ownerState={ownerState}>
          {loadingText}
        </AutoSelectLoading>,
      );
    } else if (groupedOptions.length === 0 && !freeSolo && !loading) {
      autoSelectPopper = renderAutoSelectPopperChildren(
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
  


  return (
    <React.Fragment>
      <AutoSelectRoot
        ref={ref}
        className={clsx(classes.root, className)}
        ownerState={ownerState}
        {...getRootProps(other)}
      >
        {renderInput({
          id,
          disabled,
          fullWidth: true,
          size: size === 'md' ? 'md' : undefined,
          labelProps: getInputLabelProps(),
          label,
          rootProps: {
            ref: setAnchorEl,
            className: classes.inputRoot,
          },
          componentsProps:{
            //onKeyDown: getRootProps().onKeyDown
          },
          startAdornment,
          variant,
          className: classes.input,
          readOnly,
          placeholder,
          name,
          forceInline: multiple,
          required,
          ...getInputProps(),
          
          onClick: (event) => {
            console.log({target: event.target, currentTarget: event.currentTarget});
            if (event.target === event.currentTarget) {
              //handleInputMouseDown(event);
            }
          },
          ...((hasClearIcon || hasPopupIcon || React.isValidElement(extraAdornment)) && {
            endAdornment: (
              <>
                {hasClearIcon ? (
                  <AutoSelectClearIndicator
                    {...getClearProps()}
                    aria-label={clearText}
                    title={clearText}
                    ownerState={ownerState}
                    {...clearIndicatorSlotProps}
                    size={buttonSize}
                    className={clsx(classes.clearIndicator, clearIndicatorSlotProps?.className)}
                  >
                    {clearIcon}
                  </AutoSelectClearIndicator>
                ) : null}

                {extraAdornment ? (
                    <ExtraAdornment 
                      className={classes.extraAdornment} 
                      ownerState={ownerState}>
                        {extraAdornment}
                    </ExtraAdornment>
                  ) : null    
                }

                {hasPopupIcon ? (
                  <AutoSelectPopupIndicator
                    {...getPopupIndicatorProps()}
                    disabled={disabled}
                    aria-label={popupOpen ? closeText : openText}
                    title={popupOpen ? closeText : openText}
                    ownerState={ownerState}
                    {...popupIndicatorSlotProps}
                    //size={buttonSize}
                    className={clsx(classes.popupIndicator, popupIndicatorSlotProps?.className)}
                  >
                    {popupIcon}
                  </AutoSelectPopupIndicator>
                ) : null}
                </>
              ),
            }),
        })}
      </AutoSelectRoot>
      {autoSelectPopper }
    </React.Fragment>
  );
});


export default AutoSelect;