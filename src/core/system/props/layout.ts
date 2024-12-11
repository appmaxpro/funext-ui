import CSS from "csstype";
import { SpaceValue } from ".";
import { Config, Responsive } from "../types";
import { toRem, toPixel } from "../utils";

const convert = (value: any) => value;

const computeVar =
  (name: string, conv = convert) =>
  (value: any, breakpoint?: string) => {
    const className = breakpoint ? `${breakpoint}:${name}` : `${name}`;

    return {
      classes: [`${className}-${conv(value)}`],
      //styles,
    };
  };

const computeVar2 =
  (name: string, conv = convert) =>
  (value: any, breakpoint?: string) => {
    const className = breakpoint ? `${name}-${breakpoint}` : `${name}`;

    const styles = {
      [`--l-${className}`]: conv(value),
    };

    return {
      classes: [`l-${className}`],
      styles,
    };
  };

const computeGap = (value: SpaceValue | undefined, breakpoint?: string) => {
  
  return value || value === 0
    ? breakpoint
      ? `${breakpoint}:gap-${value}`
      : `gap-${value}`
    : undefined;
};

export interface FlexProps {
  flex?: Responsive<CSS.Property.Flex>;
  flexBasis?: Responsive<CSS.Property.FlexBasis>;
  flexDirection?: Responsive<CSS.Property.FlexDirection>;
  flexFlow?: Responsive<CSS.Property.FlexFlow>;
  flexGrow?: Responsive<CSS.Property.FlexGrow>;
  grow: Responsive<CSS.Property.FlexGrow>;
  shrink?: Responsive<CSS.Property.FlexShrink>;
  flexWrap?: Responsive<CSS.Property.FlexWrap>;
  order?: Responsive<CSS.Property.Order>;
  justifyContent?: Responsive<CSS.Property.JustifyContent>;
  alignContent?: Responsive<CSS.Property.AlignContent>;
  alignItems?: Responsive<CSS.Property.AlignItems>;
  alignSelf?: Responsive<CSS.Property.AlignSelf>;
  placeContent?: Responsive<CSS.Property.PlaceContent>;
  placeItems?: Responsive<CSS.Property.PlaceItems>;
  rowGap?: Responsive<CSS.Property.RowGap | number>;
  columnGap?: Responsive<CSS.Property.ColumnGap | number>;
  gap?: Responsive<CSS.Property.Gap | number>;
  g?: Responsive<SpaceValue>;
}

const replaceFlex = (value:any) => 
        `${value}`.startsWith('flex-') 
        ? `${value}`.substring(5)
        : value;


const def = (key:string, value:any) => value === true  || `${value}` ===  '1'
     ?  ` ${key}`
     : `${value}` ===  '0'
     ? ` ${key}-${value}`
     : ` ${key}-[${toPixel(value)}]`;

export const FlexConfig: Config<FlexProps> = {
  flex: computeVar("flex"),
  flexBasis: computeVar("basis"),
  flexDirection: computeVar("flex", value => value ==='column' ? 'col' : value),
  flexFlow: computeVar("", (val) => def('flow', val ?? '1')),
  flexGrow: computeVar("", (val) => def('grow', val ?? '1')),
  grow: computeVar("", (val) => def('grow', val ?? '1')),
  shrink: computeVar("", (val) => def('shrink', val ?? 1)),
  flexWrap: computeVar("flex"),
  order: computeVar("order"),
  justifyContent: computeVar("justify", (v) => v.replace('flex-', '').replace('content-', '')),
  alignContent: computeVar("content", replaceFlex),
  alignItems: computeVar("items", replaceFlex),
  alignSelf: computeVar("self"),
  placeContent: computeVar("place-content", replaceFlex),
  placeItems: computeVar("place-items"),
  rowGap: computeVar("row-gap"),
  columnGap: computeVar("column-gap"),
  gap: computeVar("gap", val => {
    //console.log("computeVar gap:", val);
    return val;
  }),
  g: computeGap,
};

export interface GridProps {
  gridGap?: Responsive<CSS.Property.GridGap | number>;
  gridRowGap?: Responsive<CSS.Property.GridRowGap | number>;
  gridColumnGap?: Responsive<CSS.Property.GridColumnGap | number>;
  gridRow?: Responsive<CSS.Property.GridRow>;
  gridColumn?: Responsive<CSS.Property.GridColumn>;
  gridRowStart?: Responsive<CSS.Property.GridRowStart>;
  gridColumnStart?: Responsive<CSS.Property.GridColumnStart>;
  gridRowEnd?: Responsive<CSS.Property.GridRowEnd>;
  gridColumnEnd?: Responsive<CSS.Property.GridColumnEnd>;
  gridAutoRows?: Responsive<CSS.Property.GridAutoRows>;
  gridAutoColumns?: Responsive<CSS.Property.GridAutoColumns>;
  gridAutoFlow?: Responsive<CSS.Property.GridAutoFlow>;
  gridTemplate?: Responsive<CSS.Property.GridTemplate>;
  gridTemplateRows?: Responsive<CSS.Property.GridTemplateRows>;
  gridTemplateColumns?: Responsive<CSS.Property.GridTemplateColumns>;
  gridTemplateAreas?: Responsive<CSS.Property.GridTemplateAreas>;
  gridArea?: Responsive<CSS.Property.GridArea>;
  gap?: Responsive<CSS.Property.Gap | number>;
  g?: Responsive<SpaceValue>;
}

export const GridConfig: Config<GridProps> = {
  gridGap: computeVar2("grid-gap", toPixel),
  gridRowGap: computeVar2("grid-row-gap", toPixel),
  gridColumnGap: computeVar2("grid-column-gap", toPixel),
  gridRow: computeVar2("grid-row"),
  gridColumn: computeVar2("grid-column"),
  gridRowStart: computeVar2("grid-row-start"),
  gridColumnStart: computeVar2("grid-column-start"),
  gridRowEnd: computeVar2("grid-row-end"),
  gridColumnEnd: computeVar2("grid-column-end"),
  gridAutoRows: computeVar2("grid-auto-rows"),
  gridAutoColumns: computeVar2("grid-auto-columns"),
  gridAutoFlow: computeVar2("grid-auto-flow"),
  gridTemplateRows: computeVar2("grid-template-rows"),
  gridTemplateColumns: computeVar2("grid-template-columns"),
  gridTemplateAreas: computeVar2("grid-template-areas"),
  gridArea: computeVar2("grid-area"),
  //gap: computeVar("gap", toRem),
  //g: computeGap,
};
