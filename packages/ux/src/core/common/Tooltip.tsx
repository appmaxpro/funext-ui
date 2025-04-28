// @ts-nocheck
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingPortal,
  inline,
  offset,
  shift,
  useDelayGroup,
  useDelayGroupContext,
  useDismiss,
  useClick,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
} from '@floating-ui/react';
import * as React from 'react';
import {useId, ReactNode} from 'react';
import type {UseHoverOverlayProps} from './overlay';
import {PositionWrapper, Overlay} from './overlay';
import {clsx} from '../clsx';
import type {SerializedStyles} from '@emotion/react';
import {styled, useTheme} from '../../mui/styles';
import {AnimatePresence} from 'framer-motion';
import {alpha } from '../../mui/utils';

export interface TooltipProps extends UseHoverOverlayProps {
  children: React.ReactElement;
  title?: string;
  content?: () => JSX.Element | null;
  disableContentClick?: boolean;
  /**
   * Disable the tooltip display entirely
   */
  disabled?: boolean;
  /**
   * Additional style rules for the tooltip content.
   */
  overlayStyle?: React.CSSProperties | SerializedStyles;
  triggerProps?: React.HTMLProps<React.ElementType>;
  autoTrigger?: boolean;
}

export const useTooltip = ({
  initialOpen = false,
  placement = 'bottom',
  strategy,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  showOnOver,
  noRest,
  ...options
}:Record<string, any>):Record<string, any> => {
  const {delay, isInstantPhase} = useDelayGroupContext();
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState(initialOpen);

  const arrowRef = React.useRef(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const mouseRef = React.useRef(false);
  const timeoutRef = React.useRef(null);

  const [mouseIn, setMouseIn] = React.useState(false);
  const [counter, setCounter] = React.useState(0);

  const resetMouseRef =  React.useCallback(()=>{
    mouseRef.current = false;
    if (!mouseIn) {
        setMouseIn(false) ;
        setCounter(counter + 1);
        timeoutRef.current = false;
    }
  });

  const onMouseEnter = React.useCallback((event)=>{
    if(!showOnOver) {
      return;
    }
    setMouseIn(true) ;
    timeoutRef.current && clearTimeout(timeoutRef.current);
  });

  const onMouseLeave = React.useCallback((event)=>{
    if(!showOnOver) {
      return;
    }
    mouseRef.current = false;
    setMouseIn(false) ;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = false;
  });

  const onTargetMouseLeave = React.useCallback((event)=>{
    if(!showOnOver) {
      return;
    }
    mouseRef.current = true;
    timeoutRef.current && clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(resetMouseRef, 300);
  });

  const data = useFloating({
    placement,
    strategy,
    open: open || mouseRef.current || mouseIn,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      inline(),
      flip({
        fallbackAxisSideDirection: 'start',
        crossAxis: placement.includes('-'),
        padding: 5,
      }),
      shift({padding: 5}),
      arrow({
        element: arrowRef,
        padding: 4,
      }),
    ],
  });

  const context = data.context;

  const hover = useHover(context, {
    move: false,
    enabled: controlledOpen == null,
    restMs: isInstantPhase || noRest ? 0 : 150,
    delay,
  });

  const focus = useFocus(context, {
    enabled: controlledOpen == null,
  });

  const dismiss = useDismiss(context, {enabled: !mouseRef.current });

  const role = useRole(context, {role: 'label'});

  const interactions = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  hover

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      arrowRef,
      onMouseEnter,
      onMouseLeave,
      onTargetMouseLeave,
      options: options
    }),
    [open, setOpen, interactions, data, options, mouseRef],
  );
}

const TooltipContext = React.createContext<Record<string, any> | null>(null);

export const useTooltipContext = () =>  {
  const context = React.useContext(TooltipContext);

  if (context == null) {
    throw new Error(
      'Tooltip components must be wrapped in <Tooltip />',
    );
  }

  return context;
};

export function Tooltip({
  children,
  content,
  title,
  triggerProps,
  autoTrigger = true,
  ...options
}: TooltipProps) {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const tooltip = useTooltip(options);
  const tooltipContent =  title ? title : content;
  return (
    <TooltipContext.Provider value={tooltip}>
      { (autoTrigger || triggerProps) 
          ? <TooltipTrigger {...triggerProps}>{children}</TooltipTrigger>
          : children
      }
      {!!tooltipContent && 
        (<TooltipContent>
              {typeof tooltipContent == 'function' ? tooltipContent() : tooltipContent}
        </TooltipContent>)
      }
    </TooltipContext.Provider>
  );
}

export const TooltipTrigger = React.forwardRef(
  function TooltipTrigger(
    {children, ...rest}: Record<string, any>,
    propRef,
  ) {
    const context = useTooltipContext();
    const {
      ref:childrenRef,
      props:childProps
    } = children;

    const {onTargetMouseLeave} = context;

    const ref = useMergeRefs([
      context.refs.setReference,
      propRef,
      childrenRef,
    ]);

   return React.isValidElement(children) && React.cloneElement(
     children,
     context.getReferenceProps({
       ref,
       ...rest,
       ...childProps,
       onMouseLeave: onTargetMouseLeave,
       'data-state': context.open ? 'open' : 'closed',
     }),
   );
  });

export const TooltipContent = React.forwardRef<HTMLElement, Record<string, any>>(
  (props, propRef) => {
    const {context: floatingContext, options, onMouseEnter, onMouseLeave, ...context} =
      useTooltipContext();

    const ref = useMergeRefs([
      context.refs.setFloating,
      propRef,
    ]);

    const id = useId();
    const theme = useTheme();

    const allProps = {...options, ...props};

    const {animated = true} = allProps;

    const {isInstantPhase, currentId} = useDelayGroupContext();

    useDelayGroup(floatingContext, {
      id,
    });

    const {isMounted, styles} = useTransitionStyles(
      floatingContext,
      {
        duration: animated ? (isInstantPhase
          ? {open: 100, close: id === currentId ? 150 : 50}
          : {open: 300, close: 150})
          : {open: 0, close: 0},
        initial: {
          opacity: 0,
          transform: 'scale(0.1)',
        },
        common: ({side}) => ({
          transformOrigin: {
            top: `${
              floatingContext.middlewareData.arrow?.x ?? 0
            }px bottom`,
            bottom: `${
              floatingContext.middlewareData.arrow?.x ?? 0
            }px top`,
            left: `right ${
              floatingContext.middlewareData.arrow?.y ?? 0
            }px bottom`,
            right: `left ${
              floatingContext.middlewareData.arrow?.y ?? 0
            }px`,
          }[side],
        }),
      },
    );

    if (!isMounted)
      return null;

    const {
      styles: tooltipStyles,
      hasArrow = true,
      arrowProps= {
        background: 'backgroundElevated',
        border: 'translucentBorder',
      },
      onTargetMouseLeave,
      children,
      inverse,
      touch,
      ...others
    }: Record<string, any> = allProps;

    const {palette} = theme;
    
    const bg = inverse || !theme.vars
        ? alpha(theme.palette.grey[800], 0.92)
        : theme.vars.palette.Tooltip.bg;

    return (
        <FloatingPortal id="tooltip-portal">
          <AnimatePresence>
            <PositionWrapper 
              id="TipPositionWrapper"
              zIndex={theme.zIndex.tooltip} 
              {...others}
              style={{
                position: context.strategy,
                top: Math.round(context.y ?? 0),
                left: Math.round(context.x ?? 0),
                width: 'max-content',
                maxWidth: 'min(calc(100vw - 10px), 25rem)',
                ...tooltipStyles,
                ...styles,
              }}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              ref={ref}>
              <StyledOverlay
                  id="TipStyledOverlay"
                  inverse={inverse}
                  animated={animated}
                  touch={touch}
                  style={{
                     ...((animated && floatingContext.open) && {opacity: 1} )
                  }}>
                  {children}
                  { hasArrow && <FloatingArrow
                    ref={context.arrowRef}
                    context={floatingContext}
                    width={14}
                    height={Math.round(14 * 0.4)}
                    strokeWidth={1}
                    fill={bg}
                    stroke={inverse || !theme.vars 
                      ? alpha(theme.palette.getContrastText(bg), .7)
                      : theme.palette.grey[200]}
                    />
                  }

              </StyledOverlay>
            </PositionWrapper>
          </AnimatePresence>
        </FloatingPortal>
    );
  }
);


const StyledOverlay = styled('div', {
  name: 'TooltipOverlay',
  slot: 'Overlay',
  shouldForwardProp: (propName) => propName !== 'inverse'
         && propName !== 'touch'  
         && propName !== 'animated'
})(({ theme, touch, inverse, animated }) => ({
  backgroundColor: inverse || !theme.vars
      ? alpha(theme.palette.grey.A700, 0.92)
      : theme.vars.palette.Tooltip.bg,
  borderRadius: theme.vars ? `calc(2 * ${theme.vars.shape.borderRadius})` : 2 * theme.shape.borderRadius,
  color: inverse || !theme.vars ? theme.palette.grey[100] : theme.vars.palette.common.white,
  fontFamily: theme.typography.fontFamily,
  padding: '4px 8px',
  fontSize: theme.typography.pxToRem(11),
  maxWidth: 300,
  margin: 2,
  wordWrap: 'break-word',
  fontWeight: theme.typography.fontWeightMedium,
  textAlign: 'center',
  boxShadow: 'rgba(58, 17, 95, 0.14) 0px 0px 0px 1px, rgba(43, 34, 51, 0.12) 0px 4px 24px',
  zIndex: theme.zIndex.tooltip,
  willChange: animated ? 'transform, opacity' : undefined,
  opacity: animated ? 0 : undefined,
  transition: animated ? 'opacity 462ms cubic-bezier(0.4, 0, 0.2, 1) 0ms' : undefined,
  variants: [
    {
      props: {touch},
      style: {
        padding: '8px 16px',
        fontSize: theme.typography.pxToRem(14),
        lineHeight: `${Math.round(16 / 14)}em`,
        fontWeight: theme.typography.fontWeightRegular,
      },
    },
  ]
}));
