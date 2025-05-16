import {
  capitalize,
  clsx,
  composeClasses,
  generateUtilityClass,
  memoTheme,
  Panel,
  styled,
  getAnimationOrName,
  type PanelProps,
  type SxComponentProps,
  type Theme,
} from "@funext/ui";
import React from "react";

export interface ToolbarProps extends SxComponentProps {
  /**
   * The Toolbar children, usually a mixture of `IconButton`, `Button` and `Typography`.
   * The Toolbar is a flex container, allowing flex item properties to be used to lay out the children.
   */
  children?: React.ReactNode;
  /**
   * If `true`, set gutter padding.
   * @default true
   */
  gutters?: boolean;
  /**
   * The variant to use.
   * @default 'regular'
   */
  variant?: "regular" | "dense";
}

const ToolbarRoot = styled("div", {
  name: "MuxToolbar",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      !ownerState.gutters && styles.gutters,
      styles[ownerState.variant],
    ];
  },
})(
  memoTheme(({ theme }: { theme: Theme }) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    variants: [
      {
        props: {
          gutters: true,
        },
        style: {
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          [theme.breakpoints.up("sm")]: {
            paddingLeft: theme.spacing(6),
            paddingRight: theme.spacing(6),
          },
        },
      },
      {
        props: {
          variant: "dense",
        },
        style: {
          minHeight: 48,
        },
      },
      {
        props: {
          variant: "regular",
        },
        style: theme.mixins.toolbar,
      },
    ],
  })),
);

export function getToolbarUtilityClass(slot: string): string {
  return generateUtilityClass("MuxToolbar", slot);
}

const useToolbarUtilityClasses = (ownerState: ToolbarProps) => {
  const { gutters, variant, classes } = ownerState;

  const slots = {
    root: [
      "root",
      gutters && 'gutters',
      variant ,
    ],
  };

  return composeClasses(slots, getToolbarUtilityClass, classes);
};

const Toolbar: React.FC<ToolbarProps> = React.forwardRef(
  function Toolbar(props, ref) {
    //const props = useMuxDefaultProps({ props: inProps, name: 'MuiToolbar' });
    const {
      component = "div",
      gutters = true,
      variant = "regular",
      className,
      ...other
    } = props;

    const ownerState = {
      ...props,
      component,
      gutters,
      variant,
    };

    const classes = useToolbarUtilityClasses(ownerState);

    return (
      <ToolbarRoot
        as={component}
        className={clsx(classes.root, className)}
        ref={ref as any}
        ownerState={ownerState}
        {...other}
      />
    );
  },
);

export interface AppBarProps extends PanelProps {
  /**
   * If true, the `color` prop is applied in dark mode.
   * @default false
   */
  enableColorOnDark?: boolean;
  /**
   * The positioning type. The behavior of the different options is described
   * [in the MDN web docs](https://developer.mozilla.org/en-US/docs/Web/CSS/position).
   * Note: `sticky` is not universally supported and will fall back to `static` when unavailable.
   * @default 'static'
   */
  position?: "fixed" | "absolute" | "sticky" | "static" | "relative";
}

const AppBarRoot = styled(Panel, {
  name: "MuxAppBar",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;

    return [
      styles.root,
      styles[`position${capitalize(ownerState.position)}`],
      styles[`color${capitalize(ownerState.color)}`],
    ];
  },
})(
  memoTheme(({ theme }: { theme: Theme }) => ({
    display: "flex",
    flexDirection: "column",
    width: "100%",
    boxSizing: "border-box", // Prevent padding issue with the Modal and fixed positioned AppBar.
    flexShrink: 0,
    zIndex: theme?.zIndex.appBar,
    ...Object.entries(theme.palette)
      .filter(
        ([, palette]) =>
          palette && palette.main && palette.dark && palette.contrastText,
      )
      .map(([color, __]) => ({
        [`&[data-tone="${color}"]`]: {
          "--app-bar-background": `var(--${color})`,
          "--app-bar-color": `var(--${color}-, #fff)`,
        },
      })).reduce((prev, next) => ({...prev, ...next}), {}) ,

    [`&[data-tone="inherit"]`]: {
      "--app-bar-color": `inherit`,
    },
    [`&[data-tone="default"]`]: {
      "--app-bar-background": `var(--color-gray-100)`,
      "--app-bar-color": `var(--color-gray-900)`,
      ...theme.applyStyles("dark", {
        "--app-bar-background": `var(--color-gray-900)`,
        "--app-bar-color": `var(--color-gray-100)`,
      }),
    },
    [`&[data-tone="transparent"]`]: {
      "--app-bar-background": `transparent`,
      "--app-bar-color": `inherit`,
      ...theme.applyStyles("dark", {
        backgroundImage: `none`,
      }),
    },
    ...["fixed", "absolute", "sticky"].map((pos) => ({
      [`&[data-pos="${pos}"]`]: {
        position: pos,
        zIndex: (theme.vars || theme).zIndex.appBar,
        top: 0,
        left: "auto",
        right: 0,
      },
    })).reduce((prev, next) => ({...prev, ...next}), {}) ,
    [`&[data-pos="relative"]`]: {
      position: "relative",
    },
    [`&[data-pos="static"]`]: {
      position: "static",
    },
  })),
  (props: any) =>
    props.enableColorOnDark === true &&
    !["inherit", "transparent"].includes(props.color)
      ? {
          backgroundColor: "var(--app-bar-background)",
          color: "var(--app-bar-color)",
        }
      : "",
  (props: any) =>
    props.enableColorOnDark === false &&
    !["inherit", "transparent"].includes(props.color)
      ? {
          backgroundColor: "var(--app-bar-background)",
          color: "var(--app-bar-color)",
        }
      : "",

  {
    backgroundColor: "var(--app-bar-background)",
    color: "var(--app-bar-color)",
  },
  getAnimationOrName('slideFadeIn')
);

export function getAppBarUtilityClass(slot: string): string {
  return generateUtilityClass("MuxAppBar", slot);
}

const useAppBarUtilityClasses = (ownerState: AppBarProps) => {
  const { color, position, classes } = ownerState;

  const slots = {
    root: [
      "root",
      `color${capitalize(color)}`,
      `position${capitalize(position)}`,
    ],
  };

  return composeClasses(slots, getAppBarUtilityClass, classes);
};

const AppBar: React.FC<AppBarProps> = React.forwardRef(
  function AppBar(props, ref) {
    //const props = useDefaultProps({ props: inProps, name: 'MuiAppBar' });
    const {
      className,
      color = "primary",
      enableColorOnDark = false,
      position = "absolute",
      ...other
    } = props;

    const ownerState = {
      ...props,
      color,
      position,
      enableColorOnDark,
    };

    const classes = useAppBarUtilityClasses(ownerState);

    return (
      <AppBarRoot
        square
        component="header"
        ownerState={ownerState}
        elevation={4}
        data-ui="AppBar"
        data-pos={position}
        data-tone={color}
        fill
        className={clsx(
          classes.root,
          {
            "mux-fixed": position === "fixed", // Useful for the Dialog
          },
          className,
        )}
        ref={ref}
        {...other}
      />
    );
  },
) as React.FC<AppBarProps>;

export { Toolbar, AppBar };
