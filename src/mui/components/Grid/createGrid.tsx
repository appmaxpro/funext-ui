import * as React from "react";
import {
  Breakpoint,
  Breakpoints,
  defaultTheme,
  SxThemeProps,
  useMuxDefaultProps,
  composeClasses,
  generateUtilityClass,
  useTheme,
  extendSxProp,
  clsx,
  styled

} from "../../styles";
import { CreateMUIStyled, SystemProps } from "@mui/system";
import { OverridableComponent, OverrideProps } from "../../props";
import {
  generateGridStyles,
  generateGridSizeStyles,
  generateGridColumnsStyles,
  generateGridColumnSpacingStyles,
  generateGridRowSpacingStyles,
  generateGridDirectionStyles,
  generateGridOffsetStyles,
  generateSizeClassNames,
  generateSpacingClassNames,
  generateDirectionClasses,
} from "./gridGenerator";
import {
  GridTypeMap,
  GridOwnerState,
  GridProps,
  GridOffset,
  GridSize,
} from "./GridProps";

//const defaultTheme = createTheme();

// widening Theme to any so that the consumer can own the theme structure.
//@ts-ignore
const defaultCreateStyledComponent = (styled as CreateMUIStyled<any>)(
  "div",
  {
    name: "MuxGrid",
    slot: "Root",
    overridesResolver: (props, styles) => styles.root,
  },
);

function useThemePropsDefault<T extends {}>(props: T) {
  return useMuxDefaultProps({
    props,
    name: "MuxGrid",
  });
}


interface GridContextValue{
  media:boolean;
  containerName?:string
}
const GridContext = React.createContext<GridContextValue>({media:false});

export default function createGrid(
  options: {
    createStyledComponent?: typeof defaultCreateStyledComponent;
    useThemeProps?: typeof useThemePropsDefault;
    componentName?: string;
  } = {},
) {
  const {
    // This will allow adding custom styled fn (for example for custom sx style function)
    createStyledComponent = defaultCreateStyledComponent,
    useThemeProps = useThemePropsDefault,
    componentName = "MuxGrid",
  } = options;

  const useUtilityClasses = (
    ownerState: GridOwnerState,
    theme: typeof defaultTheme,
  ) => {
    const { container, direction, spacing, wrap, size, media } = ownerState;
    const slots = {
      root: [
        "root",
        container && "container",
        (container && media) && "media",
        wrap !== "wrap" && `wrap-xs-${String(wrap)}`,
        ...generateDirectionClasses(direction),
        ...generateSizeClassNames(size),
        ...(container
          ? generateSpacingClassNames(spacing, theme.breakpoints.keys[0])
          : []),
      ],
    };

    return composeClasses(
      slots,
      (slot) => generateUtilityClass(componentName, slot),
      {},
    );
  };

  function parseResponsiveProp<T extends GridSize | GridOffset>(
    propValue: T | null | (T | null)[] | { [key in Breakpoint]?: T | null },
    breakpoints: Breakpoints,
    shouldUseValue: (val: T) => boolean = () => true,
  ): { [key in Breakpoint]: T } {
    const parsedProp = {} as { [key in Breakpoint]: T };

    if (propValue === null) {
      return parsedProp;
    }

    if (Array.isArray(propValue)) {
      propValue.forEach((value, index) => {
        if (
          value !== null &&
          shouldUseValue(value) &&
          breakpoints.keys[index]
        ) {
          parsedProp[breakpoints.keys[index]] = value;
        }
      });
    } else if (typeof propValue === "object") {
      Object.keys(propValue).forEach((key) => {
        const value = propValue[key as Breakpoint];
        if (value !== null && value !== undefined && shouldUseValue(value)) {
          parsedProp[key as Breakpoint] = value;
        }
      });
    } else {
      parsedProp[breakpoints.keys[0]] = propValue;
    }

    return parsedProp;
  }

  const GridRoot = createStyledComponent<{
    ownerState: GridOwnerState;
  }>(
    generateGridColumnsStyles,
    generateGridColumnSpacingStyles,
    generateGridRowSpacingStyles,
    generateGridSizeStyles,
    generateGridDirectionStyles,
    generateGridStyles,
    generateGridOffsetStyles,
  );

  const Grid = React.forwardRef<HTMLDivElement, GridProps>(function Grid(inProps, ref) {
    const theme = useTheme();
    const themeProps = useThemeProps<
      typeof inProps & { component?: React.ElementType }
    >(inProps);
    const props = extendSxProp(themeProps) as Omit<typeof themeProps, "color"> &
      GridOwnerState; // `color` type conflicts with html color attribute.
    
    const {media:parentMedia, containerName:parentContainerName} = React.useContext(GridContext);
    
    const {
      className,
      children,
      columns: columnsProp = 12,
      container = false,
      component = "div",
      direction = "row",
      wrap = "wrap",
      size: sizeProp = {},
      offset: offsetProp = {},
      spacing: spacingProp = 0,
      rowSpacing: rowSpacingProp = spacingProp,
      columnSpacing: columnSpacingProp = spacingProp,
      unstable_level: level = 0,
      media = parentMedia || container,
      containerName = parentContainerName,
      ...other
    } = props;
    const size = parseResponsiveProp<GridSize>(
      sizeProp,
      theme.breakpoints,
      (val) => val !== false,
    );
    const offset = parseResponsiveProp<GridOffset>(
      offsetProp,
      theme.breakpoints,
    );

    const columns = inProps.columns ?? (level ? undefined : columnsProp);
    const spacing = inProps.spacing ?? (level ? undefined : spacingProp);
    const rowSpacing =
      inProps.rowSpacing ??
      inProps.spacing ??
      (level ? undefined : rowSpacingProp);
    const columnSpacing =
      inProps.columnSpacing ??
      inProps.spacing ??
      (level ? undefined : columnSpacingProp);
    const ownerState = {
      ...props,
      level,
      columns,
      container,
      direction,
      wrap,
      spacing,
      rowSpacing,
      columnSpacing,
      size,
      offset,
      media
    };

    const classes = useUtilityClasses(ownerState, theme);
    const items = (
      
      <GridRoot
        ref={ref}
        as={component}
        ownerState={ownerState}
        className={clsx(classes.root, className)}
        {...other}
      >
        {React.Children.map(children, (child) => {
          if (
            React.isValidElement<{ container?: unknown }>(child) &&
            ((child as any).type === Grid) &&
            container &&
            child.props.container
          ) {
            return React.cloneElement(child, {
              unstable_level:
                (child.props as GridProps)?.unstable_level ?? level + 1,
            } as GridProps);
          }
          return child;
        })}
      </GridRoot>
    );

    return container 
       ? <GridContext.Provider value={{media, containerName}}>{items}</GridContext.Provider>
       : items
  }) as OverridableComponent<GridTypeMap>;

  // @ts-ignore internal logic for nested grid
  Grid.muiName = "Grid";

  return Grid;
}
