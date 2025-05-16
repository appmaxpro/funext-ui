import * as React from "react";
import { useEnhancedEffect, useRefs } from "../../hooks";
import { useLayoutEffect } from "../../hooks/use-layout-effect";
import { useStateMachine } from "./use-state-machine";
import { getElementRef } from "../getElementRef";

interface AnimatedPresenceProps {
  children:
    | React.ReactElement
    | ((props: { present: boolean }) => React.ReactElement);
  present: boolean;
}

interface PresenceProps extends AnimatedPresenceProps {
  animate?: boolean;
}

const Presence: React.FC<PresenceProps> = ({ animate, ...rest }) => {
  if (animate) {
    return <AnimatedPresence {...rest} />;
  }
  const { children, present } = rest;

  if (typeof children === "function") {
    return children({ present });
  }

  return present ? children : null;
};

const AnimatedPresence: React.FC<AnimatedPresenceProps> = (props) => {
  const { present, children } = props;
  const presence = usePresence(present);

  const child = (
    typeof children === "function"
      ? children({ present: presence.isPresent })
      : React.Children.only(children)
  ) as React.ReactElement<{ ref?: React.Ref<HTMLElement> }>;

  const ref = useRefs(presence.ref, getElementRef(child));
  const forceMount = typeof children === "function";
  return forceMount || presence.isPresent
    ? React.cloneElement(child, { ref })
    : null;
};

Presence.displayName = "Presence";

/* -------------------------------------------------------------------------------------------------
 * usePresence
 * -----------------------------------------------------------------------------------------------*/
function reset(node: HTMLElement) {
  let timeoutId: number;
  const ownerWindow = node.ownerDocument.defaultView ?? window;
  const currentAnimationName = node.style.animationName;
  node.style.animationName = "none";
  //console.log("Animation FillMode: forwards, currentFillMode:", currentFillMode)
  // Reset the style after the node had time to unmount (for cases
  // where the component chooses not to unmount). Doing this any
  // sooner than `setTimeout` (e.g. with `requestAnimationFrame`)
  // still causes a flash.
  timeoutId = ownerWindow.setTimeout(() => {
    if (node.style.animationName === "none" && currentAnimationName != 'none') {
      node.style.removeProperty("animation-name");
    } 
    if (currentAnimationName) {
      node.style.animationName = currentAnimationName;
    }
  });

  return () => {
    clearTimeout(timeoutId);
  };
}

function usePresence(present: boolean) {
  const [node, setNode] = React.useState<HTMLElement>();
  const stylesRef = React.useRef<CSSStyleDeclaration | null>(null);
  const prevPresentRef = React.useRef(present);
  const prevAnimationNameRef = React.useRef<string>("none");
  const prevAnimationDirRef = React.useRef<string>("normal");

  const initialState = present ? "mounted" : "unmounted";
  const [state, send] = useStateMachine(initialState, {
    mounted: {
      UNMOUNT: "unmounted",
      ANIMATION_OUT: "unmountSuspended",
    },
    unmountSuspended: {
      MOUNT: "mounted",
      ANIMATION_END: "unmounted",
    },
    unmounted: {
      MOUNT: "mounted",
    },
  });

  React.useEffect(() => {
    const [currentAnimationName, direction] = getAnimation(stylesRef.current);

    prevAnimationNameRef.current =
      state === "mounted" ? currentAnimationName : "none";
    prevAnimationDirRef.current = state === "mounted" ? direction : "none";
  }, [state]);

  useLayoutEffect(() => {
    const styles = stylesRef.current;
    const wasPresent = prevPresentRef.current;
    const hasPresentChanged = wasPresent !== present;

    if (hasPresentChanged) {
      const prevAnimationName = prevAnimationNameRef.current;
      const prevDirection = prevAnimationNameRef.current;
      const [currentAnimationName, currentDirection] = getAnimation(styles);
      let resetNode;
      if (present) {
        send("MOUNT");
      } else if (
        currentAnimationName === "none" ||
        styles?.display === "none"
      ) {
        // If there is no exit animation or the element is hidden, animations won't run
        // so we unmount instantly
        send("UNMOUNT");
      } else {
        /**
         * When `present` changes to `false`, we check changes to animation-name to
         * determine whether an animation has started. We chose this approach (reading
         * computed styles) because there is no `animationrun` event and `animationstart`
         * fires after `animation-delay` has expired which would be too late.
         */
        const isAnimating =
          prevAnimationName !== currentAnimationName ||
          currentDirection !== prevDirection;

        const iNode = node;
        
        if (wasPresent && isAnimating) {
          if (iNode && (currentDirection || "").includes("reverse")) {
            resetNode = reset(iNode);
          }
          send("ANIMATION_OUT");
        } else {
          send("UNMOUNT");
        }        
      }

      prevPresentRef.current = present;

      return resetNode;
    }
  }, [present, send]);

  useLayoutEffect(() => {
    //console.log("usePresence: changeNode:", node);
    if (node) {
      let timeoutId: number;
      const ownerWindow = node.ownerDocument.defaultView ?? window;
      /**
       * Triggering an ANIMATION_OUT during an ANIMATION_IN will fire an `animationcancel`
       * event for ANIMATION_IN after we have entered `unmountSuspended` state. So, we
       * make sure we only trigger ANIMATION_END for the currently active animation.
       */
      const handleAnimationEnd = (event: AnimationEvent) => {
        const [currentAnimationName, currentDirection] = getAnimation(
          stylesRef.current,
        );

        const isCurrentAnimation = currentAnimationName.includes(
          event.animationName,
        );
        /*
        console.log(
          "handleAnimationEnd: currentAnimationName:",
          currentAnimationName,
          ", isCurrentAnimation:",
          isCurrentAnimation,
          ", target:",
          event.target,
        );
        */
        if (event.target === node && isCurrentAnimation) {
          // With React 18 concurrency this update is applied a frame after the
          // animation ends, creating a flash of visible content. By setting the
          // animation fill mode to "forwards", we force the node to keep the
          // styles of the last keyframe, removing the flash.
          //
          // Previously we flushed the update via ReactDom.flushSync, but with
          // exit animations this resulted in the node being removed from the
          // DOM before the synthetic animationEnd event was dispatched, meaning
          // user-provided event handlers would not be called.
          // https://github.com/radix-ui/primitives/pull/1849
          send("ANIMATION_END");
          if (!prevPresentRef.current) {
            const reverse = (currentDirection || "").includes("reverse");
            const currentFillMode = node.style.animationFillMode;
            node.style.animationFillMode = "forwards";
            //console.log("Animation FillMode: forwards, currentFillMode:", currentFillMode)
            // Reset the style after the node had time to unmount (for cases
            // where the component chooses not to unmount). Doing this any
            // sooner than `setTimeout` (e.g. with `requestAnimationFrame`)
            // still causes a flash.
            timeoutId = ownerWindow.setTimeout(() => {
              if (node.style.animationFillMode === "forwards") {
                node.style.animationFillMode = currentFillMode;
                //console.log("handleAnimationEnd: revertFillMode:", currentFillMode)
              }
            });
          }
        }
      };
      const handleAnimationStart = (event: AnimationEvent) => {
        //console.log("handleAnimationStart target:", event.target)
        if (event.target === node) {
          // if animation occurred, store its name as the previous animation.
          const [currentAnimationName, currentDirection] = getAnimation(
            stylesRef.current,
          );
          prevAnimationNameRef.current = currentAnimationName;
          prevAnimationDirRef.current = currentDirection;
          /*
          console.log(
            "handleAnimationStart: animationName:",
            prevAnimationNameRef.current,
            ", target:",
            event.target,
          );*/
        }
      };
      node.addEventListener("animationstart", handleAnimationStart);
      node.addEventListener("animationcancel", handleAnimationEnd);
      node.addEventListener("animationend", handleAnimationEnd);
      return () => {
        ownerWindow.clearTimeout(timeoutId);
        node.removeEventListener("animationstart", handleAnimationStart);
        node.removeEventListener("animationcancel", handleAnimationEnd);
        node.removeEventListener("animationend", handleAnimationEnd);
      };
    } else {
      // Transition to the unmounted state if the node is removed prematurely.
      // We avoid doing so during cleanup as the node may change but still exist.
      send("ANIMATION_END");
    }
  }, [node, send]);

  return {
    isPresent: ["mounted", "unmountSuspended"].includes(state),
    ref: React.useCallback((node: HTMLElement) => {
      stylesRef.current = node ? getComputedStyle(node) : null;
      setNode(node);
    }, []),
  };
}

/* -----------------------------------------------------------------------------------------------*/

function getAnimationName(styles: CSSStyleDeclaration | null) {
  return styles?.animationName || "none";
}

function getAnimation(styles: CSSStyleDeclaration | null) {
  return [
    styles?.animationName || "none",
    styles?.animationDirection || "none",
  ];
}

const Root = Presence;

export {
  AnimatedPresence,
  Presence,
  //
  Root,
};
export type { PresenceProps, AnimatedPresenceProps };
