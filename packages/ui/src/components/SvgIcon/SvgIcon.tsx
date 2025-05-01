import React from "react";
import {
  clsx,
  composeClasses,
  generateUtilityClass,
  generateUtilityClasses,
  memoTheme,
  styled,
  SxComponentProps,
  useMuxDefaultProps,
} from "../../styles";
import { capitalize } from "../../utils";
import { OverridableStringUnion } from "../../props";

const svgIconClasses = generateUtilityClasses("MuiSvgIcon", ["root"]);

export function getSvgIconUtilityClass(slot: string): string {
  return generateUtilityClass("MuiSvgIcon", slot);
}

const useUtilityClasses = (ownerState:any) => {
  const { fontSize, classes } = ownerState;

  const slots = {
    root: [
      "root",
      `fontSize${capitalize(fontSize)}`,
    ],
  };

  return composeClasses(slots, getSvgIconUtilityClass, classes);
};

const SvgIconRoot = styled("svg", {
  name: "MuiSvgIcon",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root,
})(
  memoTheme(({ theme }) => ({
    userSelect: "none",
    width: "1em",
    height: "1em",
    display: "inline-block",
    flexShrink: 0,
    transition: theme.transitions?.create?.("fill", {
      duration: theme.transitions?.duration?.shorter,
    }),
    variants: [
      {
        props: (props:any) => !props.hasSvgAsChild,
        style: {
          // the <svg> will define the property that has `currentColor`
          // for example heroicons uses fill="none" and stroke="currentColor"
          fill: "currentColor",
        },
      },
      {
        props: { fontSize: "inherit" },
        style: { fontSize: "inherit" },
      },
      {
        props: { size: "sm" },
        style: { fontSize: theme.typography?.pxToRem?.(20) || "1.25rem" },
      },
      {
        props: { size: "md" },
        style: { fontSize: theme.typography?.pxToRem?.(24) || "1.5rem" },
      },
      {
        props: { size: "lg" },
        style: { fontSize: theme.typography?.pxToRem?.(35) || "2.1875rem" },
      },
      {
        props: { color: "action" },
        style: { color: (theme.vars ?? theme).palette?.action?.active },
      },
      {
        props: { color: "disabled" },
        style: { color: (theme.vars ?? theme).palette?.action?.disabled },
      },
      {
        props: { color: "inherit" },
        style: { color: undefined },
      },
    ],
  })),
);

export const SvgIcon = React.forwardRef<SVGAElement, SvgIconProps>(
  function SvgIcon(inProps, ref) {
    const props = useMuxDefaultProps({ props: inProps, name: "MuiSvgIcon" });
    let size = props.fontSize || typeof props.size === 'number' ?  undefined : props.size ?? 'md';
    const {
      children,
      className,
      color = "inherit",
      component = "svg",
      fontSize = !size && props.size,
      htmlColor,
      inheritViewBox = false,
      titleAccess,
      viewBox = "0 0 24 24",
      ...other
    } = props;
    
    
    
    const hasSvgAsChild =
      React.isValidElement(children) && children.type === "svg";

    const ownerState = {
      ...props,
      color,
      component,
      fontSize,
      size,
      inheritViewBox,
      viewBox,
      hasSvgAsChild,
    };

    const more: any = {};

    if (!inheritViewBox) {
      more.viewBox = viewBox;
    }

    const classes = useUtilityClasses(ownerState);

    return (
      <SvgIconRoot
        as={component}
        className={clsx(classes.root, className)}
        focusable="false"
        color={htmlColor}
        aria-hidden={titleAccess ? undefined : true}
        role={titleAccess ? "img" : undefined}
        data-ui="Icon"
        ref={ref}
        {...more}
        {...other}
        {...(hasSvgAsChild && children.props)}
        ownerState={ownerState}
      >
        {hasSvgAsChild ? children.props.children : children}
        {titleAccess ? <title>{titleAccess}</title> : null}
      </SvgIconRoot>
    );
  },
);

export interface SvgIconPropsSizeOverrides {}

interface SvgIconOwnerProps extends SxComponentProps<"svg"> {
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<string>;
  /**
   * The fontSize applied to the icon. Defaults to 24px, but can be configure to inherit font size.
   * @default 'medium'
   */
  size?: OverridableStringUnion<
    "inherit" | "lg" | "md" | "sm" ,
    SvgIconPropsSizeOverrides
  > | number;
  /**
   * Applies a color attribute to the SVG element.
   */
  htmlColor?: string;
  /**
   * If `true`, the root node will inherit the custom `component`'s viewBox and the `viewBox`
   * prop will be ignored.
   * Useful when you want to reference a custom `component` and have `SvgIcon` pass that
   * `component`'s viewBox to the root node.
   * @default false
   */
  inheritViewBox?: boolean;
  /**
   * The shape-rendering attribute. The behavior of the different options is described on the
   * [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/shape-rendering).
   * If you are having issues with blurry icons you should investigate this prop.
   */
  shapeRendering?: string;
  /**
   * Provides a human-readable title for the element that contains it.
   * https://www.w3.org/TR/SVG-access/#Equivalent
   */
  titleAccess?: string;
  /**
   * Allows you to redefine what the coordinates without units mean inside an SVG element.
   * For example, if the SVG element is 500 (width) by 200 (height),
   * and you pass viewBox="0 0 50 20",
   * this means that the coordinates inside the SVG will go from the top left corner (0,0)
   * to bottom right (50,20) and each unit will be worth 10px.
   * @default '0 0 24 24'
   */
  viewBox?: string;
}
export interface SvgIconProps extends SvgIconOwnerProps {
  component?: React.ElementType;
}

/**
 * Private module reserved for @mui packages.
 */
export function createSvgIcon(
  path: React.ReactNode,
  displayName: string,
): typeof SvgIcon {
  function Component(props: SvgIconProps, ref: any) {
    return (
      <SvgIcon data-ui="Icon" data-testid={`${displayName}Icon`} ref={ref} {...props}>
        {path}
      </SvgIcon>
    );
  }

  if (process.env.NODE_ENV !== "production") {
    // Need to set `displayName` on the inner component for React.memo.
    // React prior to 16.14 ignores `displayName` on the wrapper.
    Component.displayName = `${displayName}Icon`;
  }

  (Component as any).muiName = (SvgIcon as any).muiName;

  return React.memo(React.forwardRef(Component)) as typeof SvgIcon;
}

export default SvgIcon;