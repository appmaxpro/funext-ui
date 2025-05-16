import { clsx, composeClasses, generateUtilityClass, generateUtilityClasses, styled, SxThemeProps, useMuxDefaultProps } from '../../styles';
import { OverridableComponent, OverrideProps } from '../../theme/tw/props';
import React from 'react';
import { isReactComponent } from '../../utils';


export interface CardMediaClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if `component="video, audio, picture, iframe, or img"`. */
  media: string;
  /** Styles applied to the root element if `component="picture or img"`. */
  img: string;
}

export type CardMediaClassKey = keyof CardMediaClasses;

export function getCardMediaUtilityClass(slot: string): string {
  return generateUtilityClass('MuxCardMedia', slot);
}

export const cardMediaClasses: CardMediaClasses = generateUtilityClasses('MuxCardMedia', [
  'root',
  'media',
  'img',
]);



export interface CardMediaOwnProps {
  /**
   * The content of the component.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<CardMediaClasses>;
  /**
   * Image to be displayed as a background image.
   * Either `image` or `src` prop must be specified.
   * Note that caller must specify height otherwise the image will not be visible.
   */
  image?: string;
  /**
   * An alias for `image` property.
   * Available only with media components.
   * Media components: `video`, `audio`, `picture`, `iframe`, `img`.
   */
  src?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
}

export interface CardMediaTypeMap<AdditionalProps, RootComponent extends React.ElementType> {
  props: AdditionalProps & CardMediaOwnProps;
  defaultComponent: RootComponent;
}


export type CardMediaProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = {},
> = OverrideProps<CardMediaTypeMap<AdditionalProps, RootComponent>, RootComponent> & {
  component?: React.ElementType;
};

const useUtilityClasses = (ownerState:any) => {
  const { classes, isMediaComponent, isImageComponent } = ownerState;

  const slots = {
    root: ['root', isMediaComponent && 'media', isImageComponent && 'img'],
  };

  return composeClasses(slots, getCardMediaUtilityClass, classes);
};

const CardMediaRoot = styled('div', {
  name: 'MuxCardMedia',
  slot: 'Root',
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { isMediaComponent, isImageComponent } = ownerState;

    return [styles.root, isMediaComponent && styles.media, isImageComponent && styles.img];
  },
})({
  display: 'block',
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  variants: [
    {
      props: { isMediaComponent: true },
      style: {
        width: '100%',
      },
    },
    {
      props: { isImageComponent: true },
      style: {
        objectFit: 'cover',
      },
    },
  ],
});

const MEDIA_COMPONENTS = ['video', 'audio', 'picture', 'iframe', 'img'];
const IMAGE_COMPONENTS = ['picture', 'img'];

export const CardMedia = React.forwardRef<HTMLElement, CardMediaProps>(function CardMedia(inProps, ref) {
  const props = useMuxDefaultProps({ props: inProps, name: 'MuxCardMedia' });
  const { children, className, component = 'div', image, src, style, ...other } = props;

  const muxImg = isReactComponent(component) ? (component as any).muxName === 'Img' : false;
  const isMediaComponent = muxImg || MEDIA_COMPONENTS.includes(component as any);

  const composedStyle =
    !isMediaComponent && image ? { backgroundImage: `url("${image}")`, ...style } : style;

  const ownerState = {
    ...props,
    component,
    isMediaComponent,
    isImageComponent: muxImg || IMAGE_COMPONENTS.includes(component as any),
  };

  const classes = useUtilityClasses(ownerState);

  return (
    <CardMediaRoot
      className={clsx(classes.root, className)}
      as={component}
      role={!isMediaComponent && image ? 'img' : undefined}
      ref={ref as any}
      style={composedStyle}
      ownerState={ownerState}
      // @ts-ignore
      src={isMediaComponent ? image || src : undefined}
      {...other}
    >
      {children}
    </CardMediaRoot>
  );
});
