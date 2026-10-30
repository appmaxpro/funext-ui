"use client";
import React, { forwardRef } from "react";
import { Transition } from "react-transition-group";
import { useRefs } from "../../../hooks";
import { useRtl, useTheme } from "../../../styles";
import { debounce } from "../../../utils";
import { EMPTY_RECORD } from "../../constants";
import { getElementRef } from "../../getElementRef";
import { TransitionProps } from "../types";
import {
  getTransitionProps,
  normalizedTransitionCallback,
  reflow,
} from "../utils";

type Direction = "start" | "end" | "up" | "down";
const hiddenStyles = { visibility: "hidden" };

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
  direction: Direction,
  resolvedContainer?: HTMLElement,
) {
  const containerRect =
    resolvedContainer && resolvedContainer.getBoundingClientRect();
  const containerWindow = ownerWindow(node);

  // Clear the inline transform and transition before reading layout and computed
  // style so we compute from the element's natural position, not its previous
  // off-screen translation. The transition must also be cleared, otherwise the
  // browser may report an animated intermediate value from a still-running
  // enter transition when reading getComputedStyle during exit.
  const previousTransform = node.style.transform;
  const previousTransition = node.style.transition;
  node.style.transition = "";
  node.style.transform = "";

  const rect = node.getBoundingClientRect();
  const computedStyle = containerWindow.getComputedStyle(node);
  const transform = computedStyle.getPropertyValue("transform");
  node.style.transform = previousTransform;
  node.style.transition = previousTransition;

  let offsetX = 0;
  let offsetY = 0;

  if (transform && transform !== "none" && typeof transform === "string") {
    const transformValues = transform.split("(")[1].split(")")[0].split(",");
    offsetX = parseInt(transformValues[4], 10);
    offsetY = parseInt(transformValues[5], 10);
  }

  if (direction === "start") {
    if (containerRect) {
      return `translate3d(${containerRect.right + offsetX - rect.left}px, 0, 0)`;
    }

    return `translate3d(${containerWindow.innerWidth + offsetX - rect.left}px, 0, 0)`;
  }

  if (direction === "end") {
    if (containerRect) {
      return `translate3d(-${rect.right - containerRect.left - offsetX}, 0, 0)`;
    }

    return `translate3d(-${rect.left + rect.width - offsetX}px, 0, 0)`;
  }

  if (direction === "up") {
    if (containerRect) {
      return `translate3d(0, ${containerRect.bottom + offsetY - rect.top}px, 0)`;
    }
    return `translate3d(0, ${containerWindow.innerHeight + offsetY - rect.top}px, 0)`;
  }

  // direction === 'down'
  if (containerRect) {
    return `translate3d(0, -${rect.top - containerRect.top + rect.height - offsetY}px, 0)`;
  }
  return `translate3d(0, -${rect.top + rect.height - offsetY}px, 0)`;
}

function resolveContainer(containerPropProp: any) {
  return typeof containerPropProp === "function"
    ? containerPropProp()
    : containerPropProp;
}

export function setTranslateValue(
  node: HTMLElement,
  direction: Direction,
  containerProp: any,
) {
  const resolvedContainer = resolveContainer(containerProp);
  const transform = getTranslateValue(node, direction, resolvedContainer);
  console.log("Slide::setTranslateValue:", transform);
  if (transform) {
    node.style.transform = transform;
  }
}

export const Slide = forwardRef<HTMLElement, SlideProps>((props, ref) => {
  const theme = useTheme();
  const defaultEasing = {
    enter: theme.transitions.easing.easeOut, //cubic-bezier(.32, .72, 0, 1)
    exit: theme.transitions.easing.sharp,
  };

  const defaultTimeout = {
    enter: theme.transitions.duration.enteringScreen,
    exit: theme.transitions.duration.leavingScreen,
  };

  const rtl = useRtl();

  const {
    //@ts-ignore
    addEndListener,
    appear = true,
    children,
    container: containerProp,
    direction: directionProps = "down",
    easing: easingProp = defaultEasing,
    timeout = defaultTimeout,
    in: inProp,
    onEnter,
    onEntered,
    onEntering,
    onExit,
    onExited,
    onExiting,

    style,
    ...rest
  } = props;

  const direction = getDirection(directionProps, rtl);

  const childrenRef = React.useRef<HTMLElement>(null);
  const handleRef = useRefs(getElementRef(children as any), childrenRef, ref);

  const handleEnter = normalizedTransitionCallback(
    childrenRef,
    (node: HTMLElement, isAppearing?: boolean) => {
      setTranslateValue(node, direction, containerProp);
      reflow(node);
      console.log("Slide::handleEnter");
      if (onEnter) {
        onEnter(node, isAppearing ?? false);
      }
    },
  );

  const handleEntering = normalizedTransitionCallback(
    childrenRef,
    (node: HTMLElement, isAppearing?: boolean) => {
      const transitionProps = getTransitionProps("enter", {
        timeout,
        style: style,
        easing: easingProp,
      });

      node.style.transition = theme.transitions.create(
        "transform",
        transitionProps,
      );
      node.style.transform = "none";
      if (onEntering) {
        onEntering(node, isAppearing ?? false);
      }

      console.log("Slide::handleEntering");
    },
  );

  const handleEntered = normalizedTransitionCallback(
    childrenRef,
    (node: HTMLElement, isAppearing?: boolean) => {
      console.log("Slide::handleEntered");
      if (onEntered) {
        onEntered(node, isAppearing ?? false);
      }
    },
  );
  const handleExiting = normalizedTransitionCallback(childrenRef, onExiting);

  const handleExit = normalizedTransitionCallback(
    childrenRef,
    (node: HTMLElement) => {
      const transitionProps = getTransitionProps("exit", {
        timeout,
        style,
        easing: easingProp,
      });
      const transition = theme.transitions.create("transform", transitionProps);
      node.style.transition = transition;

      setTranslateValue(node, direction, containerProp);

      if (onExit) {
        onExit(node);
      }
      console.log("Slide::handleExit");
    },
  );

  const handleExited = normalizedTransitionCallback(
    childrenRef,
    (node: HTMLElement) => {
      // No need for transitions when the component is hidden
      node.style.transition = "";
      if (onExited) {
        onExited(node);
      }
      console.log("Slide::handleExited");
    },
  );

  const handleAddEndListener = (next: any) => {
    if (addEndListener) {
      // Old call signature before `react-transition-group` implemented `nodeRef`
      addEndListener(childrenRef.current, next);
    }
  };

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
        setTranslateValue(childrenRef.current, direction, containerProp);
      }
    });

    const containerWindow = ownerWindow(childrenRef.current);
    containerWindow.addEventListener("resize", handleResize);
    return () => {
      handleResize.clear();
      containerWindow.removeEventListener("resize", handleResize);
    };
  }, [direction, inProp, containerProp, childrenRef.current]);

  React.useEffect(() => {
    if (!inProp && childrenRef.current) {
      // We need to update the position of the drawer when the direction change and
      // when it's hidden.
      setTranslateValue(childrenRef.current, direction, containerProp);
    }
  }, [inProp, direction, containerProp]);

  if (!children) {
    
    return null;
  }
  console.log("Slide:: nodeRef:", childrenRef.current)
  return (
    <Transition
      nodeRef={childrenRef}
      onEnter={handleEnter}
      onEntered={handleEntered}
      onEntering={handleEntering}
      onExit={handleExit}
      onExited={handleExited}
      onExiting={handleExiting}
      addEndListener={handleAddEndListener}
      appear={appear}
      in={inProp}
      timeout={timeout}
      {...rest}
    >
      {/* Ensure "ownerState" is not forwarded to the child DOM element when a direct HTML element is used. This avoids unexpected behavior since "ownerState" is intended for internal styling, component props and not as a DOM attribute. */}
      {(state: any, { ownerState, ...rest2 }: any) => {
        console.log("Slide::TransitionProps:", { ...rest2, state });
        const props = (children as any).props ?? EMPTY_RECORD;
        let childStyle;
        if (state === "exited" && !inProp) {
          childStyle =
            style || props.style
              ? { visibility: "hidden", ...style, ...props.style }
              : hiddenStyles;
        } else if (style && props.style) {
          childStyle = { ...style, ...props.style };
        } else {
          childStyle = style || props.style;
        }

        return React.cloneElement(children as any, {
          ref: handleRef,
          style: childStyle,
          ...rest2,
        });
      }}
    </Transition>
  );
});
export default Slide;
