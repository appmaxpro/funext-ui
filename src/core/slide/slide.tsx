import { cloneElement, forwardRef, isValidElement } from "react";
import { Transition } from "react-transition-group";
import { useForwardedRef, useRefs } from "../hooks";
import { useCoreTheme } from "../styles";
import { TransitionProps } from "../transitions/types";
import {
  getTransition,
  getTransitionProps,
  getTransitionStyle,
  reflow,
} from "../transitions/utils";
import { useRtl, useTheme, debounce } from "../../mui";
import React from "react";
import getReactElementRef from "../../mui/utils/getReactElementRef";

type Direction = "start" | "end" | "up" | "down";

export interface SlideProps extends TransitionProps {
  direction?: Direction;
  temporary?: boolean;
  container?: HTMLElement | (() => HTMLElement | null | undefined);
  style?: Partial<CSSStyleDeclaration>;
}

const styles = {
  exited: {
    translate: "translateX(-100000px)",
    transform: "none",
    visibility: "hidden",
  },
};

const ownerWindow = (node: HTMLElement) => {
  return (node.ownerDocument || document).defaultView || window;
};

const getDirection = (direction: Direction, rtl: boolean) => {
  if (rtl) {
    if (direction === "start") return "end";
    if (direction === "end") return "start";
  }
  return direction;
};

const getTransitionProperty = (
  directionGiven: Direction,
  temporary: boolean,
  rtl: boolean,
) => {
  if (!temporary) {
    const direction = getDirection(directionGiven, rtl);
    if (direction === "start" || direction === "end") {
      return "width";
    }

    return "height";
  }
  return "transform";
};

// Translate the node so it can't be seen on the screen.
// Later, we're going to translate the node back to its original location with `none`.
function getTranslateValue(
  node: HTMLElement,
  directionGiven: Direction,
  rtl: boolean,
  resolvedContainer?: HTMLElement,
) {
  const direction = getDirection(directionGiven, rtl);
  const rect = node.getBoundingClientRect();
  const containerRect =
    resolvedContainer && resolvedContainer.getBoundingClientRect();
  const containerWindow = ownerWindow(node);
  let transform;

  if ((node as any).fakeTransform) {
    transform = (node as any).fakeTransform;
  } else {
    const computedStyle = containerWindow.getComputedStyle(node);
    transform =
      computedStyle.getPropertyValue("-webkit-transform") ||
      computedStyle.getPropertyValue("transform");
  }

  let offsetX = 0;
  let offsetY = 0;

  if (transform && transform !== "none" && typeof transform === "string") {
    const transformValues = transform.split("(")[1].split(")")[0].split(",");
    offsetX = parseInt(transformValues[4], 10);
    offsetY = parseInt(transformValues[5], 10);
  }

  if (direction === "start") {
    if (containerRect) {
      return `translateX(${containerRect.right + offsetX - rect.left}px)`;
    }

    return `translateX(${containerWindow.innerWidth + offsetX - rect.left}px)`;
  }

  if (direction === "end") {
    if (containerRect) {
      return `translateX(-${rect.right - containerRect.left - offsetX}px)`;
    }

    return `translateX(-${rect.left + rect.width - offsetX}px)`;
  }

  if (direction === "up") {
    if (containerRect) {
      return `translateY(${containerRect.bottom + offsetY - rect.top}px)`;
    }
    return `translateY(${containerWindow.innerHeight + offsetY - rect.top}px)`;
  }

  // direction === 'down'
  if (containerRect) {
    return `translateY(-${rect.top - containerRect.top + rect.height - offsetY}px)`;
  }
  return `translateY(-${rect.top + rect.height - offsetY}px)`;
}

function resolveContainer(containerPropProp: any) {
  return typeof containerPropProp === "function"
    ? containerPropProp()
    : containerPropProp;
}

export function setTranslateValue(
  node: HTMLElement,
  direction: Direction,
  rtl: boolean,
  containerProp: any,
) {
  const resolvedContainer = resolveContainer(containerProp);
  const transform = getTranslateValue(node, direction, rtl, resolvedContainer);

  if (transform) {
    node.style.webkitTransform = transform;
    node.style.transform = transform;
  }
}

export const Slide = forwardRef<HTMLElement, SlideProps>((props, ref) => {
  const theme = useTheme();
  const defaultEasing = {
    enter: theme.transitions.easing.easeOut,
    exit: theme.transitions.easing.sharp,
  };

  const defaultTimeout = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const rtl = useRtl();

  const {
    appear = true,
    children,
    container: containerProp,
    direction = 'down',
    easing: easingProp = defaultEasing,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,
    timeout = defaultTimeout,
    style = {},
    ...rest
  } = props;

  const childrenRef = React.useRef(null);
  const handleRef = useRefs(
    getReactElementRef(children as any),
    childrenRef,
    ref,
  );

  const normalizedTransitionCallback =
    (callback: any) => (isAppearing?: boolean) => {
      if (callback) {
        // onEnterXxx and onExitXxx callbacks have a different arguments.length value.
        if (isAppearing === undefined) {
          callback(childrenRef.current);
        } else {
          callback(childrenRef.current, isAppearing);
        }
      }
    };

  const handleEnter = normalizedTransitionCallback(
    (node: HTMLDivElement, isAppearing: boolean) => {
      setTranslateValue(node, direction, rtl, containerProp);
      reflow(node);

      if (onEnter) {
        onEnter(node, isAppearing);
      }
    },
  );

  const handleEntering = normalizedTransitionCallback(
    (node: HTMLElement, isAppearing: boolean) => {
      const transitionProps = getTransitionProps("enter", {
        timeout,
        style: style ?? node.style,
        easing: easingProp,
      });

      node.style.webkitTransition = theme.transitions.create(
        "-webkit-transform",
        {
          ...transitionProps,
        },
      );

      node.style.transition = theme.transitions.create("transform", {
        ...transitionProps,
      });

      node.style.webkitTransform = "none";
      node.style.transform = "none";
      if (onEntering) {
        onEntering(node, isAppearing);
      }
    },
  );

  const handleEntered = normalizedTransitionCallback(onEntered);
  const handleExiting = normalizedTransitionCallback(onExiting);

  const handleExit = normalizedTransitionCallback((node: HTMLElement) => {
    const transitionProps = getTransitionProps("exit", {
      timeout,
      style: style ?? node.style,
      easing: easingProp,
    });

    node.style.webkitTransition = theme.transitions.create(
      "-webkit-transform",
      transitionProps,
    );
    node.style.transition = theme.transitions.create(
      "transform",
      transitionProps,
    );

    setTranslateValue(node, direction, rtl, containerProp);

    if (onExit) {
      onExit(node);
    }
  });

  const handleExited = normalizedTransitionCallback((node: HTMLElement) => {
    // No need for transitions when the component is hidden
    node.style.webkitTransition = "";
    node.style.transition = "";

    if (onExited) {
      onExited(node);
    }
  });

  const updatePosition = React.useCallback(() => {
    if (childrenRef.current) {
      setTranslateValue(childrenRef.current, direction, rtl, containerProp);
    }
  }, [direction, containerProp]);

  React.useEffect(() => {
    // Skip configuration where the position is screen size invariant.
    if (
      !childrenRef.current ||
      inProp ||
      direction === "down" ||
      direction === "end"
    ) {
      return undefined;
    }

    const handleResize = debounce(() => {
      if (childrenRef.current) {
        setTranslateValue(childrenRef.current, direction, rtl, containerProp);
      }
    });

    const containerWindow = ownerWindow(childrenRef.current);
    containerWindow.addEventListener("resize", handleResize);
    return () => {
      handleResize.clear();
      containerWindow.removeEventListener("resize", handleResize);
    };
  }, [direction, inProp, containerProp]);

  React.useEffect(() => {
    if (!inProp) {
      // We need to update the position of the drawer when the direction change and
      // when it's hidden.
      updatePosition();
    }
  }, [inProp, updatePosition]);

  return (
    <Transition
      nodeRef={childrenRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      appear={appear}
      in={inProp}
      timeout={timeout}
      {...rest}
    >
      {(state, childProps) => {
        return isValidElement(children) && React.cloneElement(children, {
          //@ts-ignore
          ref: handleRef as any,
          style: {
            visibility: state === 'exited' && !inProp ? 'hidden' : undefined,
            ...style,
            ...children.props.style,
          },
          ...childProps,
        });
      }}
    </Transition>
  );
});
