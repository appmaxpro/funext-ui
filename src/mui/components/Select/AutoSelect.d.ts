import * as React from 'react';

import { OverridableStringUnion } from '../../props';
import {
  useAutocomplete,
  AutocompleteValue,
  createFilterOptions,
  UseAutocompleteProps,
  AutocompleteFreeSoloValueMapping,
} from '../useAutocomplete/useAutocomplete';

import type { IconButtonProps } from '../IconButton/type';
import type { InternalStandardProps as StandardProps } from '../../props';
import type { SxThemeProps} from '../../styles';

import { InputProps as TextFieldProps} from '../Input';
import { ChipProps, ChipTypeMap } from '../Chip';
import { PanelProps } from '../Panel';
import { PopperProps } from '../Popper';
import { AutoSelectClasses } from './autoSelectClasses';
import { CreateSlotsAndSlotProps, SlotProps } from '../../props';

export * from './autoSelectClasses';
export {default as autoSelectClasses} from './autoSelectClasses';

export {
  createFilterOptions,
};

export type AutoSelectOwnerState<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> = AutoSelectProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent> & {
  disablePortal: boolean;
  expanded: boolean;
  focused: boolean;
  fullWidth: boolean;
  getOptionLabel: (option: Value | AutocompleteFreeSoloValueMapping<FreeSolo>) => string;
  hasClearIcon: boolean;
  hasPopupIcon: boolean;
  inputFocused: boolean;
  popupOpen: boolean;
  size: OverridableStringUnion<'sm' | 'medium', AutoSelectPropsSizeOverrides>;
};

export type AutoSelectRenderGetTagProps = ({ index }: { index: number }) => {
  key: number;
  className?: string;
  disabled?: boolean;
  'data-tag-index'?: number;
  tabIndex: -1?;
  onDelete?: (event: any) => void;
};

export interface AutoSelectRenderOptionState {
  inputValue: string;
  index: number;
  selected: boolean;
}

export interface AutoSelectRenderGroupParams {
  key: string;
  group: string;
  children?: React.ReactNode;
}

export interface AutoSelectRenderInputParams {
  id: string;
  disabled: boolean;
  fullWidth: boolean;
  size: 'small' | undefined;
  InputLabelProps: ReturnType<ReturnType<typeof useAutocomplete>['getInputLabelProps']>;
  InputProps: {
    ref: React.Ref<any>;
    className: string;
    startAdornment: React.ReactNode;
    endAdornment: React.ReactNode;
  };
  inputProps: ReturnType<ReturnType<typeof useAutocomplete>['getInputProps']>;
}

export interface AutoSelectPropsSizeOverrides {}

export interface AutoSelectSlots {
  /**
   * The component used to render the listbox.
   * @default 'ul'
   */
  listbox?: React.JSXElementConstructor<React.HTMLAttributes<HTMLElement>>;
  /**
   * The component used to render the body of the popup.
   * @default Panel
   */
  panel?: React.JSXElementConstructor<PanelProps>;
  /**
   * The component used to position the popup.
   * @default Popper
   */
  popper?: React.JSXElementConstructor<PopperProps>;

}

export type AutoSelectSlotsAndSlotProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> = CreateSlotsAndSlotProps<
  AutoSelectSlots,
  {
    chip: SlotProps<
      React.ElementType<Partial<ChipProps<ChipComponent>>>,
      {},
      AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
    >;
    clearIndicator: SlotProps<
      React.ElementType<Partial<IconButtonProps>>,
      {},
      AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
    >;
    /**
     * Props applied to the Listbox element.
     */
    listbox: SlotProps<
      React.ElementType<
        ReturnType<ReturnType<typeof useAutocomplete>['getListboxProps']> & {
          sx?: SxThemeProps;
          ref?: React.Ref<Element>;
        }
      >,
      {},
      AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
    >;

    panel: SlotProps<
      React.ElementType<Partial<PanelProps>>,
      {},
      AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
    >;
    popper: SlotProps<
      React.ElementType<Partial<PopperProps>>,
      {},
      AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
    >;
    popupIndicator: SlotProps<
      React.ElementType<Partial<IconButtonProps>>,
      {},
      AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>
    >;

  }
>;

export interface AutoSelectProps<
  Value,
  Multiple extends boolean | undefined,
  DisableClearable extends boolean | undefined,
  FreeSolo extends boolean | undefined,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
> extends UseAutocompleteProps<Value, Multiple, DisableClearable, FreeSolo>,
    StandardProps<React.HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'children'>,
    Pick<TextFieldProps, 'variant' | 'size' | 'placeholder' | 'name' | 'label' | 'required' | 'color' | 'error' | 'disableBorder'>,
    AutoSelectSlotsAndSlotProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent> {

  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<AutoSelectClasses>;
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
   * If `true`, the component is disabled.
   * @default false
   */
  disabled?: boolean;
  /**
   * If `true`, the `Popper` content will be under the DOM hierarchy of the parent component.
   * @default false
   */
  disablePortal?: boolean;
  disablePopper?: boolean;
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
  
  /**
   * If `true`, the component is in a loading state.
   * This shows the `loadingText` in place of suggestions (only if there are no suggestions to show, for example `options` are empty).
   * @default false
   */
  loading?: boolean;
  /**
   * Text to display when in a loading state.
   *
   * For localization purposes, you can use the provided [translations](/material-ui/guides/localization/).
   * @default 'Loading…'
   */
  loadingText?: React.ReactNode;
  /**
   * The maximum number of tags that will be visible when not focused.
   * Set `-1` to disable the limit.
   * @default -1
   */
  limitTags?: number;
  /**
   * Text to display when there are no options.
   *
   * For localization purposes, you can use the provided [translations](/material-ui/guides/localization/).
   * @default 'No options'
   */
  noOptionsText?: React.ReactNode;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLDivElement> & { defaultMuiPrevented?: boolean },
  ) => void;
  /**
   * Override the default text for the *open popup* icon button.
   *
   * For localization purposes, you can use the provided [translations](/material-ui/guides/localization/).
   * @default 'Open'
   */
  openText?: string;

  /**
   * The icon to display in place of the default popup icon.
   * @default <ArrowDropDownIcon />
   */
  popupIcon?: React.ReactNode;
  /**
   * If `true`, the component becomes readonly. It is also supported for multiple tags where the tag cannot be deleted.
   * @default false
   */
  readOnly?: boolean;
  /**
   * Render the group.
   *
   * @param {AutoSelectRenderGroupParams} params The group to render.
   * @returns {ReactNode}
   */
  renderGroup?: (params: AutoSelectRenderGroupParams) => React.ReactNode;
  /**
   * Render the input.
   *
   * @param {object} params
   * @returns {ReactNode}
   */
  renderInput: (params: AutoSelectRenderInputParams) => React.ReactNode;
  /**
   * Render the option, use `getOptionLabel` by default.
   *
   * @param {object} props The props to apply on the li element.
   * @param {Value} option The option to render.
   * @param {object} state The state of each option.
   * @param {object} ownerState The state of the Autocomplete component.
   * @returns {ReactNode}
   */
  renderOption?: (
    props: React.HTMLAttributes<HTMLLIElement> & { key: any },
    option: Value,
    state: AutoSelectRenderOptionState,
    ownerState: AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  ) => React.ReactNode;
  /**
   * Render the selected value.
   *
   * @param {Value[]} value The `value` provided to the component.
   * @param {function} getTagProps A tag props getter.
   * @param {object} ownerState The state of the Autocomplete component.
   * @returns {ReactNode}
   */
  renderTags?: (
    value: Value[],
    getTagProps: AutoSelectRenderGetTagProps,
    ownerState: AutoSelectOwnerState<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
  ) => React.ReactNode;
  /**
   * The size of the component.
   * @default 'medium'
   */
  size?: TextFieldProps['size'];
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;

  variant?: TextFieldProps['variant'],
  label?: TextFieldProps['label'],
  placeholder?: TextFieldProps['placeholder'],
  name?: TextFieldProps['name'],
  renderInput?: (params: AutoSelectRenderInputParams) => React.ReactNode;

  menuHeader?: React.ReactNode;

  menuFooter?: React.ReactNode;

  extraAdornment?: React.ReactNode;

  disablePopper?: boolean;
}


/**
 *
 * Demos:
 *
 * - [Autocomplete](https://next.mui.com/material-ui/react-autocomplete/)
 *
 * API:
 *
 * - [Autocomplete API](https://next.mui.com/material-ui/api/autocomplete/)
 */
export default function AutoSelect<
  Value,
  Multiple extends boolean | undefined = false,
  DisableClearable extends boolean | undefined = false,
  FreeSolo extends boolean | undefined = false,
  ChipComponent extends React.ElementType = ChipTypeMap['defaultComponent'],
>(
  props: AutoSelectProps<Value, Multiple, DisableClearable, FreeSolo, ChipComponent>,
): React.JSX.Element;