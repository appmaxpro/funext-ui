import {
  Box,
  Divider,
  Input as FxInput,
  Dialog as FxDialog,
  type Divider as DividerProps,
  type InputProps as FxInputProps,
  type DialogProps as FxDialogProps,
  type PossibleRef,
} from "@funext/ui";
import type React from "react";

//export = Command;
export as namespace Command;

export declare namespace Command {
  export type Children = { children?: React.ReactNode };
  type DivProps = React.ComponentPropsWithoutRef<typeof Box>;
    export interface LoadingProps extends Children, DivProps {
    /** Estimated progress of loading asynchronous options. */
    progress?: number;
    /**
     * Accessible label for this loading progressbar. Not shown visibly.
     */
    label?: string;
  }

  export interface EmptyProps extends Children, DivProps {}

  export interface SeparatorProps extends DivProps {
    /** Whether this separator should always be rendered. Useful if you disable automatic filtering. */
    alwaysRender?: boolean;
  }
  export type DialogProps = FxDialogProps &
    RootProps & {
      /** Provide a className to the Dialog overlay. */
      overlayClassName?: string;
      /** Provide a className to the Dialog content. */
      contentClassName?: string;
      /** Provide a custom element the Dialog should portal into. */
      container?: HTMLElement;
    };
  export type ListProps = Children &
    DivProps & {
      /**
       * Accessible label for this List of suggestions. Not shown visibly.
       */
      label?: string;
    };
  export type ItemProps = Children &
    Omit<DivProps, "disabled" | "onSelect" | "value"> & {
      /** Whether this item is currently disabled. */
      disabled?: boolean;
      /** Event handler for when this item is selected, either via click or keyboard selection. */
      onSelect?: (value: string) => void;
      /**
       * A unique value for this item.
       * If no value is provided, it will be inferred from `children` or the rendered `textContent`. If your `textContent` changes between renders, you _must_ provide a stable, unique `value`.
       */
      value?: string;
      /** Optional keywords to match against when filtering. */
      keywords?: string[];
      /** Whether this item is forcibly rendered regardless of filtering. */
      forceMount?: boolean;
    };
  export type GroupProps = Children &
    Omit<DivProps, "heading" | "value"> & {
      /** Optional heading to render for this group. */
      heading?: React.ReactNode;
      /** If no heading is provided, you must provide a value that is unique for this group. */
      value?: string;
      /** Whether this group is forcibly rendered regardless of filtering. */
      forceMount?: boolean;
    };
  export type InputProps = Omit<
    FxInputProps,
    "value" | "onChange" | "type"
  > & {
    /**
     * Optional controlled state for the value of the search input.
     */
    value?: string;
    /**
     * Event handler called when the search value changes.
     */
    onValueChange?: (search: string) => void;
  };
  export type CommandFilter = (
    value: string,
    search: string,
    keywords?: string[],
  ) => number;
  export type RootProps = Children &
    DivProps & {
      /**
       * Accessible label for this command menu. Not shown visibly.
       */
      label?: string;
      /**
       * Optionally set to `false` to turn off the automatic filtering and sorting.
       * If `false`, you must conditionally render valid items based on the search query yourself.
       */
      shouldFilter?: boolean;
      /**
       * Custom filter function for whether each command menu item should matches the given search query.
       * It should return a number between 0 and 1, with 1 being the best match and 0 being hidden entirely.
       * By default, uses the `command-score` library.
       */
      filter?: CommandFilter;
      /**
       * Optional default item value when it is initially rendered.
       */
      defaultValue?: string;
      /**
       * Optional controlled state of the selected command menu item.
       */
      value?: string;
      /**
       * Event handler called when the selected item of the menu changes.
       */
      onValueChange?: (value: string) => void;
      /**
       * Optionally set to `true` to turn on looping around when using the arrow keys.
       */
      loop?: boolean;
      /**
       * Optionally set to `true` to disable selection via pointer events.
       */
      disablePointerSelection?: boolean;
      /**
       * Set to `false` to disable ctrl+n/j/p/k shortcuts. Defaults to `true`.
       */
      vimBindings?: boolean;
    };

  export type Context = {
    value: (id: string, value?: string, keywords?: string[]) => void;
    item: (id: string, groupId: string) => () => void;
    group: (id: string) => () => void;
    filter: () => boolean | undefined;
    label: string | undefined | unknown;
    getDisablePointerSelection: () => boolean | undefined;
    // Ids
    listId: string;
    labelId: string;
    inputId: string;
    // Refs
    listInnerRef: React.RefObject<HTMLDivElement | null>;
  };
  export type State = {
    search: string;
    value: string;
    selectedItemId?: string;
    filtered: {
      count: number;
      items: Map<string, number>;
      groups: Set<string>;
    };
  };
  export type Store = {
    subscribe: (callback: () => void) => () => void;
    snapshot: () => State;
    setState: <K extends keyof State>(
      key: K,
      value?: State[K],
      opts?: any,
    ) => void;
    emit: () => void;
  };
  export type Group = {
    id: string;
    forceMount?: boolean;
  };

  type CommandContext = React.Context<Context>;
  export type useCommand = () => CommandContext;

  type StoreContext = React.Context<Store>;
  export type useStore = () => StoreContext;
  
  export type Root<RootProps> = React.ForwardRefExoticComponent<RootProps>;
  export type List<RootProps> = React.ForwardRefExoticComponent<ListProps>;
  export type Item<RootProps> = React.ForwardRefExoticComponent<ItemProps>;
  export type Input<RootProps> = React.ForwardRefExoticComponent<InputProps>;
  export type Empty<RootProps> = React.ForwardRefExoticComponent<EmptyProps>;
  export type Loading<RootProps> = React.ForwardRefExoticComponent<LoadingProps>;
  export type Separator<RootProps> = React.ForwardRefExoticComponent<SeparatorProps>;
  export type Dialog<RootProps> = React.ForwardRefExoticComponent<DialogProps>;
  
}


