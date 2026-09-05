import React from "react";
import { SxComponentProps, SxThemeProps, clsx, composeClasses, generateUtilityClass, generateUtilityClasses, styled, useMuxDefaultProps } from "../../styles";
import { OverrideProps, OverridableComponent } from "../../props";
import { TextProps, Text } from "../Text";
import textClasses from "../Text/textClasses";


export interface CardHeaderClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the avatar element. */
  avatar: string;
  /** Styles applied to the action element. */
  action: string;
  /** Styles applied to the content wrapper element. */
  content: string;
  /** Styles applied to the title Text element. */
  title: string;
  /** Styles applied to the subheader Text element. */
  subheader: string;
}

export type CardHeaderClassKey = keyof CardHeaderClasses;

export function getCardHeaderUtilityClass(slot: string): string {
  return generateUtilityClass('MuxCardHeader', slot);
}

const cardHeaderClasses: CardHeaderClasses = generateUtilityClasses('MuxCardHeader', [
  'root',
  'avatar',
  'action',
  'content',
  'title',
  'subheader',
]);

export interface CardHeaderOwnProps<
  TitleTextComponent extends React.ElementType = 'span',
  SubheaderTextComponent extends React.ElementType = 'span',
> {
  /**
   * The action to display in the card header.
   */
  action?: React.ReactNode;
  /**
   * The Avatar element to display.
   */
  avatar?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CardHeaderClasses>;
  /**
   * If `true`, `subheader` and `title` won't be wrapped by a Text component.
   * This can be useful to render an alternative Text variant by wrapping
   * the `title` text, and optional `subheader` text
   * with the Text component.
   * @default false
   */
  disableText?: boolean;
  /**
   * The content of the component.
   */
  subheader?: React.ReactNode;
  /**
   * These props will be forwarded to the subheader
   * (as long as disableText is not `true`).
   */
  subheaderProps?: TextProps<
    SubheaderTextComponent,
    {
      component?: SubheaderTextComponent;
    }
  >;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The content of the component.
   */
  title?: React.ReactNode;
  /**
   * These props will be forwarded to the title
   * (as long as disableText is not `true`).
   */
  titleProps?: TextProps<
  TitleTextComponent,
    {
      component?: TitleTextComponent;
    }
  >;
}

export interface CardHeaderTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = 'div',
  TitleTextComponent extends React.ElementType = 'span',
  SubheaderTextComponent extends React.ElementType = 'span',
> {
  props: AdditionalProps &
    CardHeaderOwnProps<TitleTextComponent, SubheaderTextComponent>;
  defaultComponent: RootComponent;
}


export interface OverridableCardHeader extends OverridableComponent<CardHeaderTypeMap> {
  <
    RootComponent extends React.ElementType = CardHeaderTypeMap['defaultComponent'],
    AdditionalProps = {},
    TitleTextComponent extends React.ElementType = 'span',
    SubheaderTextComponent extends React.ElementType = 'span',
  >(
    props: CardHeaderPropsWithComponent<
      RootComponent,
      AdditionalProps,
      TitleTextComponent,
      SubheaderTextComponent
    >,
  ): React.JSX.Element;
}

export type CardHeaderProps<
  RootComponent extends React.ElementType = CardHeaderTypeMap['defaultComponent'],
  AdditionalProps = {},
  TitleTextComponent extends React.ElementType = 'span',
  SubheaderTextComponent extends React.ElementType = 'span',
> = OverrideProps<
  CardHeaderTypeMap<
    AdditionalProps,
    RootComponent,
    TitleTextComponent,
    SubheaderTextComponent
  >,
  RootComponent
>;

export type CardHeaderPropsWithComponent<
  RootComponent extends React.ElementType = CardHeaderTypeMap['defaultComponent'],
  AdditionalProps = {},
  TitleTextComponent extends React.ElementType = 'span',
  SubheaderTextComponent extends React.ElementType = 'span',
> = {
  /**
   * The component used for the root node.
   * Either a string to use a HTML element or a component.
   */
  component?: RootComponent;
} & CardHeaderProps<
  RootComponent,
  AdditionalProps,
  TitleTextComponent,
  SubheaderTextComponent
>;


const useUtilityClasses = (ownerState:any) => {
  const { classes } = ownerState;

  const slots = {
    root: ['root'],
    avatar: ['avatar'],
    action: ['action'],
    content: ['content'],
    title: ['title'],
    subheader: ['subheader'],
  };

  return composeClasses(slots, getCardHeaderUtilityClass, classes);
};

const CardHeaderRoot = styled('div', {
  name: 'MuxCardHeader',
  slot: 'Root',
  overridesResolver: (props, styles) => ({
    [`& .${cardHeaderClasses.title}`]: styles.title,
    [`& .${cardHeaderClasses.subheader}`]: styles.subheader,
    ...(styles.root as any),
  }),
})({
  display: 'flex',
  alignItems: 'center',
  padding: 16,
});

const CardHeaderAvatar = styled('div', {
  name: 'MuxCardHeader',
  slot: 'Avatar',
  overridesResolver: (props, styles) => styles.avatar,
})({
  display: 'flex',
  flex: '0 0 auto',
  marginRight: 16,
});

const CardHeaderAction = styled('div', {
  name: 'MuxCardHeader',
  slot: 'Action',
  overridesResolver: (props, styles) => styles.action,
})({
  flex: '0 0 auto',
  alignSelf: 'flex-start',
  marginTop: -4,
  marginRight: -8,
  marginBottom: -4,
});

const CardHeaderContent = styled('div', {
  name: 'MuxCardHeader',
  slot: 'Content',
  overridesResolver: (props, styles) => styles.content,
})({
  flex: '1 1 auto',
  [`.${textClasses.root}:where(& .${cardHeaderClasses.title})`]: {
    display: 'block',
  },
  [`.${textClasses.root}:where(& .${cardHeaderClasses.subheader})`]: {
    display: 'block',
  },
});

export const CardHeader = React.forwardRef<HTMLElement, CardHeaderPropsWithComponent>(function CardHeader(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxCardHeader' });
  const {
    action,
    avatar,
    className,
    component = 'div',
    disableText = false,
    subheader: subheaderProp,
    subheaderProps,
    title: titleProp,
    titleProps,
    ...other
  } = props;

  const ownerState = {
    ...props,
    component,
    disableText,
  };

  const classes = useUtilityClasses(ownerState);

  let title = titleProp;
  if (title != null && (title as any).type !== Text && !disableText) {
    title = (
      <Text
        variant={avatar ? 'body2' : 'h5'}
        className={classes.title}
        component="span"
        {...titleProps}
      >
        {title}
      </Text>
    );
  }

  let subheader = subheaderProp;
  if (subheader != null && (subheader as any).type !== Text && !disableText) {
    subheader = (
      <Text
        variant={avatar ? 'body2' : 'body1'}
        className={classes.subheader}
        color="textSecondary"
        component="span"
        {...subheaderProps}
      >
        {subheader}
      </Text>
    );
  }

  return (
    <CardHeaderRoot
      className={clsx(classes.root, className)}
      as={component}
      ref={ref as any}
      ownerState={ownerState}
      {...other}
    >
      {avatar && (
        <CardHeaderAvatar className={classes.avatar} ownerState={ownerState}>
          {avatar}
        </CardHeaderAvatar>
      )}

      <CardHeaderContent className={classes.content} ownerState={ownerState}>
        {title}
        {subheader}
      </CardHeaderContent>
      {action && (
        <CardHeaderAction className={classes.action} ownerState={ownerState}>
          {action}
        </CardHeaderAction>
      )}
    </CardHeaderRoot>
  );
});

CardHeader.displayName = "Mux.CardHeader";

export default CardHeader;
