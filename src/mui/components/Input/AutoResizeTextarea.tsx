import React from "react";
import { useEnhancedEffect, useRefs } from "../../hooks";
import {getWindow, isDevelopment} from "../../utils";
import debounce from "@mui/utils/debounce";
import {
  useWindowResizeListener,
  useFontsLoadedListener,
} from './hooks';
import { 
  noop,
  SizingData,
  getSizingData,
  calculateNodeHeight
} from './utils';
import { 
  isBrowser 
} from "../../utils";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

type Style = Omit<
  NonNullable<TextareaProps['style']>,
  'maxHeight' | 'minHeight'
> & {
  height?: number;
};

export type TextareaHeightChangeMeta = {
  rowHeight: number;
};
export interface AutoResizeTextareaProps extends Omit<TextareaProps, 'style'> {
  maxRows?: number;
  minRows?: number;
  onHeightChange?: (height: number, meta: TextareaHeightChangeMeta) => void;
  cacheMeasurements?: boolean;
  style?: Style;
}

const AutoResizeTextarea: React.ForwardRefRenderFunction<
  HTMLTextAreaElement,
  AutoResizeTextareaProps
> = (
  {
    cacheMeasurements = true,
    maxRows,
    minRows,
    onChange = noop,
    onHeightChange = noop,
    ...props
  },
  userRef: React.Ref<HTMLTextAreaElement>,
) => {
  if (isDevelopment && props.style) {
    if ('maxHeight' in props.style) {
      throw new Error(
        'Using `style.maxHeight` for <AutoResizeTextarea/> is not supported. Please use `maxRows`.',
      );
    }
    if ('minHeight' in props.style) {
      throw new Error(
        'Using `style.minHeight` for <AutoResizeTextarea/> is not supported. Please use `minRows`.',
      );
    }
  }
  const isControlled = props.value !== undefined;
  const libRef = React.useRef<HTMLTextAreaElement | null>(null);
  const ref = useRefs(libRef, userRef);
  const heightRef = React.useRef(0);
  const measurementsCacheRef = React.useRef<SizingData>();

  const resizeTextarea = () => {
    const node = libRef.current!;
    const nodeSizingData =
      cacheMeasurements && measurementsCacheRef.current
        ? measurementsCacheRef.current
        : getSizingData(node);

    if (!nodeSizingData) {
      return;
    }

    measurementsCacheRef.current = nodeSizingData;

    const [height, rowHeight] = calculateNodeHeight(
      nodeSizingData,
      node.value || node.placeholder || 'x',
      minRows,
      maxRows,
    );

    if (heightRef.current !== height) {
      heightRef.current = height;
      node.style.setProperty('height', `${height}px`, 'important');
      onHeightChange(height, { rowHeight });
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) {
      resizeTextarea();
    }
    onChange(event);
  };

  if (isBrowser) {
    React.useLayoutEffect(resizeTextarea);
    useWindowResizeListener(resizeTextarea);
    useFontsLoadedListener(resizeTextarea);
    return <textarea {...props} onChange={handleChange} ref={ref} />;
  }

  return <textarea {...props} onChange={onChange} ref={ref} />;
};

export default /* #__PURE__ */ React.forwardRef(AutoResizeTextarea);