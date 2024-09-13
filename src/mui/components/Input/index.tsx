import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";

// utils
import classnames from "classnames";
import findMatch from "../../utils/findMatch";
import objectsToString from "../../utils/objectsToString";

// context
import { useTailwindTheme } from "../../theme";

// types
import type {
  variantType,
  InputColorType,
  sizeType,
} from "../../types/components/input";

import { twMerge } from "tailwind-merge";
import { useRefs, useForwardedRef } from "../../hooks/use-refs";
import deepmerge from "deepmerge";
import { useControlled, useThemeColor } from "../../hooks";
import { SxThemeProps, styled } from "../../styles";

const InputRoot = styled('div', {
  name: 'MuxInput',
  slot: 'root'
})('');

const BasicInputRoot = styled('input', {
  name: 'BasicInput',
  slot: 'Root'
})({
  font: 'inherit',
  fontSize: 'inherit',
  fontWeight: 'inherit',
  fontFamily: 'inherit',
  letterSpacing: 'inherit',
  color: 'currentColor',
  border: 0,
  boxSizing: 'content-box',
  background: 'none',
  margin: 0,
  display: 'block',
  minWidth: 0, 
  width: '100%',
  animationName: 'mui-auto-fill-cancel',
  animationDuration: '10ms',
  outline: 0,
  flexGrow: 1,
  height: '1.4375em',
  ['&:disabled']: {
    cursor: 'not-allowed',
  },
  [ '&:focus']:{
    outline: 0,
    border: 0
  },
  variants: [
    {
      props: {
        inline: true
      },
      style:{
        flexShrink: 1,
        width: '0px',
        minWidth: '30px',
      }
    },
    {
      props: {
        multiLines: true
      },
      style:{
        height: 'auto'
      }
    },
    {
      props: ({ownerState}:any) => !ownerState.inline && ownerState.size === 'md',
      style:{
        paddingTop: '8.5px',
        paddingBottom: '8.5px',
      }
    },
    {
      props: ({ownerState}:any) => !ownerState.inline && ownerState.size === 'lg',
      style:{
        paddingTop: '16.5px',
        paddingBottom: '16.5px',
      }
    }
  ]
});

const BasicTextareaRoot = styled('textarea', {
  name: 'BasicTextarea',
  slot: 'Root'
})('');

const InputLabelRoot = styled('label', {
  name: 'MuxInput',
  slot: 'label'
})('');

const InputContainerRoot = styled('div', {
  name: 'MuxInput',
  slot: 'container'
})('');

//forceInline && ('grow flex-wrap' || 'flex-nowrap shrink')
const AdornmentStartRoot = styled('div', {
  name: 'MuxInput',
  slot: 'adornmentStart'
})({
  display: 'inline-flex',
  flexDirection: 'row',
  placeContent: 'center',
  alignItems: 'center',
  gap: 1,
  border: 0,
  flexWrap: 'nowrap', 
  paddingLeft: '4px',
  paddingRight: '4px',
  variants: [
    {
      props: {
        variant: 'outlined'
      },
      style:{
        
      }
    },
    {
      props: {
        inline: false,
      },
      style:{
        flexShrink: 1,
      }
    },
    {
      props: {
        inline: true,
      },
      style:{
        display: 'flex',
        flexGrow: 1,
        flexWrap: 'wrap',
        placeContent: 'start',
      }
    },
    {
      props: {
        inline: true,
        size: 'md'
      },
      style:{
        paddingTop: '8.5px',
        paddingBottom: '8.5px',
      }
    },
    {
      props: {
        inline: true,
        size: 'lg'
      },
      style:{
        paddingTop: '16.5px',
        paddingBottom: '16.5px',
      }
    }
  ]
});

const AdornmentEndRoot = styled('div', {
  name: 'MuxInput',
  slot: 'adornmentEnd'
})({
  display: 'inline-flex',
  flexDirection: 'row',
  placeContent: 'center',
  alignItems: 'center',
  gap: 1,
  border: 0,
  flexShrink: 1,
  flexWrap: 'nowrap',
  paddingLeft: '4px',
  paddingRight: '4px',
  variants: [
    
  ]
});

export type RenderInput = {
  start?: React.ReactNode,
  input: React.ReactNode,
  end?: React.ReactNode,
}

export interface BasicInputProps {
  variant?: variantType;
  size?: sizeType;
  color?: InputColorType;
  label?: React.ReactNode;
  error?: boolean;
  success?: boolean;
  labelProps?: Record<string,any>;
  rootProps?: Record<string,any>;
  shrink?: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
  multiLines?: boolean;
  resize?:boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  focused?: boolean;
  sx?: SxThemeProps;
  adornmentsProps?: {
    props?: {
      className?:string;
    },
    start: {
      className?:string;
    },
    end: {
      className?:string;
    }
  }
  forceInline?: boolean;
}

export interface SingleInputProps extends BasicInputProps,
   Omit<React.ComponentProps<"input">, "size" | "color"> {}

export interface TextareaProps extends BasicInputProps, Omit<React.ComponentProps<"textarea">, "size" | "color">{
  resize?:boolean;
  multiLines?: boolean;
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
      className,
      shrink,
      type,
      resize,
      multiLines,
      adornmentsProps,
      startAdornment,
      endAdornment,
      defaultValue,
      value: val,
      forceInline = false,
      focused = false,
      onChange,
      ...rest
    },
    ref,
  ) => {
    // 1. init
    const { input:inputTheme } = useTailwindTheme();
    const { defaultProps, valid, styles, onFocus, onBlur } = inputTheme;
    const { base, variants } = styles;
    
    //const myInputRef = useRef();

    const inputRef = useForwardedRef(ref)

    const [focus, setFocus] = useState(focused);
    const [printed, setPrinted] = useState(false);

    const [value, setValue] = useControlled({
       name: 'input',
       prop: 'value',
       state: val,
       defaultState: defaultValue
    })

    const handleValueChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValue((event.currentTarget || event.target)?.value);
      onChange?.(event as any);
    }, [onChange, setValue]) 

    useEffect(()=>{
        if (!printed) {
            setPrinted(true);
            if (forceInline) {
              console.log("Props rest:", rest);
            }
        }
    }, [printed])
    
    const handleFocus = (event:any) => {
      setFocus(true);
      onFocus?.(event);
      rest.onFocus?.(event);
    }

    const handleBlur = (event:any) => {
      setFocus(false);
      onBlur?.(event);
      rest.onBlur?.(event);
    }

    const otherColor = (hasError && 'error') || (hasSuccess && 'success');
    // 2. set default props
    variant = variant ?? defaultProps.variant;
    size = size ?? defaultProps.size;
    color = useThemeColor(otherColor || color, defaultProps.color);
    label = label ?? defaultProps.label;
    labelProps = labelProps ?? defaultProps.labelProps;
    rootProps = rootProps ?? defaultProps.containerProps;
    shrink = shrink ?? defaultProps.shrink;
    className = twMerge(defaultProps.className || "", className);
    const hasStartAdro = startAdornment && React.isValidElement(startAdornment);
    const hasStart = forceInline || hasStartAdro;
    const hasEnd = endAdornment && React.isValidElement(endAdornment);
    const hasAdornments = hasStart || hasEnd;
    const hasLabel = typeof label === 'string' && label.length > 0;
    const isOutline = variant === 'outlined'; 
    
    const {
      containerCls,
      labelCls,
      asteriskCls,
      inputCls,
      startAdorCls,
      endAdorCls,
      nativeCls,
      notchedCls
    } = useMemo(()=>{
      //(rest as React.ComponentProps<"input">).type
      // 3. set styles
      const inputVariant = variants[findMatch(valid.variants, variant, "outlined")];
      const inputSize = inputVariant.sizes[findMatch(valid.sizes, size, "md")];
      

      const inputShrink = objectsToString(inputVariant.shrink.input);

      const inputColor = objectsToString(
        inputVariant.colors.input[findMatch(valid.colors, color, "primary")],
      );

      const notchedColor = inputVariant.colors.notched 
          ? objectsToString(
              inputVariant.colors.notched[findMatch(valid.colors, color, "primary")],
            )
          : '';

      const isShrink = shrink  || focus || focused || value || hasStartAdro;
      
      const adornments = (hasAdornments && deepmerge(adornmentsProps || {}, base.adornments || {}) ) || {} as any;
      const startAdorCls = hasStart && classnames(
        ''
        //objectsToString(adornments.start),
        //forceInline && ('grow flex-wrap' || 'flex-nowrap shrink')
      ) || undefined;

      const endAdorCls = hasEnd && classnames(
        ''
      ) || undefined;

      const containerCls = classnames(
        objectsToString(base.container),
        objectsToString(inputVariant.base.container),
        objectsToString(inputSize.container),
        rootProps?.className,
        `mt-input`,
        `var-${variant}`,
        `cl-${color}`,
        `size-${size}`,
        'group',
        {'is-focused': focus},
        {'is-shrink': isShrink || !hasLabel}
      );

      const inputCls = twMerge(classnames(
          objectsToString(base.input),
          objectsToString(inputVariant.base.input),
          objectsToString(inputSize.input),
          {
            [objectsToString(adornments.props)]: hasAdornments ,
            [inputShrink]: isShrink,
            [objectsToString(inputSize.adornments)]: hasAdornments,
          },
        ),
        inputColor,
        (hasError && objectsToString(inputVariant.error.input)),
        (hasSuccess && objectsToString(inputVariant.success .input)),
        className,
        forceInline ? '' : 'flex-nowrap',
        'mui_input'
      );
      
      if (variant !== 'outlined') {
      }
      const notchedCls = isOutline
          ? classnames(
              objectsToString({
              ...(inputVariant.base.notched),
              ...inputSize.notched,
              }),
              //notchedColor,
              { 
                [objectsToString(inputVariant.shrink.notched)]: isShrink,
              }
          )
          : undefined;

      

      let labelCls ;
      if(hasLabel) {

        const labelShrink = objectsToString(inputVariant.shrink.label);
        
        const labelColor = objectsToString(
          inputVariant.colors.label[findMatch(valid.colors, color, "primary")],
        );
        
        let labelFocus = isShrink && labelColor
              ? labelColor.substring(labelColor.lastIndexOf(':')+1)
              : '';
        
        labelCls = twMerge(classnames(
              objectsToString(base.label),
              objectsToString({...inputVariant.base.label}),
              objectsToString(inputSize.label),
              {
                [labelFocus]: focus || focused,
                [labelShrink]: isShrink,
              },
            ),
            labelColor,
            (hasError && objectsToString(inputVariant.error.label)),
            (hasSuccess && objectsToString(inputVariant.success.label)),
            labelProps?.className
          );
      } else {
        labelCls = '';
      }
      let nativePx;
      if (isOutline && hasAdornments){
        nativePx = hasStart && hasEnd
              ? 'px-0'
              : hasStart
                ? 'pl-0'
                : 'pr-0';

      }

      const nativeCls = twMerge(classnames(
          objectsToString(base.native),
          objectsToString(inputVariant.base.native),
          objectsToString(adornments.native),
          objectsToString(inputSize.native),
          {
            ["!resize-none"]: (multiLines && !resize),
            //[propsColor]: isOutline,
            [objectsToString(inputVariant.shrink.native)]: isShrink,
          },
        ),
        nativePx
      );
      return {
        containerCls,
        labelCls,
        asteriskCls: (hasLabel && rest.required && classnames(objectsToString(base.asterisk))) || undefined,
        inputCls,
        startAdorCls,
        endAdorCls,
        nativeCls,
        notchedCls
      }
    }, [variant, size, color, label, shrink, className,
       startAdornment, endAdornment, focus, inputRef, type, multiLines, value]);

    useEffect(()=> {
      const isFocused = (document.activeElement === inputRef.current);
      setFocus(isFocused)
    }, [inputRef.current])


    const ownerState = {
      variant,
      inline: forceInline,
      color,
      multiLines,
      size,
      focused,
      hasAdornment: hasStartAdro || hasError
    };

    // 4. return
    const input = <BasicInputRoot
            {...(rest as React.ComponentProps<"input">)}
            ref={inputRef}
            className={nativeCls}
            placeholder={rest?.placeholder || ""}
            type={type}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleValueChange}
            as={multiLines ? 'textarea' : undefined}
            ownerState={ownerState}
          />;
    const start = hasStart
          ? <AdornmentStartRoot ownerState={ownerState} className={startAdorCls}>
              {startAdornment}{forceInline ? input : null}
            </AdornmentStartRoot>
          : undefined;
    
    return (
      <InputRoot {...rootProps} className={containerCls} ownerState={ownerState}>
        {hasLabel && <InputLabelRoot {...labelProps} className={labelCls} ownerState={ownerState}>
                {label} {rest.required ? <span className={asteriskCls}>*</span> : ""}
          </InputLabelRoot>
        }
        <InputContainerRoot className={inputCls} ownerState={ownerState}>
            {start}
            {!forceInline  ? input : null}
          {hasEnd
          ? <AdornmentEndRoot className={endAdorCls}>{endAdornment}</AdornmentEndRoot>
          : undefined}

          { isOutline
              ? <fieldset className={notchedCls}>
                  <legend>
                    {hasLabel && <span>{label}</span>}
                  </legend>
                </fieldset>
              : null
          }
        </InputContainerRoot>
        
      </InputRoot>
    );
  },
);

Input.displayName = "Mux.Input";




export default Input;
