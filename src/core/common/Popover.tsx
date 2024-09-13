
import * as React from 'react';
import {
  arrow,
  autoUpdate,
  flip,
  FloatingArrow,
  FloatingFocusManager,
  FloatingPortal,
  limitShift,
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useId,
  useInteractions,
  useMergeRefs,
  useRole,
  useTransitionStyles,
  useDelayGroupContext,
  useDelayGroup
} from '@floating-ui/react';

import PanelProvider from './PanelProvider';

import {remToPx, type ComponentProps} from '../../mui/utils';
import {space} from '../styles';
import { Overlay, PositionWrapper } from './overlay';
import type {UseHoverOverlayProps} from './overlay';
import styled from '@emotion/styled';
import type {SerializedStyles} from '@emotion/react';
import {useTheme} from '../../mui';
import { Button } from '../button';
import {AnimatePresence} from 'framer-motion';

export interface PopoverProps extends UseHoverOverlayProps {
  children: React.ReactElement;
  content?: () => JSX.Element | React.ReactElement;
  disableContentClick?: boolean;
  /**
   * Additional style rules for the tooltip content.
   */
  popoverStyle?: React.CSSProperties | SerializedStyles;
  triggerProps?: React.HTMLProps<React.ElementType>;
  autoTrigger?: boolean;
}
//@floating-ui/react-dom
export const usePopover = ({
  initialOpen = false,
  placement = 'bottom',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  offset:inOffset,
  padding,
  ...rest
}:Record<string, any>):Record<string, any> => {
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState(initialOpen);
  const [labelId, setLabelId] = React.useState();
  const [descriptionId, setDescriptionId] = React.useState();

  const arrowRef = React.useRef(null);

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(inOffset || remToPx(10 / 16)),
      flip({
        fallbackAxisSideDirection: 'end',
        crossAxis: false,
      }),
      shift({
        limiter: limitShift({offset: remToPx(15 / 16)}),
      }),
      arrow({
        element: arrowRef,
        padding: padding || 5,
      }),
    ],
  });

  const context = data.context;

  const click = useClick(context, {
    enabled: controlledOpen == null,
  });
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  return React.useMemo(
    () => ({
      open,
      setOpen,
      ...interactions,
      ...data,
      labelId,
      descriptionId,
      setLabelId,
      setDescriptionId,
      arrowRef,
      options: rest,
    }),
    [
      open,
      setOpen,
      interactions,
      rest,
      data,
      labelId,
      descriptionId
    ],
  );
}

const PopoverContext = React.createContext<Record<string, any> | null>(null);

export const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);

  if (context == null) {
    throw new Error(
      'Popover components must be wrapped in <Popover />',
    );
  }

  return context;
};

export const Popover = ({
  children,
  content,
  autoTrigger = true,
  ...options
}:PopoverProps) => {
  // This can accept any props as options, e.g. `placement`,
  // or other positioning options.
  const popover = usePopover(options);
  return (
    <PopoverContext.Provider value={popover}>
      {autoTrigger ? (
        <>
          <PopoverTrigger>
            {children}
          </PopoverTrigger>
          <PopoverContent>
            {typeof content == 'function' ? content() : content}
          </PopoverContent>
      </>): children
      }      
    </PopoverContext.Provider>
  );
}

export const PopoverTrigger = React.forwardRef<HTMLElement,Record<string, any>>(
  (
    {children,  ...props},
    propRef,
  ) => {

    const context = usePopoverContext();

    const {
      ref:childrenRef,
      props:childProps
    } = children;

    const ref = useMergeRefs([
      context.refs.setReference,
      propRef,
      childrenRef,
    ]);

    // `asChild` allows the user to pass any element as the anchor
    if (!React.isValidElement(children))
      return null;
    
    return React.cloneElement(
      children,
      context.getReferenceProps({
        ref,
        ...props,
        ...childProps,
        'data-state': context.open ? 'open' : 'closed',
      }),
    );
  },
);

export const PopoverContent = React.forwardRef<HTMLElement, Record<string, any>>(
  (props, propRef) => {

    const {
      context: floatingContext, 
      options, 
      ...context
    } = usePopoverContext();

    const ref = useMergeRefs([
      context.refs.setFloating,
      propRef,
    ]);

    //console.log("context:", floatingContext, "\noptions:", options, "\n...context:", context, "\npopoverContext:", popoverContext);

    const theme = useTheme();

    const id = useId();
    const {isInstantPhase, currentId} = useDelayGroupContext();

    useDelayGroup(floatingContext, {
      id,
    });
    
    const {open} = floatingContext;

    const {
      animated = true,
      hasArrow = true,
      style: popoverStyle, 
      modal = false
    } = options;

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
          opacity: open ? 1 : 0,
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
      children,
      ...others
    }: Record<string, any> = props;

    const {palette} = theme;

    //console.log("getFloatingProps:", context.getFloatingProps(props));
    return (
      <FloatingPortal>
        <FloatingFocusManager
          context={floatingContext}
          modal={modal }
        >
          <AnimatePresence>
            <PositionWrapper
              ref={ref}
              style={{
                position: context.strategy,
                top: context.y ?? 0,
                left: context.x ?? 0,
                width: 'max-content',
                zIndex: theme.zIndex.modal, 
                ...styles, 
              }}
              aria-labelledby={context.labelId}
              aria-describedby={context.descriptionId}
              {...context.getFloatingProps(props)}
            > 
              
              <PopoverOverlay 
                animated={false}
                style={popoverStyle}>
                {children}
                {hasArrow && <FloatingArrow
                  ref={context.arrowRef}
                  context={floatingContext}
                  height={10}
                  strokeWidth={1}
                  tipRadius={2}
                  fill={(theme.vars || theme).palette.background.paper } 
                  stroke={(theme.vars || theme).palette.divider}
                />}
              </PopoverOverlay>
            </PositionWrapper>
          </AnimatePresence>
        </FloatingFocusManager>
      </FloatingPortal>
    );
  },
);

const PopoverHeading = React.forwardRef<HTMLElement, Record<string,any>>(
  ({children, ...props}, ref) => {
    const {setLabelId} = usePopoverContext();
    const id = useId();

    // Only sets `aria-labelledby` on the Popover root element
    // if this component is mounted inside it.
    React.useLayoutEffect(() => {
      setLabelId(id);
      return () => setLabelId(undefined);
    }, [id, setLabelId]);

    return (

      //@ts-expect-error no thing
      <Header {...props} ref={ref} id={id}>
        {children}
      </Header>
    );
  },
);

const PopoverBody = React.forwardRef<HTMLElement, Record<string, any>>(
  ({children, ...props}, ref) => {
    const {setDescriptionId} = usePopoverContext();
    const id = useId();

    // Only sets `aria-describedby` on the Popover root element
    // if this component is mounted inside it.
    React.useLayoutEffect(() => {
      setDescriptionId(id);
      return () => setDescriptionId(undefined);
    }, [id, setDescriptionId]);

    return (
      //@ts-expect-error no thing
      <Body {...props} ref={ref} id={id}>
        {children}
      </Body>
    );
  }
);

export const PopoverClose = React.forwardRef<HTMLElement, ComponentProps>(
  ({children, ...props}, ref) => {
    const {setOpen} = usePopoverContext();
    const {Component=Button, onClick} = props;
    return (
      <Component
        type="button"
        variant="action"
        {...props}
        ref={ref}
        onClick={(event:any) => {
          onClick?.(event);
          setOpen(false);
        }}
      >
        {children}
      </Component>
    );
  },
);


const PopoverOverlay = styled(
  React.forwardRef<HTMLElement, ComponentProps>(
    ({children, ...props}, ref) => {
      const {Component='div', animated, theme, ...rest} = props; 
      return (
        <Component {...rest} ref={ref}>{children}</Component>
      );
    } 
  )
)`
  position: relative;
  border-radius: calc(2 * var(--mui-shape-borderRadius)); 
  background: var(--mui-palette-background-paper);
  box-shadow: rgba(58, 17, 95, 0.14) 0px 0px 0px 1px, rgba(43, 34, 51, 0.12) 0px 4px 24px;
  font-size: ${p => p.theme.typography.fontSize +'px'};
  /* Override z-index from useOverlayPosition */
  z-index: 5!important;
  ${p => p.animated && `will-change: transform, opacity;`}
  width: 295px;
  line-height: 1.2; 
  h6 {
    color: ${p => p.theme.palette.text.primary};
    font-size: .8rem;
    margin-bottom: ${space(1)};
    text-transform: uppercase;
  }
`;

const Header = styled('div')`
  font-size: ${p => p.theme.typography.body1};
  background: ${p => p.theme.palette.mode === 'dark' 
    ? p.theme.palette.grey[800] 
    :  p.theme.palette.action.activeGray};
  border-bottom: 1px solid ${p => p.theme.palette.action.disabled};
  border-radius: 8px 8px 0 0;
  font-weight: ${p => p.theme.typography.fontWeightBold};
  word-wrap: break-word;
  padding: ${p => p.theme.spacing(1.5)};
`;

const Body = styled('div')`
  padding: ${space(2)};
  min-height: 30px;
`;

Popover.Header = PopoverHeading;
Popover.Body = PopoverBody;
//Popover.Divider = Divider;
Popover.Close = PopoverClose;