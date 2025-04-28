"use client";
import React, { ComponentType, ElementType, forwardRef, useImperativeHandle, useRef } from "react";
// types
import { styled, memoTheme, SxThemeProps } from "../../styles";
import {
  getTransitionProps,
  getTransition,
  reflow,
  TransitionProps,
} from "../../lib/transitions";
import { Box } from "../Box";
import { Transition } from "react-transition-group";

const CollapseRoot = styled("div", {
  name: "MuxCollapse",
  slot: "Root",
  overridesResolver: (props, styles) => styles.root,
})(
  memoTheme((theme) => ({
    overflow: "hidden",
    minWidth: 0,
    minHeight: 0,
    variants: [
      {
        props: {
          vertical: true,
          open: false,
        },
        style: {
          height: 0,
        },
      },
      {
        props: {
          vertical: true,
          open: true,
          state: "entered",
        },
        style: {
          height: "auto",
        },
      },
      {
        props: {
          vertical: false,
          open: false,
        },
        style: {
          width: 0,
        },
      },
      {
        props: {
          vertical: false,
          open: true,
          state: "entered",
        },
        style: {
          width: "auto",
        },
      },
      {
        props: {
          state: "entered",
        },
        style: {
          overflow: "visible",
        },
      },
      {
        props: {
          state: "exited",
        },
        style: {
          visibility: "hidden",
        },
      },
    ],
  })),
);

export interface CollapseProps extends TransitionProps {
  open?: boolean;
  horizontal?: boolean;
  keepMounted?: boolean;
  className?: string;
  sx?: SxThemeProps;
  as?: ElementType | ComponentType | undefined;
}

export const Collapse = forwardRef<HTMLDivElement, CollapseProps>(
  (
    {
      horizontal,
      timeout = 300,
      children,
      className,
      onEnter,
      onEntering,
      onEntered,
      onExit,
      onExiting,
      onExited,
      keepMounted,
      open:openProps=false,
      as,
      sx,
      ...props
    },
    forwardRef,
  ) => {

    const ref = useRef<HTMLDivElement  | null>(null);

    useImperativeHandle<HTMLDivElement | null, HTMLDivElement | null>(
      forwardRef, () => ref.current);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const size = horizontal ? "width" : "height";
    const open = openProps ?? props.in ?? false;

    const getWrapperSize = () => {
      const wrapper = wrapperRef.current;
      if (wrapper) {
        const position = wrapper.style.position;
        const visibility = wrapper.style.visibility;
        const side = horizontal ? "clientWidth" : "clientHeight";
        try {
          wrapper.style.visibility = "hidden";
          wrapper.style.position = "absolute";
          return wrapper[side];
        } finally {
          wrapper.style.position = position;
          wrapper.style.visibility = visibility;
        }
      }
      return 0;
    };

    function handleEnter(isAppearing: boolean) {
      const node = ref.current!;
      node.style[size] = "0";
      if (onEnter) {
        onEnter(node, isAppearing);
      }
    }

    const handleEntering = (isAppearing: boolean) => {
      const node = ref.current!;
      const style = node.style;
      const wrapperSize = getWrapperSize();
      const options = getTransitionProps("enter", { timeout, style });

      node.style[size] = `${wrapperSize}px`;
      node.style.transition = getTransition(size, options);

      if (onEntering) {
        onEntering(node, isAppearing);
      }
    };

    const handleEntered = (isAppearing: boolean) => {
      const node = ref.current!;
      node.style[size] = "auto";

      if (onEntered) {
        onEntered(node, isAppearing);
      }
    };

    const handleExit = () => {
      const node = ref.current!;
      const wrapperSize = getWrapperSize();

      node.style[size] = `${wrapperSize}px`;
      reflow(node);

      if (onExit) {
        onExit(node);
      }
    };

    const handleExiting = () => {
      const node = ref.current!;
      const style = node.style;
      const options = getTransitionProps("exit", { timeout, style });

      node.style[size] = "0";
      node.style.transition = getTransition(size, options);

      if (onExiting) {
        onExiting(node);
      }
    };

    const handleExited = () => {
      const node = ref.current!;
      if (onExited) {
        onExited(node);
      }
    };

    return (
      <Transition
        timeout={timeout}
        onEnter={handleEnter}
        onEntering={handleEntering}
        onEntered={handleEntered}
        onExit={handleExit}
        onExiting={handleExiting}
        onExited={handleExited}
        nodeRef={ref}
        
        {...props}
        in={open}
      >
        {(state) => {
          const ownerState = {
            state,
            open,
            vertical: !horizontal,
          };
          return (
            <CollapseRoot
              ownerState={ownerState}
              ref={forwardRef}
              sx={sx}
              as={as}
            >
              <Box
                ref={wrapperRef}
                display="flex"
                minWidth={0}
                minHeight={0}
                className={className}
              >
                <Box minWidth={0} minHeight={0}>
                  {typeof children === "function" && children(state)}
                  {typeof children !== "function" && children}
                </Box>
              </Box>
            </CollapseRoot>
          );
        }}
      </Transition>
    );
  },
);

Collapse.displayName = "Mux.Collapse";

export default Collapse;
