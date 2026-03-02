"use client"
import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useDeferredValue,
} from "react";

// utils
import findMatch from "../../utils/findMatch";
import values from "../../utils/values";
// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  variantType,
  InputColorType,
  sizeType,
} from "../../types/components/input";

import { twMerge } from "tailwind-merge";
import deepmerge from "deepmerge";
import { useControlled, useRefs, mapThemeColor, useEvent } from "../../hooks";
import {
  SxComponentProps,
  SxThemeProps,
  clsx,
  styled,
  globalCss,
} from "../../styles";
import AutoResizeTextarea from "./AutoResizeTextarea";

const InputRoot = styled("div", {
  name: "MuxInput",
  slot: "root",
})({
  variants: [
    {
      props: {
        disableBorder: true,
        variant: "filled",
      },
      style: {
        borderColor: "transparent!important",
      },
    },
  ],
});

const BasicInputRoot = styled("input", {
  name: "BasicInput",
  slot: "Root",
})({
  font: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  fontFamily: "inherit",
  letterSpacing: "inherit",
  color: "currentColor",
  border: 0,
  boxSizing: "content-box",
  background: "none",
  margin: 0,
  display: "block",
  minWidth: 0,
  animationName: "mux-auto-fill-cancel",
  animationDuration: "10ms",
  outline: 0,
  flexGrow: 1,
  height: "1.4375em",

  ["&:focus"]: {
    outline: 0,
    border: 0,
  },
  ["&:disabled"]: {
    cursor: "not-allowed",
  },
  variants: [
    {
      props: {
        inline: true,
      },
      style: {
        flexShrink: 1,
        width: "0px",
        minWidth: "30px",
      },
    },
    {
      props: ({ ownerState }) => !ownerState.disableInjectingGlobalStyles,
      style: {
        animationName: "mux-auto-fill-cancel",
        animationDuration: "10ms",
        "&:-webkit-autofill": {
          animationDuration: "5000s",
          animationName: "mux-auto-fill",
        },
      },
    },
    {
      props: {
        multiLines: true,
      },
      style: {
        height: "auto",
      },
    },
    {
      props: ({ ownerState }: any) =>
        !ownerState.inline && ownerState.size === "md",
      style: {
        paddingTop: "8.5px",
        paddingBottom: "8.5px",
      },
    },
    {
      props: ({ ownerState }: any) =>
        !ownerState.inline && ownerState.size === "lg",
      style: {
        paddingTop: "16.5px",
        paddingBottom: "16.5px",
      },
    },
    {
      props: {
        notInput: true,
        multiLines: false,
      },
      style: {
        whiteSpace: "nowrap",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
      },
    },
    {
      props: {
        notInput: true,
        multiLines: true,
      },
      style: {
        overflow: "auto",
      },
    },
  ],
});

const InputLabelRoot = styled("label", {
  name: "MuxInput",
  slot: "label",
})("");

const InputContainerRoot = styled("div", {
  name: "MuxInput",
  slot: "container",
})({
  variants: [
    {
      props: {
        disableBorder: true,
      },
      style: {
        borderColor: "transparent!important",
        ["&::before"]: {
          display: "none!important",
        },
        ["&::after"]: {
          display: "none!important",
        },
      },
    },
  ],
});

const commonIconStyles = [
  {
    props: { size: "md" },
    style: {
      "& .MuxIconButton-sizeInherit": {
        fontSize: "1.5rem",
        padding: 4,
        "& .material-symbols": {
          scale: 1,
        },
      },
    },
  },
  {
    props: { size: "lg" },
    style: {
      "& .MuxIconButton-sizeInherit": {
        fontSize: "1.625rem",
        padding: 4,
        "& .material-symbols": {
          scale: 1,
        },
      },
    },
  },
];
//forceInline && ('grow flex-wrap' || 'flex-nowrap shrink')
const PrefixRoot = styled("div", {
  name: "MuxInput",
  slot: "Prefix",
})({
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  border: 0,
  flexWrap: "nowrap",
  variants: [
    {
      props: {
        variant: "outlined",
      },
      style: {
        paddingLeft: "4px",
        paddingRight: "4px",
      },
    },
    {
      props: {
        multiLines: true,
        vertical: false,
      },
      style: {
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "center",
      },
    },
    {
      props: {
        inline: false,
      },
      style: {
        flexShrink: 1,
      },
    },
    {
      props: {
        inline: true,
      },
      style: {
        display: "flex",
        flexGrow: 1,
        flexWrap: "wrap",
        placeContent: "start",
      },
    },
    {
      props: {
        inline: true,
        size: "md",
        variant: "outlined",
      },
      style: {
        paddingTop: "8.5px",
        paddingBottom: "8.5px",
      },
    },
    {
      props: {
        inline: true,
        size: "lg",
      },
      style: {
        paddingTop: "16.5px",
        paddingBottom: "16.5px",
      },
    },
    ...commonIconStyles,
  ],
});

const SuffixRoot = styled("div", {
  name: "MuxInput",
  slot: "Suffix",
})({
  display: "inline-flex",
  alignItems: "center",
  gap: 1,
  border: 0,
  flexShrink: 1,
  flexWrap: "nowrap",
  paddingLeft: "4px",
  paddingRight: "4px",
  variants: [
    {
      props: {
        multiLines: true,
        vertical: false,
      },
      style: {
        flexDirection: "column",
        alignItems: "start",
        justifyContent: "center",
      },
    },
    ...commonIconStyles,
  ],
});

export type RenderInput = {
  start?: React.ReactNode;
  input: React.ReactNode;
  end?: React.ReactNode;
};

const InputGlobalStyles = globalCss({
  "@keyframes mux-auto-fill": { from: { display: "block" } },
  "@keyframes mux-auto-fill-cancel": { from: { display: "block" } },
});

export interface BasicInputProps extends Omit<SxComponentProps, 'prefix' | 'suffix'> {
  variant?: variantType;
  size?: sizeType;
  color?: InputColorType;
  label?: React.ReactNode;
  error?: boolean;
  success?: boolean;
  labelProps?: Record<string, any>;
  rootProps?: Record<string, any>;
  inputProps?: Record<string, any>;
  nativeClassName?: string;
  shrink?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  multiLines?: boolean;
  resize?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  focused?: boolean;
  fullWidth?: boolean;
  disableBorder?: boolean;

  adornmentsProps?: {
    vertical?: boolean;
    props?: {
      className?: string;
    };
    start?: {
      className?: string;
    };
    end?: {
      className?: string;
    };
  };
  forceInline?: boolean;
  value?: string | number | React.ReactNode;
}

export interface SingleInputProps
  extends BasicInputProps,
    Omit<React.ComponentProps<"input">, "size" | "color" | "value" | 'prefix' | 'suffix'> {}

export interface TextareaProps
  extends BasicInputProps,
    Omit<React.ComponentProps<"textarea">, "size" | "color" | "value" | 'prefix' | 'suffix'> {
  resize?: boolean;
  maxRows?: number;
  minRows?: number;
}

export declare type InputProps = SingleInputProps | TextareaProps;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant,
      color,
      size,
      label,
      error: hasError,
      success: hasSuccess,
      rootProps,
      labelProps,
      inputProps,
      className,
      nativeClassName,
      shrink,
      fullWidth,
      type,
      resize,
      multiLines: multi = false,
      adornmentsProps,
      prefix,
      suffix,
      defaultValue,
      value: val,
      forceInline = false,
      focused = false,
      disableBorder,
      onChange,
      as,
      placeholder,
      disabled,
      readOnly,
      disableInjectingGlobalStyles = true,
      rows,
      minRows,
      maxRows,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { input: inputTheme } = useTailwindTheme();
    const { defaultProps, valid, styles } = inputTheme;
    const { base, variants } = styles;

    const notInput = (as && as !== "textarea" && as !== "input") || (val && typeof val !== 'string');
    const multiLines = as === "textarea" || rows || multi;

    disableBorder ??= defaultProps.disableBorder;

    const myInputRef = useRef();

    const inputRef = useRefs(ref, myInputRef); //useForwardedRef(ref);

    const [focus, setFocus] = useState(focused);

    const [value, setValue, isControlled] = useControlled({
      name: "input",
      prop: "value",
      state: !notInput ? '' : val,
      defaultState: defaultValue ,
    });

    const restOnFocus = useEvent(rest.onFocus)
    const restOnBlur = useEvent(rest.onBlur)
    const resOnChange = useEvent(onChange)

    //const inputValue = useDeferredValue(value);

    const handleChange = React.useCallback(
      (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ...args: any
      ) => {
        if (!isControlled) {
          const element = event.target || myInputRef.current;
          if (element == null) {
            throw /* minify-error */ new Error(
              "MUX: Expected valid input target. " +
                "Did you use a custom `inputComponent` and forget to forward refs? " +
                "See https://mui.com/r/input-component-ref-interface for more info.",
            );
          }
          setValue(element?.value);
        }

        // Perform in the willUpdate
         resOnChange(event as any);
      },
      [],
    );

    const handleFocus = React.useCallback((event: any) => {
      setFocus(true);
      restOnFocus(event);
    }, []);

    const handleBlur = React.useCallback((event: any) => {
      setFocus(false);
      restOnBlur(event);
    }, []);

    

    const otherColor = (hasError && "error") || (hasSuccess && "success");
    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = mapThemeColor(otherColor || color, defaultProps.color);
    //label = label ?? defaultProps.label;
    labelProps = labelProps ?? defaultProps.labelProps;
    rootProps = rootProps ?? defaultProps.containerProps;
    shrink = shrink ?? defaultProps.shrink;
    className = twMerge(defaultProps.className || "", className);
    const hasPrefix = prefix && React.isValidElement(prefix);
    const hasStart = forceInline || hasPrefix;
    const hasEnd = suffix && React.isValidElement(suffix);
    const hasExtension = hasStart || hasEnd;
    const hasLabel = label
      ? typeof label === "string"
        ? label.length > 0
        : React.isValidElement(label)
      : false;

    const isOutline = variant === "outlined";
    const isFilled = variant === "filled";
    const isShrink =
      shrink ||
      focus ||
      focused ||
      !!value ||
      hasPrefix;
    
    const {
      rootCls,
      labelCls,
      asteriskCls,
      inputCls,
      startCls,
      endCls,
      nativeCls,
      notchedCls,
      ownerState,
    } = useMemo(() => {
      //(rest as React.ComponentProps<"input">).type
      // 3. set styles
      const tColor = findMatch(valid.colors, color, "primary");
      const inputVariant =
        variants[findMatch(valid.variants, variant, "outlined")];

      const inputSize = inputVariant.sizes[findMatch(valid.sizes, size, "md")];

      const inputColor =
        inputVariant.colors.input &&
        values(inputVariant.colors.input[tColor]);

      const rootColor =
        inputVariant.colors.root &&
        values(inputVariant.colors.root[tColor]);

      const adornments =
        (hasExtension &&
          Object.assign(
            {},
            base.adornments,
            inputVariant.base.adornments,
            inputSize.adornments,
            adornmentsProps,
          )) ||
        ({} as any);

      const startCls =
        (hasStart && clsx(values(adornments.start))) ||
        undefined;

      const endCls =
        (hasEnd && clsx(values(adornments.end))) || undefined;

      const rootCls = twMerge(
        clsx(
          values(base.root),
          values(inputVariant.base.root),
          values(inputSize.root),
          isShrink && values(inputVariant.shrink.root),
          hasError && values(inputVariant.error.root),
          hasSuccess && values(inputVariant.success.root),
        ),
        !(hasError || hasSuccess) && rootColor,
        rootProps?.className,
        className,
        fullWidth && "w-full",
        `mt-input`,
        `var-${variant}`,
        `cl-${color}`,
        `size-${size}`,
        "group",
        focus && "is-focused",
        (isShrink || !hasLabel) && "is-shrink",
      );

      const inputCls = twMerge(
        clsx(
          values(base.input),
          values(inputVariant.base.input),
          values(inputSize.input),
          {
            [values(adornments.props)]: hasExtension,
            [values(inputSize.adornments)]: hasExtension,
          },
          isShrink && values(inputVariant.shrink.input),
          hasLabel && values(inputVariant.label?.input),
          hasExtension && adornments.vertical && "flex-col",
        ),
        inputColor,
        hasError && values(inputVariant.error.input),
        hasSuccess && values(inputVariant.success.input),
        inputProps?.className,
        forceInline && "flex-nowrap",
        "mui_input",
      );

      if (variant !== "outlined") {
      }
      const notchedCls =
        isOutline || isFilled
          ? clsx(
              values({
                ...inputVariant.base.notched,
                ...inputSize.notched,
              }),
              isShrink && values(inputVariant.shrink.notched),
            )
          : undefined;

      let labelCls;
      if (hasLabel) {
        const labelShrink =
          isShrink && values(inputVariant.shrink.label);

        const labelColor = values(inputVariant.colors.label[tColor]);

        let labelFocus =
          isShrink && labelColor
            ? labelColor.substring(labelColor.lastIndexOf(":") + 1)
            : "";

        labelCls = twMerge(
          clsx(
            values(base.label),
            values(inputVariant.base.label),
            values(inputSize.label),
            {
              [labelFocus]: focus || focused,
            },
            labelShrink,
          ),
          labelColor,
          hasError && values(inputVariant.error.label),
          hasSuccess && values(inputVariant.success.label),
          labelProps?.className,
        );
      } else {
        labelCls = "";
      }
      let nativePx;
      if (disableBorder || ((isOutline || isFilled) && hasExtension)) {
        if (adornments.vertical) {
          nativePx = hasStart && hasEnd ? "py-0" : hasStart ? "pt-0" : "pb-0";
        } else {
          nativePx = hasStart && hasEnd ? "px-0" : hasStart ? "ps-0" : "pe-0";
        }
      }

      const nativeCls = twMerge(
        clsx(
          values(base.native),
          values(inputVariant.base.native),
          values(adornments.native),
          values(inputSize.native),
          multiLines && !resize && "!resize-none",
          hasLabel && !isShrink && "placeholder:opacity-0",
          {
            [values(inputVariant.shrink.native)]: isShrink,
          },
        ),
        nativePx,
        nativeClassName,
      );
      const ownerState = {
        variant,
        inline: forceInline,
        color,
        multiLines,
        size,
        focused,
        hasAdornment: hasPrefix || hasError,
        disableBorder,
        disabled,
        readOnly,
        notInput,
        disableInjectingGlobalStyles,
      };
      return {
        rootCls,
        labelCls,
        asteriskCls:
          (hasLabel &&
            rest.required &&
            clsx(values(base.asterisk))) ||
          undefined,
        inputCls,
        startCls,
        endCls,
        nativeCls,
        notchedCls,
        ownerState,
      };
    }, [
      variant,
      size,
      color,
      hasLabel,
      isShrink,
      className,
      hasStart,
      hasEnd,
      focus,
      type,
      multiLines,
      nativeClassName,
      disabled,
      forceInline,
      readOnly,
      notInput,
    ]);
    /*
    useEffect(() => {
      if (
        ["input", "textarea"].includes(
          inputRef.current?.tagName?.toLowerCase() ?? "",
        )
      ) {
        if (inputRef.current?.value !== value) {
          setValue(inputRef.current?.value);
        }
      }
    }, [value]);
    */

    let NativeComponent = notInput || !multiLines ? as : AutoResizeTextarea;
    let nativeProps: any = rest;

    if (NativeComponent === AutoResizeTextarea) {
      if (rows) {
        if (process.env.NODE_ENV !== "production") {
          if (minRows || maxRows) {
            console.warn(
              "MUX: You can not use the `minRows` or `maxRows` props when the input `rows` prop is set.",
            );
          }
        }
        nativeProps = {
          minRows: rows,
          maxRows: rows,
          ...nativeProps,
        };
      } else {
        nativeProps = {
          maxRows,
          minRows,
          ...nativeProps,
        };
      }
      type = undefined;
    }

    // 4. return
    const input = notInput ? (
      <BasicInputRoot
        {...(nativeProps as React.ComponentProps<"div">)}
        ref={inputRef as any}
        className={clsx(nativeCls, !multiLines ? "whitespace-nowrap	" : "")}
        //onFocus={handleFocus}
        //onBlur={handleBlur}
        as={as}
        aria-invalid={hasError ? "true" : undefined}
        ownerState={ownerState}
      >
        {val ? val : !hasLabel ? placeholder : null}
      </BasicInputRoot>
    ) : (
      <BasicInputRoot
        {...(nativeProps as React.ComponentProps<"input">)}
        ref={inputRef as any}
        aria-invalid={hasError ? "true" : undefined}
        className={nativeCls}
        placeholder={placeholder || ""}
        value={value as string}
        //defaultValue={defaultValue}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        disabled={disabled}
        readOnly={readOnly}
        as={NativeComponent}
        ownerState={ownerState}
        type={type}
      />
    );
    const start = hasStart ? (
      <PrefixRoot ownerState={ownerState} className={startCls}>
        {prefix}
        {forceInline ? input : null}
      </PrefixRoot>
    ) : undefined;

    const inputLabel = hasLabel && (
      <InputLabelRoot
        {...labelProps}
        className={labelCls}
        ownerState={ownerState}
      >
        {label}
        {typeof label === 'string' && rest.required ? <span className={asteriskCls}>*</span> : null}
      </InputLabelRoot>
    );

    return (
      <InputRoot {...rootProps} className={rootCls} ownerState={ownerState}>
        {!isFilled && !isOutline && inputLabel}

        <InputContainerRoot className={inputCls} ownerState={ownerState}>
          {start}
          {!forceInline ? input : null}
          {hasEnd ? (
            <SuffixRoot ownerState={ownerState} className={endCls}>
              {suffix}
            </SuffixRoot>
          ) : undefined}

          {isOutline && !disableBorder ? (
            <fieldset className={notchedCls}>
              <legend>
                {hasLabel && (
                  <span>
                    {label} {typeof label === 'string' && rest.required && " *"}
                  </span>
                )}
              </legend>
            </fieldset>
          ) : null}
        </InputContainerRoot>
        {(isFilled || isOutline) && inputLabel}
        {isFilled && !disableBorder ? (
          <fieldset className={notchedCls}></fieldset>
        ) : null}
        {!disableInjectingGlobalStyles &&
          typeof InputGlobalStyles === "function" && <InputGlobalStyles />}
      </InputRoot>
    );
  },
);

Input.displayName = "Mux.Input";

export default Input;
