// @ts-nocheck
import React from 'react';

export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

export type ClassNameMap<ClassKey extends string = string> = Record<ClassKey, string>;

export interface StyledComponentProps<ClassKey extends string = string> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ClassNameMap<ClassKey>>;
}


export type ComponentProps = React.HTMLProps<React.ComponentType> & {
  children: React.ReactElement;
  [key:string]: any;
}


/**
 * All standard components exposed by `material-ui` are `StyledComponents` with
 * certain `classes`, on which one can also set a top-level `className` and inline
 * `style`.
 */
export type StandardProps<
  ComponentProps,
  ClassKey extends string,
  Removals extends keyof ComponentProps = never,
> = DistributiveOmit<ComponentProps, 'classes' | Removals> &
  StyledComponentProps<ClassKey> & {
    className?: string;
    ref?: ComponentProps extends { ref?: infer RefType } ? RefType : React.Ref<unknown>;
    style?: React.CSSProperties;
  };

/**
 * @internal
 * ONLY USE FROM WITHIN mui/material-ui
 *
 * Internal helper type for conform (describeConformance) components
 * However, we don't declare classes on this type.
 * It is recommended to declare them manually with an interface so that each class can have a separate JSDoc.
 */
export type InternalStandardProps<
  ComponentProps,
  Removals extends keyof ComponentProps = never,
> = DistributiveOmit<ComponentProps, 'classes' | Removals> &
  // each component declares it's classes in a separate interface for proper JSDoc
  StyledComponentProps<never> & {
    ref?: ComponentProps extends { ref?: infer RefType } ? RefType : React.Ref<unknown>;
    // TODO: Remove implicit props. Up to each component.
    className?: string;
    style?: React.CSSProperties;
  };

/**
 * Generate a set of string literal types with the given default record `T` and
 * override record `U`.
 *
 * If the property value was `true`, the property key will be added to the
 * string union.
 *
 * @internal
 */
export type OverridableStringUnion<T extends string | number, U = {}> = GenerateStringUnion<
  Overwrite<Record<T, true>, U>
>;


/**
 * Like `T & U`, but using the value types from `U` where their properties overlap.
 *
 * @internal
 */
export type Overwrite<T, U> = DistributiveOmit<T, keyof U> & U;


type GenerateStringUnion<T> = Extract<
  {
    [Key in keyof T]: true extends T[Key] ? Key : never;
  }[keyof T],
  string
>;

  /**
 * A component whose root component can be controlled via a `component` prop.
 *
 * Adjusts valid props based on the type of `component`.
 */

export interface OverridableComponent<M extends OverridableTypeMap> {
  // If you make any changes to this interface, please make sure to update the
  // `OverridableComponent` type in `mui-material/src/OverridableComponent.d.ts` as well.
  // Also, there are types in Base UI that have a similar shape to this interface
  // (for example SelectType, OptionType, etc.).
  <C extends React.ElementType>(
    props: {
      /**
       * The component used for the root node.
       * Either a string to use a HTML element or a component.
       */
      component: C;
    } & OverrideProps<M, C>,
  ): React.JSX.Element | null;
  (props: DefaultComponentProps<M>): React.JSX.Element | null;
  propTypes?: any;
}

/**
 * Props of the component if `component={Component}` is used.
 */
// prettier-ignore
export type OverrideProps<
  TypeMap extends OverridableTypeMap,
  RootComponent extends React.ElementType
> = (
  & BaseProps<TypeMap>
  & DistributiveOmit<React.ComponentPropsWithRef<RootComponent>, keyof BaseProps<TypeMap>>
  & {as?: RootComponent}
);

/**
 * Props if `component={Component}` is NOT used.
 */
// prettier-ignore
export type DefaultComponentProps<TypeMap extends OverridableTypeMap> =
  & BaseProps<TypeMap>
  & DistributiveOmit<React.ComponentPropsWithRef<TypeMap['defaultComponent']>, keyof BaseProps<TypeMap>>;

/**
 * Props defined on the component (+ common material-ui props).
 */
// prettier-ignore
export type BaseProps<TypeMap extends OverridableTypeMap> =
  & TypeMap['props']
  & CommonProps;

/**
 * Props that are valid for material-ui components.
 */
// each component declares it's classes in a separate interface for proper JSDoc.
export interface CommonProps extends StyledComponentProps<never> {
  className?: string;
  style?: React.CSSProperties;
}

export interface OverridableTypeMap {
  props: {};
  defaultComponent: React.ElementType;
}



/**
 * Add keys, values of `defaultProps` that does not exist in `props`
 * @param {object} defaultProps
 * @param {object} props
 * @returns {object} resolved props
 */
//@ts-expect-error no thing
export function resolveProps<T extends {
    components?: Record<string, unknown>;
    componentsProps?: Record<string, unknown>;
    slots?: Record<string, unknown>;
    slotProps?: Record<string, unknown>;
  } & Record<string, unknown>>
  (defaultProps: T, props: T) {

  const output = { ...props };

  (Object.keys(defaultProps) as Array<keyof T>).forEach((propName) => {
    if (propName.toString().match(/^(components|slots)$/)) {
      output[propName] = {
        ...(defaultProps[propName] as any),
        ...(output[propName] as any),
      };
    } else if (propName.toString().match(/^(componentsProps|slotProps)$/)) {
      const defaultSlotProps = (defaultProps[propName] || {}) as T[keyof T];
      const slotProps = props[propName] as {} as T[keyof T];
      output[propName] = {} as T[keyof T];

      if (!slotProps || !Object.keys(slotProps)) {
        // Reduce the iteration if the slot props is empty
        output[propName] = defaultSlotProps;
      } else if (!defaultSlotProps || !Object.keys(defaultSlotProps)) {
        // Reduce the iteration if the default slot props is empty
        output[propName] = slotProps;
      } else {
        output[propName] = { ...slotProps };
        Object.keys(defaultSlotProps).forEach((slotPropName) => {
          (output[propName] as Record<string, unknown>)[slotPropName] = resolveProps(
            (defaultSlotProps as Record<string, any>)[slotPropName],
            (slotProps as Record<string, any>)[slotPropName],
          );
        });
      }
    } else if (output[propName] === undefined) {
      output[propName] = defaultProps[propName];
    }
  });

  return output;
}


export type SystemStyleObject<Theme extends object = {}> =
  | any
  | null;

/**
 * The `SxProps` can be either object or function
 */
export type SxProps<Theme extends object = {}> =
  | SystemStyleObject<Theme>
  | ((theme: Theme) => SystemStyleObject<Theme>)
  | ReadonlyArray<
      boolean | SystemStyleObject<Theme> | ((theme: Theme) => SystemStyleObject<Theme>)
    >;