import React from "react";
import { OverrideProps } from "../../props";
import {
  clsx,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxThemeProps,
  useMuxDefaultProps,
} from "../../styles";
import ButtonBase, {
  ButtonBaseTypeMap,
  ExtendButtonBaseTypeMap,
} from "../Button/ButtonBase";

export interface BottomNavigationClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type BottomNavigationClassKey = keyof BottomNavigationClasses;

export function getBottomNavigationUtilityClass(slot: string): string {
  return generateUtilityClass('MuxBottomNavigation', slot);
}

export const bottomNavigationClasses: BottomNavigationClasses = generateUtilityClasses(
  'MuxBottomNavigation',
  ['root'],
);
function isReactFragment(node:any) {
  if (node && node.type) {
    return node.type === React.Fragment;
  }
  return node === React.Fragment;
}

export interface BottomNavigationOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<BottomNavigationClasses>;
  /**
   * Callback fired when the value changes.
   *
   * @param {React.SyntheticEvent} event The event source of the callback. **Warning**: This is a generic event not a change event.
   * @param {any} value We default to the index of the child.
   */
  onChange?: (event: React.SyntheticEvent, value: any) => void;
  /**
   * If `true`, all `BottomNavigationAction`s will show their labels.
   * By default, only the selected `BottomNavigationAction` will show its label.
   * @default false
   */
  showLabels?: boolean;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The value of the currently selected `BottomNavigationAction`.
   */
  value?: any;
}

export interface BottomNavigationTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'div',
> {
  props: AdditionalProps & BottomNavigationOwnProps;
  defaultComponent: RootComponent;
}

export type BottomNavigationProps<
  RootComponent extends React.ElementType = BottomNavigationTypeMap['defaultComponent'],
  AdditionalProps = {},
> = OverrideProps<BottomNavigationTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};


const useUtilityClasses = (ownerState:any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
  };

  return composeClasses(slots, getBottomNavigationUtilityClass, classes);
};

const BottomNavigationRoot = styled('div', {
  name: 'MuxBottomNavigation',
  slot: 'Root',
  overridesResolver: (props, styles) => styles.root,
})(
  memoTheme(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    height: 56,
    backgroundColor: (theme.vars || theme).palette.background.paper,
  })),
);

export const BottomNavigation = React.forwardRef<HTMLElement,BottomNavigationProps>(function BottomNavigation(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxBottomNavigation' });
  const {
    children,
    className,
    component = 'div',
    onChange,
    showLabels = false,
    value,
    ...other
  } = props;

  const ownerState = {
    ...props,
    component,
    showLabels,
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <BottomNavigationRoot
      as={component}
      className={clsx(classes.root, className)}
      ref={ref as any}
      ownerState={ownerState}
      {...other}
    >
      {React.Children.map(children, (child, childIndex) => {
        if (!React.isValidElement(child)) {
          return null;
        }

        if (process.env.NODE_ENV !== 'production') {
          if (isReactFragment(child)) {
            console.error(
              [
                "MUX: The BottomNavigation component doesn't accept a Fragment as a child.",
                'Consider providing an array instead.',
              ].join('\n'),
            );
          }
        }

        const childValue = child.props.value === undefined ? childIndex : child.props.value;

        return React.cloneElement(child, {
          //@ts-ignore
          selected: childValue === value,
          showLabel: child.props.showLabel !== undefined ? child.props.showLabel : showLabels,
          value: childValue,
          onChange,
        });
      })}
    </BottomNavigationRoot>
  );
});
