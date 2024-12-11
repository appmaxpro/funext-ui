import { useMemo } from "react";
import { clsx } from "../styles";
import { mapThemeColor } from "./useMapColor";
import { propTypesColors } from "../types/generic";
import Color from "color";

const defaultColors = ["body", "secondary", "dark", "light"];

export function getThemeColorClass(
  color?: string,
  className?: string | null | undefined,
  def?: string,
  asOf: string = "bg",
): { color?: string; className?: string | null | undefined } {
  if (color && defaultColors.includes(color)) {
    return {
      className: clsx(className, `${asOf}-${color}`),
    };
  }

  if (def) {
    return {
      className: clsx(className, `${asOf}-${def}`),
    };
  }
  return {
    color: mapThemeColor(color),
    className,
  };
}

const $noopOb = Object.freeze({});
const colorTypeMapping:any = {
  bg: 'backgroundColor',
  text: 'color',
  border: 'borderColor',

}
export function toThemeColorClassOrStyle(
  color: string,
  type: string = "bg",
  inverse: boolean = false,
): {style?: any, className?: string} {
  if (color) {
    const inDefault = defaultColors.includes(color);
    color = inDefault ? color : mapThemeColor(color)!;
    if (!inDefault && !propTypesColors.includes(color)) {
      if(!inverse || type === 'border') {
        return {
            style: {
              [colorTypeMapping[type]]: color
            }
        }        
      }
      try {
        const bg = type === 'bg';
        const cr = Color(color);
        return {
          style: {
            [bg ? "backgroundColor" : "color"]: color,
            [bg ? "color" : "backgroundColor"]: cr.isDark()
              ? "white"
              : cr.negate().hex(),
          }
        };
      } catch (e) {}
    } else {
      return {
        className: `${type}-${color}`
      }
    }
  }
  return $noopOb;
}

export function useThemeColorStyleSx({
  color,
  props,
  styleFn,
  style,
  sxFn,
  sx,
  className,
  type = 'bg',
  inverse = false
}: {
  props?: any;
  color?: string;
  styleFn?: (props: any) => any;
  style?: any;
  sxFn?: (props: any) => any;
  sx?: any;
  className?: string;
  type?: string;
  inverse?: boolean;
}): {
  sx?: any;
  style?: any;
  className?: string;
  color?: string;
} {
  return useMemo(() => {
    if (color) {
      const mappedColor = mapThemeColor(color);
      if (mappedColor && propTypesColors.includes(mappedColor)) {
        
        return { color: mappedColor, sx, style, className };
      }
      if (styleFn) {
        return {
          style: {
            ...style,
            ...styleFn({ ...props, color }),
          },
          sx,
          className
        };
      }
      if (sxFn) {
        const sxResult = sxFn({ ...props, color });
        if (sxResult) {
          if (sx) {
            if (Array.isArray(sx)) {
              return { sx: [...sx, sxResult], style, className };
            }
          }
        }
        return {
          sx: sxResult || sx,
          style,
          className
        };
      }

      if (props) {
        const to = toThemeColorClassOrStyle(color, type, inverse);
        return { 
          className: clsx(className, to.className),
          sx, 
          style: {...style, ...to.style} 
        };
      }
    }

    return { sx, style, className };
  }, [color, props, className]);
}
