import * as React from "react";

import {
  clsx,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxThemeProps,
  useMuxDefaultProps,
  useSlot,
} from "../../styles";
import {
  CreateSlotsAndSlotProps,
  OverridableStringUnion,
  OverrideProps,
  SlotProps,
} from "../../props";
import type { AlertProps } from "../Alert";
import { cn } from "../../utils/cn";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";
// context
import { useTailwindTheme } from "../../theme";
import { mapThemeColor } from "../../hooks";
export interface AvatarClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the root element if not `src` or `srcSet`. */
  colorDefault: string;
  /** Styles applied to the root element if `variant="circular"`. */
  circular: string;
  /** Styles applied to the root element if `variant="rounded"`. */
  rounded: string;
  /** Styles applied to the root element if `variant="square"`. */
  square: string;
  /** Styles applied to the img element if either `src` or `srcSet` is defined. */
  img: string;
  /** Styles applied to the fallback icon */
  fallback: string;
}

export type AvatarClassKey = keyof AvatarClasses;

export function getAvatarUtilityClass(slot: string): string {
  return generateUtilityClass("MuxAvatar", slot);
}

export const avatarClasses: AvatarClasses = generateUtilityClasses(
  "MuxAvatar",
  ["root", "colorDefault", "circular", "rounded", "square", "img", "fallback"],
);

export interface AvatarSlots {
  /**
   * The component that renders the transition.
   * [Follow this guide](https://mui.com/material-ui/transitions/#transitioncomponent-prop) to learn more about the requirements for this component.
   * @default Collapse
   */
  img: React.JSXElementConstructor<React.ImgHTMLAttributes<HTMLImageElement>>;
}

export interface AvatarPropsVariantOverrides {}

export type AvatarSlotsAndSlotProps = CreateSlotsAndSlotProps<
  AvatarSlots,
  {
    img: SlotProps<
      React.ElementType<React.ImgHTMLAttributes<HTMLImageElement>>,
      {},
      AvatarOwnProps
    >;
  }
>;

export interface AvatarOwnProps {
  /**
   * Used in combination with `src` or `srcSet` to
   * provide an alt attribute for the rendered `img` element.
   */
  alt?: string;
  /**
   * Used to render icon or text elements inside the Avatar if `src` is not set.
   * This can be an element, or just a string.
   */
  children?: React.ReactNode;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<AvatarClasses>;
  /**
   * [Attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#attributes) applied to the `img` element if the component is used to display an image.
   * It can be used to listen for the loading error event.
   * @deprecated Use `slotProps.img` instead. This prop will be removed in v7. See [Migrating from deprecated APIs](/material-ui/migration/migrating-from-deprecated-apis/) for more details.
   */
  imgProps?: React.ImgHTMLAttributes<HTMLImageElement> & {
    sx?: SxThemeProps;
  };
  Img?: React.ComponentType<React.ImgHTMLAttributes<HTMLImageElement> & {sx?: SxThemeProps}>;
  /**
   * The `sizes` attribute for the `img` element.
   */
  sizes?: string;
  /**
   * The `src` attribute for the `img` element.
   */
  src?: string;
  /**
   * The `srcSet` attribute for the `img` element.
   * Use this attribute for responsive image display.
   */
  srcSet?: string;
  /**
   * The system prop that allows defining system overrides as well as additional CSS styles.
   */
  sx?: SxThemeProps;
  /**
   * The shape of the avatar.
   * @default 'circular'
   */
  shape?: OverridableStringUnion<
    "circular" | "rounded" | "square",
    AvatarPropsVariantOverrides
  >;

  /**
   * This file contains the types and prop-types for Button and IconButton component.
   */

  // typescript types
  variant: AlertProps["variant"];
  color: AlertProps["color"];
}

export interface AvatarTypeMap<
  AdditionalProps = {},
  RootComponent extends React.ElementType = "div",
> {
  props: AdditionalProps & AvatarOwnProps & AvatarSlotsAndSlotProps;
  defaultComponent: RootComponent;
}

/**
 *
 * Demos:
 *
 * - [Avatar](https://mui.com/material-ui/react-avatar/)
 *
 * API:
 *
 * - [Avatar API](https://mui.com/material-ui/api/avatar/)
 */

export type AvatarProps<
  RootComponent extends React.ElementType = AvatarTypeMap["defaultComponent"],
  AdditionalProps = {},
> = OverrideProps<
  AvatarTypeMap<AdditionalProps, RootComponent>,
  RootComponent
> & {
  component?: React.ElementType;
};

const useUtilityClasses = (ownerState: any) => {
  const { classes, variant, shape, colorDefault, color } = ownerState;

  const slots = {
    root: ["root", variant, shape, color, colorDefault && "colorDefault"],
    img: ["img"],
    fallback: ["fallback"],
  };

  return composeClasses(slots, getAvatarUtilityClass, classes);
};

const AvatarRoot = styled("div", {
  name: "MuxAvatar",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[ownerState.variant],
      ownerState.colorDefault && styles.colorDefault,
    ];
  },
})(
  memoTheme(({ theme }) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    width: 40,
    height: 40,
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.pxToRem(20),
    lineHeight: 1,
    borderRadius: "50%",
    overflow: "hidden",
    userSelect: "none",
    variants: [
      {
        props: { shape: "rounded" },
        style: {
          borderRadius: (theme.vars || theme).shape.borderRadius,
        },
      },
      {
        props: { shape: "square" },
        style: {
          borderRadius: 0,
        },
      },
      {
        props: { colorDefault: true },
        style: {
          color: (theme.vars || theme).palette.background.default,
          ...(theme.vars
            ? {
                backgroundColor: theme.vars.palette.Avatar.defaultBg,
              }
            : {
                backgroundColor: theme.palette.grey[400],
                ...theme.applyStyles("dark", {
                  backgroundColor: theme.palette.grey[600],
                }),
              }),
        },
      },
    ],
  })),
);

const AvatarImg = styled("img", {
  name: "MuxAvatar",
  slot: "Img",
  overridesResolver: (props, styles) => styles.img,
})({
  width: "100%",
  height: "100%",
  textAlign: "center",
  // Handle non-square image.
  objectFit: "cover",
  // Hide alt text.
  color: "transparent",
  // Hide the image broken icon, only works on Chrome.
  textIndent: 10000,
});

const AvatarFallbackRoot = styled("div", {
  name: "MuxAvatar",
  slot: "Fallback",
  overridesResolver: (props, styles) => styles.fallback,
})({
  width: "75%",
  height: "75%",
});

const AvatarFallback = ({
  ownerState,
  className,
  icon,
}: {
  ownerState: any;
  className?: string;
  icon:React.ReactNode;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <AvatarFallbackRoot ownerState={ownerState} className={className} ref={ref}>
      {icon}
    </AvatarFallbackRoot>
  );
};

function useLoaded({ crossOrigin, referrerPolicy, src, srcSet }: any) {
  const [loaded, setLoaded] = React.useState<string | boolean>(false);

  React.useEffect(() => {
    if (!src && !srcSet) {
      return undefined;
    }

    setLoaded(false);

    let active = true;
    const image = new Image();
    image.onload = () => {
      if (!active) {
        return;
      }
      setLoaded("loaded");
    };
    image.onerror = () => {
      if (!active) {
        return;
      }
      setLoaded("error");
    };
    image.crossOrigin = crossOrigin;
    image.referrerPolicy = referrerPolicy;
    image.src = src;
    if (srcSet) {
      image.srcset = srcSet;
    }

    return () => {
      active = false;
    };
  }, [crossOrigin, referrerPolicy, src, srcSet]);

  return loaded;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  function Avatar(inProps, ref) {
    const props = useMuxDefaultProps({ props: inProps, name: "MuxAvatar" });
    const {
      alt,
      children: childrenProp,
      className,
      component = "div",
      slots = {},
      slotProps = {},
      imgProps,
      sizes,
      src,
      srcSet,
      shape = "circular",
      variant = "filled",
      color: colorProps,
      Img = AvatarImg,
      ...other
    } = props;

    let children: any = null;
    const { alert } = useTailwindTheme();
    const { valid, defaultProps, styles } = alert;
    const { base, variants } = styles;
    // Use a hook instead of onError on the img element to support server-side rendering.
    const loaded = useLoaded({ ...imgProps, src, srcSet });
    const hasImg = src || srcSet;
    const hasImgNotFailing = hasImg && loaded !== "error";

    const color = mapThemeColor(colorProps);

    const variantColorMap = color
      ? variants[findMatch(valid.variants, variant, "filled")][
          findMatch(valid.colors, color, "primary")
        ]
      : null;

    const cnClassName = cn(objectsToString(variantColorMap), className);

    const ownerState = {
      ...props,
      colorDefault: !hasImgNotFailing && !variantColorMap,
      component,
      shape,
      variant,
      color
    };
    // This issue explains why this is required: https://github.com/mui/material-ui/issues/42184
    //@ts-ignore
    delete ownerState.ownerState;

    const classes = useUtilityClasses(ownerState);

    const [ImgSlot, imgSlotProps] = useSlot("img", {
      className: classes.img,
      elementType: AvatarImg,
      externalForwardedProps: {
        slots,
        //@ts-ignore
        slotProps: { img: { ...imgProps, ...slotProps.img } },
      },
      additionalProps: { alt, src, srcSet, sizes },
      ownerState,
    });

    if (hasImgNotFailing) {
      children = <ImgSlot {...imgSlotProps} as={Img}/>;
      // We only render valid children, non valid children are rendered with a fallback
      // We consider that invalid children are all falsy values, except 0, which is valid.
    } else if (!!childrenProp || childrenProp === 0) {
      children = childrenProp;
    } else if (hasImg && alt) {
      children = alt[0];
    } else {
      children = (
        <AvatarFallback
          ownerState={ownerState}
          className={classes.fallback}
          icon="person"
        />
      );
    }

    return (
      <AvatarRoot
        as={component}
        className={clsx(classes.root, cnClassName)}
        ref={ref}
        {...other}
        ownerState={ownerState}
      >
        {children}
      </AvatarRoot>
    );
  },
);
export default Avatar