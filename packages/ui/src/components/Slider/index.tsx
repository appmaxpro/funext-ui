import React, { useMemo } from "react";

// utils
import merge from "deepmerge";
import classnames from "classnames";
import { twMerge } from "tailwind-merge";
import findMatch from "../../utils/findMatch";
import values from "../../utils/values";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  color,
  size,
  className,
  trackClassName,
  thumbClassName,
  barClassName,
  value,
  defaultValue,
  onChange,
  min,
  max,
  step,
  inputRef,
  inputProps,
} from "../../types/components/slider";
import { mapThemeColor } from "../../hooks";

export interface SliderProps extends React.ComponentProps<"div"> {
  color?: color;
  size?: size;
  className?: className;
  sliderClassName?: trackClassName;
  trackClassName?: trackClassName;
  thumbClassName?: thumbClassName;
  barClassName?: barClassName;
  value?: value;
  defaultValue?: defaultValue;
  onChange?: onChange;
  min?: min;
  max?: max;
  step?: step;
  inputRef?: inputRef;
  inputProps?: inputProps;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      color,
      size,
      className,
      trackClassName,
      thumbClassName,
      barClassName,
      value,
      defaultValue,
      onChange,
      min,
      max,
      step,
      inputRef,
      inputProps,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { slider } = useTailwindTheme();
    const { valid, defaultProps, styles } = slider;
    const { base, sizes, colors } = styles;
    const [innerValue, setInnerValue] = React.useState(defaultValue || 0);

    React.useMemo(() => {
      if (defaultValue) setInnerValue(defaultValue);
    }, [defaultValue]);

    // 2. set default props

    min = min ?? defaultProps.min;
    max = max ?? defaultProps.max;
    step = step ?? defaultProps.step;

    const { sliderContainerClasses, sliderBarClasses, sliderClasses } =
      useMemo(() => {
        color = mapThemeColor(color, defaultProps.color);
        size = size ?? defaultProps.size;
        className = classnames(defaultProps.className || "", className);

        thumbClassName =
          classnames(defaultProps.thumbClassName, thumbClassName) ??
          defaultProps.thumbClassName;
        trackClassName =
          classnames(defaultProps.trackClassName, trackClassName) ??
          defaultProps.trackClassName;
        barClassName =
          classnames(defaultProps.barClassName, barClassName) ??
          defaultProps.barClassName;
        inputProps =
          merge(inputProps as any, defaultProps?.inputProps || {}) ??
          defaultProps.inputProps;

        // 3. set styles
        const sliderContainerClasses = twMerge(
          classnames(
            values(base.container),
            values(colors[findMatch(valid.colors, color, "gray")]),
            values(
              sizes[findMatch(valid.sizes, size, "md")]["container"],
            ),
            className,
          ),
        );
        const sliderBarClasses = twMerge(
          classnames(values(base.bar), barClassName),
        );
        const sliderTrackClasses = classnames(
          values(base.track),
          values(sizes[findMatch(valid.sizes, size, "md")]["track"]),
        );
        const sliderThumbClasses = classnames(
          values(base.thumb),
          values(sizes[findMatch(valid.sizes, size, "md")]["thumb"]),
        );
        const sliderClasses = classnames(
          values(base.slider),
          twMerge(sliderTrackClasses, trackClassName),
          twMerge(sliderThumbClasses, thumbClassName),
        );

        return {
          sliderContainerClasses,
          sliderBarClasses,
          sliderClasses,
        };
      }, [
        slider,
        className,
        trackClassName,
        thumbClassName,
        barClassName,
        size,
        color,
      ]);

    // 4. return
    return (
      <div {...rest} ref={ref} className={sliderContainerClasses}>
        <label
          className={sliderBarClasses}
          style={{ width: `${value || innerValue}%` }}
        />
        <input
          ref={inputRef}
          type="range"
          max={max}
          min={min}
          step={step}
          className={sliderClasses}
          {...(value ? { value } : null)}
          defaultValue={defaultValue}
          onChange={(e) =>
            onChange ? onChange(e) : setInnerValue(Number(e.target.value))
          }
        />
      </div>
    );
  },
);
Slider.displayName = "Mux.Slider";

export default Slider;
