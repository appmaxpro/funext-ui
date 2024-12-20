"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";

// @floating-ui
import {
  useFloating,
  useInteractions,
  useClick,
  useRole,
  useDismiss,
  useId,
  FloatingPortal,
  FloatingOverlay,
  FloatingFocusManager,
  FloatingRootContext,
  useMergeRefs,
  autoUpdate,
  arrow as fuArrow,
  offset as fuOffset,
  FloatingArrow,
  size,
  flip,
  shift,
  limitShift,
  OpenChangeReason,
} from "@floating-ui/react";

// @floating-ui props
import type {
  UseFloatingOptions,
  UseInteractionsReturn,
  UseFloatingReturn,
  UseRoleProps,
  UseClickProps,
  UseHoverProps,
  SizeOptions,
  FlipOptions,
  ShiftOptions,
  FloatingFocusManagerProps,
  ElementProps,
  MiddlewareState,
  Middleware,
  FloatingOverlayProps,
} from "@floating-ui/react";

// framer-motion
import {
  AnimatePresence,
  m,
  domAnimation,
  LazyMotion,
  useIsPresent,
} from "framer-motion";
// utils
import merge from "deepmerge";
import { useTailwindTheme } from "../../theme";
// types
import type {
  NewAnimatePresenceProps,
  ArrowProps,
  Placement,
  Strategy,
  DismissProps,
  OffsetProps,
  AnimationProps,
} from "../../types/generic";
import { json } from "stream/consumers";
import { SxComponentProps, clsx, styled, StyledComponent } from "../../styles";
import { isElement } from "../../utils";
import { HtmlAttributes } from "csstype";
import { useControlled } from "../../hooks";
import { MuxFloatingProvider } from "../Context";

export declare type Derivable<T> = (state: MiddlewareState) => T;

export const getOffsetTop = (rect: any, vertical: any): number => {
  let offset = 0;

  if (typeof vertical === "number") {
    offset = vertical;
  } else if (vertical === "center") {
    offset = rect.height / 2;
  } else if (vertical === "bottom") {
    offset = rect.height;
  }

  return offset;
};

export function getOffsetLeft(rect: any, horizontal: any): number {
  let offset = 0;

  if (typeof horizontal === "number") {
    offset = horizontal;
  } else if (horizontal === "center") {
    offset = rect.width / 2;
  } else if (horizontal === "right") {
    offset = rect.width;
  }

  return offset;
}

function getTransformOriginValue(transformOrigin: {
  horizontal: any;
  vertical: any;
}) {
  return [transformOrigin.horizontal, transformOrigin.vertical]
    .map((n) => (typeof n === "number" ? `${n}px` : n))
    .join(" ");
}

function resolveAnchorEl(anchorEl: any) {
  return typeof anchorEl === "function" ? anchorEl() : anchorEl;
}
const defaultBackdropStyle: React.CSSProperties = {
  display: "grid",
  placeItems: "place-items-center",
  position: "fixed",
  top: 0,
  left: 0,
  width: "w-screen",
  height: "h-screen",
  backgroundColor: "bg-black/30",
  backdropFilter: "backdrop-blur-sm",
};

const animation = {
  unmount: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3,
    },
  },
  mount: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export declare type Backdrop = React.HTMLAttributes<"div"> & {
  className?: string;
  animate?: AnimationProps | false;
  duration?: number;
  style?: React.CSSProperties;
};

export declare type Overlay = FloatingOverlayProps & {
  style?: any;
  className?: string;
};

export interface PopperFocusProps
  extends Omit<FloatingFocusManagerProps, "children" | "context"> {
  key?: any;
}

interface PopperContextValue extends React.ComponentProps<"div"> {
  getFloatingProps: UseInteractionsReturn["getFloatingProps"];
  getReferenceProps: UseInteractionsReturn["getReferenceProps"];
  getItemProps?: UseInteractionsReturn["getItemProps"];
  floating: UseFloatingReturn;
  arrowRef: React.MutableRefObject<HTMLElement | null>;
  focusProps?: PopperFocusProps;
  arrow?: ArrowProps;
  animate?: AnimationProps;
  backdrop?: Backdrop;
  overlay?: Overlay;
  className?: string;
  open: boolean;
  openState: boolean;
  setOpenState: (open: boolean) => void;
  labelId: string;
  descriptionId: string;
  handler: UseFloatingOptions["onOpenChange"];
}

export const PopperContext = React.createContext<PopperContextValue | null>(
  null,
);
PopperContext.displayName = "Mux.PopperContext";

export function usePopper(): PopperContextValue {
  const context = React.useContext(PopperContext);

  if (!context) {
    throw new Error(
      "usePopper() must be used within a Popper. It happens when you use outside the Popper component.",
    );
  }

  return context;
}
export interface PopperContextProps<T = HTMLElement | null> {
  open?: boolean;
  handler?: UseFloatingOptions["onOpenChange"];
  onCompleteState?: (open: boolean) => void;

  strategy?: Strategy;
  placement?: Placement;
  offset?: OffsetProps;
  autoFlip?: FlipOptions | Derivable<FlipOptions>;
  autoShift?: ShiftOptions | Derivable<ShiftOptions>;
  autoSize?: SizeOptions | Derivable<SizeOptions>;
  arrow?: ArrowProps;
  roles?: UseRoleProps;
  dismiss?: DismissProps;
  middleware?: Array<Middleware | null | undefined | false>;
  interactions?: (context: FloatingRootContext) => Array<ElementProps | void>;
  target?: React.MutableRefObject<T> | T | null;
}

export interface SharedPopperProps {
  focusProps?: PopperFocusProps;
  animate?: AnimationProps | boolean;
  backdrop?: Backdrop;
  overlay?: Overlay;
  contentProps?: SxComponentProps;
  type?: string;
}

export interface PopperProps<T = HTMLElement | null>
  extends PopperContextProps<T>,
    SharedPopperProps,
    Omit<React.ComponentProps<"div">, "style"> {
  className?: string;
  id?: string;
  root?: HTMLElement | null | React.MutableRefObject<HTMLElement | null>;
  renderContent?: boolean;
  disablePortal?: boolean;
  keepMounted?: boolean;
  trigger?: React.ReactNode;
  style?: PopperContentProps["style"];
}

export function usePopperContext(
  props: PopperContextProps,
): PopperContextValue {
  const {
    open: openProps,
    handler,
    dismiss,
    roles,
    arrow,
    offset,
    autoFlip,
    autoShift,
    autoSize,
    strategy,
    placement,
    middleware,
    interactions,
    target,
    onCompleteState,
    ...rest
  } = props;

  // 1. init
  const arrowRef = useRef(null);

  const stateRef = useRef([]);
  const [open, setOpen] = useControlled<boolean>({
    name: "open",
    state: openProps,
    defaultState: false,
    prop: "OpenPopper",
  });

  const [openState, setOpenState] = useState(open ?? false);

  const handleOpenSate = (
    open: boolean,
    event?: Event,
    reason?: OpenChangeReason,
  ) => {
    handler?.(open, event, reason);
    if (openProps === undefined) {
      setOpen(open);
    }
  };

  // 2. set @floating-ui
  const floating = useFloating<HTMLElement>({
    open,
    onOpenChange: handleOpenSate,
    whileElementsMounted: autoUpdate,
    strategy: strategy,
    placement: placement,
    elements: target
      ? {
          reference: isElement(target) ? target : target?.current,
        }
      : undefined,
    middleware: [
      offset && fuOffset(offset),
      autoFlip && flip(autoFlip),
      autoShift && shift(autoShift),
      autoSize && size(autoSize),
      arrow &&
        fuArrow({
          element: arrowRef,
          padding: arrow.padding ?? 5,
        }),
      ...((middleware || []) as Array<Middleware | null | undefined | false>),
    ].filter(Boolean) as Array<Middleware | null | undefined | false>,
  });

  const { getFloatingProps, getReferenceProps, getItemProps } = useInteractions(
    [
      //useClick(floating.context),
      roles && useRole(floating.context, roles),
      dismiss && useDismiss(floating.context, dismiss),
      ...((interactions?.(floating.context) ||
        []) as Array<ElementProps | void>),
    ].filter(Boolean),
  );

  React.useEffect(() => {
    onCompleteState?.(openState);
  }, [openState, onCompleteState]);

  React.useEffect(() => {
    const el = isElement(target) ? target : target?.current;
    if (el !== undefined && el != floating.elements.reference) {
      floating.refs.setReference(el as any);
    }
  }, [floating.refs.setReference, target]);

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  //opacity 223ms cubic-bezier(0.4, 0, 0.2, 1) 0ms,
  // transform 149ms cubic-bezier(0.4, 0, 0.2, 1) 0ms
  // 5. set animation

  const contextValue = React.useMemo(
    () => ({
      ...rest,
      open: open!,
      floating,
      getFloatingProps,
      getReferenceProps,
      getItemProps,
      labelId,
      descriptionId,
      arrowRef,
      arrow,
      handler: handleOpenSate,
      setOpenState,
      openState,
    }),
    [
      open,
      floating.refs.setFloating,
      floating.refs.setReference,
      floating.x,
      floating.y,
      floating.placement,
      floating.middlewareData,
      getFloatingProps,
      getReferenceProps,
      labelId,
      descriptionId,
      openState,
      setOpenState,
      JSON.stringify(arrow),
    ],
  );

  return contextValue;
}

export const Popper = ({
  open,
  handler,
  dismiss,
  roles,
  arrow,
  offset,
  autoFlip,
  autoShift,
  autoSize,
  strategy,
  placement,
  target,
  middleware,
  interactions,
  onCompleteState,
  ...rest
}: PopperProps) => {
  const contextValue = usePopperContext({
    open,
    handler,
    dismiss,
    roles,
    arrow,
    offset,
    autoFlip,
    autoShift,
    autoSize,
    strategy,
    placement,
    target,
    middleware,
    interactions,
    onCompleteState,
  });

  // 7. return
  return <PopperPortal context={contextValue} {...rest} />;
};

export interface PopperPortalProps
  extends Omit<React.ComponentProps<"div">, "style">,
    SharedPopperProps {
  id?: string;
  root?: HTMLElement | null | React.MutableRefObject<HTMLElement | null>;
  renderContent?: boolean;
  disablePortal?: boolean;
  keepMounted?: boolean;
  context: PopperContextValue;
  trigger?: React.ReactNode;
  style?: PopperContentProps["style"];
}

export const PopperPortal = ({
  context,
  id,
  root,
  children,
  renderContent = !children || (children as any).type !== PopperContent,
  disablePortal,
  keepMounted,
  focusProps,
  trigger,
  type = "popper",
  ...rest
}: PopperPortalProps) => {
  const { open, openState, setOpenState } = context;

  const [initialized, setInitialized] = useState(false);

  React.useEffect(() => {
    if (open && !initialized) {
      setInitialized(true);
    }
  }, [open]);

  // 3. Create an instance of AnimatePresence because of the types issue with the children
  const NewAnimatePresence: React.FC<NewAnimatePresenceProps> = AnimatePresence;

  if (!initialized && !keepMounted && !trigger) {
    //console.log("Portal:", id, ", not mounted")
    return null;
  }

  const shouldOpen = openState || open;
  const popperProvider = (
    <PopperContext.Provider value={context}>
      {trigger ? <PopperHandler>{trigger}</PopperHandler> : null}
      <NewAnimatePresence
        presenceAffectsLayout={false}
        onExitComplete={() => {
          console.log("AnimatePresence:onExitComplete");
          setOpenState(false);
        }}
      >
        {shouldOpen ? (
          renderContent ? (
            <PopperContent {...rest} internal>
              {children}
            </PopperContent>
          ) : (
            children
          )
        ) : null}
      </NewAnimatePresence>
    </PopperContext.Provider>
  );
  // 7. return
  return (
    <LazyMotion features={domAnimation}>
      <MuxFloatingProvider type={type} context={context.floating}>
        {disablePortal ? (
          <PopperContext.Provider value={context}>
            {trigger ? <PopperHandler>{trigger}</PopperHandler> : null}
            <NewAnimatePresence
              presenceAffectsLayout={false}
              onExitComplete={() => {
                console.log("AnimatePresence:onExitComplete");
                setOpenState(false);
              }}
            >
              {shouldOpen ? (
                renderContent ? (
                  <PopperContent {...rest} internal>
                    {children}
                  </PopperContent>
                ) : (
                  children
                )
              ) : null}
            </NewAnimatePresence>
          </PopperContext.Provider>
        ) : (
          <PopperContext.Provider value={context}>
            {trigger ? <PopperHandler>{trigger}</PopperHandler> : null}
            <FloatingPortal root={root} id={id}>
              <NewAnimatePresence
                presenceAffectsLayout={false}
                onExitComplete={() => {
                  setOpenState(false);
                }}
              >
                {shouldOpen ? (
                  renderContent ? (
                    <PopperContent {...rest} internal>
                      {children}
                    </PopperContent>
                  ) : (
                    children
                  )
                ) : null}
              </NewAnimatePresence>
            </FloatingPortal>
          </PopperContext.Provider>
        )}
      </MuxFloatingProvider>
    </LazyMotion>
  );
};

Popper.displayName = "Mux.Popper";

export interface PopperContentProps
  extends Omit<SxComponentProps<"div">, "style">,
    SharedPopperProps {
  internal?: boolean;
  style?:
    | ((context: UseFloatingReturn) => React.CSSProperties | null)
    | React.CSSProperties
    | undefined;
  [key: string]: any;
}

const PopperRoot = styled("div", {
  name: "MuxPopper",
  slot: "Root",
})("");

const PopperBackdrop = styled("div", {
  name: "Backdrop",
  slot: "MuxPopper",
})<SxComponentProps<any>>({
  zIndex: -1,
  inset: 0,
});

const PopperContentRoot = styled("div", {
  name: "Content",
  slot: "MuxPopper",
})("");

export const PopperContent = React.forwardRef<
  HTMLDivElement,
  PopperContentProps
>(
  (
    {
      animate,
      focusProps,
      overlay,
      backdrop,
      internal,
      children,
      contentProps,
      onClick,
      sx,
      ...props
    },
    ref,
  ) => {
    const {
      getFloatingProps,
      floating,
      arrowRef,
      arrow,
      open,
      labelId,
      descriptionId,
      openState,
      setOpenState,
    } = usePopper();
    const isPresent = useIsPresent();
    //const [isPresent, safeToRemove] = usePresence()
    const { refs, context, x, y, strategy, floatingStyles } = floating;

    const mergedRef = useMergeRefs([ref, refs.setFloating]);
    const disableAnimation = typeof animate === "boolean" ? !animate : false;
    const animation = !disableAnimation ? animate : undefined;

    useEffect(() => {
      if (!animation || isPresent) {
        setOpenState(!animation ? false : isPresent);
      }
    }, [animation, isPresent, setOpenState]);

    const content = (
      <PopperRoot
        {...(props as any)}
        {...getFloatingProps({
          ref: mergedRef,
          style:
            typeof props.style === "function"
              ? props.style(floating)
              : {
                  position: strategy,
                  ...floatingStyles,
                  ...props.style,
                },
        } as any)}
        key={"content-" + labelId}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        {...(animation
          ? {
              onAnimationComplete: () => {
                console.log(
                  `---------onAnimationComplete(open:${open}, openState:${openState})-------------`,
                );
                setOpenState(open);
              },
              initial: "unmount",
              exit: "unmount",
              animate: open ? "mount" : "unmount",
              variants: animation,
              as: m.div,
            }
          : undefined)}
      >
        {arrow || contentProps ? (
          <PopperContentRoot {...contentProps}>{children}</PopperContentRoot>
        ) : (
          children
        )}

        {arrow ? (
          <FloatingArrow
            {...arrow.props}
            ref={arrowRef as any}
            context={context}
          />
        ) : null}
      </PopperRoot>
    );

    const backdropAnimate = useMemo(
      () =>
        !disableAnimation &&
        backdrop &&
        backdrop.animate !== false &&
        merge(
          {
            unmount: {
              opacity: 0,
              transition: {
                delay: 0.2,
              },
            },
            mount: {
              opacity: 1,
            },
          },
          backdrop!.animate || ({} as any),
        ),
      [backdrop],
    );

    const backdropContent = backdrop ? (
      <PopperBackdrop
        {...backdrop}
        key={"backdrop-" + labelId}
        className={
          backdrop.className ??
          "transition-all	bg-slate-950/[.3] dark:bg-slate-100/[.3]"
        }
        style={{
          position: strategy,
          ...backdrop.style,
        }}
        {...(backdropAnimate && {
          initial: "unmount",
          exit: "unmount",
          variants: backdropAnimate,
          duration: backdrop.duration ?? 0.2,
          animate: open ? "mount" : "unmount",
          as: m.div,
        })}
      />
    ) : null;

    const focusContent = focusProps ? (
      <>
        {backdropContent}
        <FloatingFocusManager {...focusProps} context={context}>
          {content}
        </FloatingFocusManager>
      </>
    ) : (
      <>
        {backdropContent}
        {content}
      </>
    );

    return overlay ? (
      <FloatingOverlay {...overlay}>{focusContent}</FloatingOverlay>
    ) : (
      focusContent
    );
  },
);

PopperContent.displayName = "Mux.PopperContent";

export interface PopperHandlerProps extends React.ComponentProps<any> {
  children: ReactNode | React.ComponentProps<any>;
}

export const PopperHandler = React.forwardRef<
  HTMLDivElement,
  PopperHandlerProps
>(({ children, ...rest }, ref) => {
  const { getReferenceProps, floating } = usePopper();

  const mergedRef = useMergeRefs([ref, floating.refs.setReference]);

  return React.cloneElement(children, {
    ...getReferenceProps({
      ...rest,
      ref: mergedRef,
    }),
  });
});
PopperHandler.displayName = "Mux.PopperHandler";

export default Object.assign(Popper, {
  Handler: PopperHandler,
  Content: PopperContent,
  limitShift: limitShift,
});
