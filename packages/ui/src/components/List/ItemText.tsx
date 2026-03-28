import * as React from "react";
import { generateUtilityClasses, generateUtilityClass } from "../../styles";
import {
  SxThemeProps,
  styled,
  composeClasses,
  useMuxDefaultProps,
  clsx,
  memoTheme,
} from "../../styles";

import {
  CreateSlotsAndSlotProps,
  OverridableComponent,
  OverrideProps,
  SlotProps,
  StandardProps,
} from "../../theme/tw/props";
import { Text, TextProps } from "../Text";
import textClasses from "../Text/textClasses";
import { useListContext } from "./ListContext";
import { isReactComponent } from "../../utils";
import { EMPTY_RECORD } from "../../lib/constants";

export interface ListItemTextClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the Text component if primary and secondary are set. */
  multiline: string;
  /** Styles applied to the Text component if dense. */
  dense: string;
  /** Styles applied to the root element if `inset={true}`. */
  inset: string;
  /** Styles applied to the primary `Text` component. */
  primary: string;
  /** Styles applied to the secondary `Text` component. */
  secondary: string;
}

export type ListItemTextClassKey = keyof ListItemTextClasses;

export function getListItemTextUtilityClass(slot: string): string {
  return generateUtilityClass("MuxListItemText", slot);
}

export const listItemTextClasses: ListItemTextClasses = generateUtilityClasses(
  "MuxListItemText",
  ["root", "multiline", "dense", "inset", "primary", "secondary"],
);

export interface ListItemTextSlots {
  /**
   * The component that renders the primary slot.
   * @default Text
   */
  primary?: React.ElementType;
  /**
   * The component that renders the secondary slot.
   * @default Text
   */
  secondary?: React.ElementType;
}

export type ListItemTextSlotsAndSlotProps = CreateSlotsAndSlotProps<
  ListItemTextSlots,
  {
    /**
     * Props forwared to the primary slot (as long as disableText is not `true`)
     * By default, the available props are based on the [Text](https://mui.com/material-ui/api/typography/#props) component
     */
    primary: SlotProps<
      React.ElementType<TextProps>,
      {},
      ListItemTextOwnerState
    >;
    /**
     * Props forwarded to the secondary slot (as long as disableText is not `true`)
     * By default, the available props are based on the [Text](https://mui.com/material-ui/api/typography/#props) component
     */
    secondary: SlotProps<
      React.ElementType<TextProps>,
      {},
      ListItemTextOwnerState
    >;
  }
>;

export interface ListItemTextOwnerState extends ListItemTextProps {}

export interface ListItemTextProps<
  PrimaryTextComponent extends React.ElementType = "span",
  SecondaryTextComponent extends React.ElementType = "p",
> extends StandardProps<React.HTMLAttributes<HTMLDivElement>, ListItemTextClassKey>,
    ListItemTextSlotsAndSlotProps {
  /**
   * Alias for the `primary` prop.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<ListItemTextClasses>;
  /**
   * If `true`, the children won't be wrapped by a Text component.
   * This can be useful to render an alternative Text variant by wrapping
   * the `children` (or `primary`) text, and optional `secondary` text
   * with the Text component.
   * @default false
   */
  disableText?: boolean;
  /**
   * If `true`, the children are indented.
   * This should be used if there is no left avatar or left icon.
   * @default false
   */
  inset?: boolean;
  /**
   * The main content element.
   */
  primary?: React.ReactNode;

  /**
   * The secondary content element.
   */
  secondary?: React.ReactNode;

  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;

  dense?: boolean;
}
const useUtilityClasses = (ownerState:any) => {
  const { classes, inset, primary, secondary, dense } = ownerState;

  const slots = {
    root: ['root', inset && 'inset', dense && 'dense', primary && secondary && 'multiline'],
    primary: ['primary'],
    secondary: ['secondary'],
  };

  return composeClasses(slots, getListItemTextUtilityClass, classes);
};

const ListItemTextRoot = styled('div', {
  name: 'MuxListItemText',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      { [`& .${listItemTextClasses.primary}`]: styles.primary },
      { [`& .${listItemTextClasses.secondary}`]: styles.secondary },
      styles.root,
      ownerState.inset && styles.inset,
      ownerState.primary && ownerState.secondary && styles.multiline,
      ownerState.dense && styles.dense,
    ];
  },
})({
  flex: '1 1 auto',
  minWidth: 0,
  marginTop: 4,
  marginBottom: 4,
  [`.${textClasses.root}:where(& .${listItemTextClasses.primary})`]: {
    display: 'block',
  },
  [`.${textClasses.root}:where(& .${listItemTextClasses.secondary})`]: {
    display: 'block',
  },
  variants: [
    {
      props: ({ ownerState }) => ownerState.primary && ownerState.secondary,
      style: {
        marginTop: 6,
        marginBottom: 6,
      },
    },
    {
      props: ({ ownerState }) => ownerState.inset,
      style: {
        paddingLeft: 56,
      },
    },
  ],
});

export const ListItemText = React.forwardRef<HTMLDivElement, ListItemTextProps>(function ListItemText(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxListItemText' });
  const {
    children,
    className,
    disableText = false,
    inset = false,
    primary: primaryProp,
    secondary: secondaryProp,
    slots = EMPTY_RECORD,
    slotProps = EMPTY_RECORD,
    dense,
    ...other
  } = props;


  //const { dense } = useListContext()!;

  let primary = primaryProp != null ? primaryProp : children;
  let secondary = secondaryProp;

  const ownerState = {
    ...props,
    disableText,
    inset,
    primary: !!primary,
    secondary: !!secondary,
    dense,
  };

  const classes = useUtilityClasses(ownerState);


  if (primary != null && (!isReactComponent(primary) || (primary as any).type !== Text) && !disableText) {
    primary = (
      <Text
        variant={dense ? 'body2' : 'body1'}
        component='span'
        className={listItemTextClasses.primary}
      >
        {primary}
      </Text>
    );
  }

  if (secondary != null && (!isReactComponent(secondary) || (secondary as any).type !== Text) && !disableText) {
    secondary = (
      <Text variant="body2" color="textSecondary" className={listItemTextClasses.secondary}>
        {secondary}
      </Text>
    );
  }

  return (
    <ListItemTextRoot
      className={clsx(classes.root, className)}
      ownerState={ownerState}
      ref={ref as any}
      {...other}
    >
      {primary}
      {secondary}
    </ListItemTextRoot>
  );
});

export default ListItemText;
