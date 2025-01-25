"use client";
import React from "react";
import {
  clsx,
  generateUtilityClass,
  generateUtilityClasses,
  keyframes,
  styled,
  useMuxDefaultProps,
} from "../../styles";
import { StandardProps } from "../../props";
import Ripple from "./Ripple";
import { useTimeout } from "../../hooks";
import { TransitionGroup } from "react-transition-group";

export interface TouchRippleClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the internal `Ripple` components `ripple` class. */
  ripple: string;
  /** Styles applied to the internal `Ripple` components `rippleVisible` class. */
  rippleVisible: string;
  /** Styles applied to the internal `Ripple` components `ripplePulsate` class. */
  ripplePulsate: string;
  /** Styles applied to the internal `Ripple` components `child` class. */
  child: string;
  /** Styles applied to the internal `Ripple` components `childLeaving` class. */
  childLeaving: string;
  /** Styles applied to the internal `Ripple` components `childPulsate` class. */
  childPulsate: string;
}

export type TouchRippleClassKey = keyof TouchRippleClasses;

export function getTouchRippleUtilityClass(slot: string): string {
  return generateUtilityClass("MuxTouchRipple", slot);
}

export const touchRippleClasses: TouchRippleClasses = generateUtilityClasses(
  "MuxTouchRipple",
  [
    "root",
    "ripple",
    "rippleVisible",
    "ripplePulsate",
    "child",
    "childLeaving",
    "childPulsate",
  ],
);

export interface StartActionOptions {
  pulsate?: boolean;
  center?: boolean;
}

export interface TouchRippleActions {
  start: (
    event?: React.SyntheticEvent,
    options?: StartActionOptions,
    callback?: () => void,
  ) => void;
  pulsate: (event?: React.SyntheticEvent) => void;
  stop: (event?: React.SyntheticEvent, callback?: () => void) => void;
}

export type TouchRippleProps = StandardProps<
  React.HTMLAttributes<HTMLElement>
> & {
  center?: boolean;
  /**
   * Override or extend the styles applied to the component.
   */
  classes?: Partial<TouchRippleClasses>;
  rippleClassName?: string;
  ref?: React.Ref<TouchRippleActions>;
};

const DURATION = 550;
export const DELAY_RIPPLE = 80;

const enterKeyframe = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.1;
  }

  100% {
    transform: scale(1);
    opacity: 0.3;
  }
`;

const exitKeyframe = keyframes`
  0% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
`;

const pulsateKeyframe = keyframes`
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(0.75);
  }

  100% {
    transform: scale(1);
  }
`;

export const TouchRippleRoot = styled("span", {
  name: "MuxTouchRipple",
  slot: "Root",
})({
  overflow: "hidden",
  pointerEvents: "none",
  position: "absolute",
  zIndex: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
  borderRadius: "inherit",
});

// This `styled()` function invokes keyframes. `styled-components` only supports keyframes
// in string templates. Do not convert these styles in JS object as it will break.
export const TouchRippleRipple = styled(Ripple, {
  name: "MuxTouchRipple",
  slot: "Ripple",
})`
  opacity: 0;
  position: absolute;

  &.${touchRippleClasses.rippleVisible} {
    opacity: 0.3;
    transform: scale(1);
    animation-name: ${enterKeyframe};
    animation-duration: ${DURATION}ms;
    animation-timing-function: ${({ theme }) =>
      theme.transitions.easing.easeInOut};
  }

  &.${touchRippleClasses.ripplePulsate} {
    animation-duration: ${({ theme }) => theme.transitions.duration.shorter}ms;
  }

  & .${touchRippleClasses.child} {
    opacity: 1;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: currentColor;
  }

  & .${touchRippleClasses.childLeaving} {
    opacity: 0;
    animation-name: ${exitKeyframe};
    animation-duration: ${DURATION}ms;
    animation-timing-function: ${({ theme }) =>
      theme.transitions.easing.easeInOut};
  }

  & .${touchRippleClasses.childPulsate} {
    position: absolute;
    /* @noflip */
    left: 0px;
    top: 0;
    animation-name: ${pulsateKeyframe};
    animation-duration: 2500ms;
    animation-timing-function: ${({ theme }) =>
      theme.transitions.easing.easeInOut};
    animation-iteration-count: infinite;
    animation-delay: 200ms;
  }
`;

type Callback = () => void;

type RxProps = {
  center?: boolean;
  pulsate?: boolean;
  rippleX: number;
  rippleY: number;
  rippleSize: number;
  cb?: Callback;
  fakeElement?: boolean;
};
/**
 * @ignore - internal component.
 *
 * TODO v5: Make private
 */
const TouchRipple = React.forwardRef<HTMLElement, TouchRippleProps>(
  function TouchRipple(inProps, ref) {
    const props = useMuxDefaultProps({
      props: inProps,
      name: "MuxTouchRipple",
    });

    const {
      center: centerProp = false,
      classes = {},
      className,
      ...other
    } = props;
    const [ripples, setRipples] = React.useState<Array<React.ReactNode>>([]);
    const nextKey = React.useRef(0);
    const rippleCallback = React.useRef<Callback | null | undefined>(null);

    React.useEffect(() => {
      if (rippleCallback.current) {
        rippleCallback.current();
        rippleCallback.current = null;
      }
    }, [ripples]);

    // Used to filter out mouse emulated events on mobile.
    const ignoringMouseDown = React.useRef(false);
    // We use a timer in order to only show the ripples for touch "click" like events.
    // We don't want to display the ripple for touch scroll events.
    const startTimer = useTimeout();

    // This is the hook called once the previous timeout is ready.
    const startTimerCommit = React.useRef<Callback | null>(null);
    const container = React.useRef<HTMLElement>(null);

    const startCommit = React.useCallback(
      (params: RxProps) => {
        const { pulsate, rippleX, rippleY, rippleSize, cb } = params;
        
        setRipples((oldRipples) => [
          ...oldRipples,
          <TouchRippleRipple
            key={nextKey.current}
            classes={{
              ripple: clsx(classes.ripple, touchRippleClasses.ripple),
              rippleVisible: clsx(
                classes.rippleVisible,
                touchRippleClasses.rippleVisible,
              ),
              ripplePulsate: clsx(
                classes.ripplePulsate,
                touchRippleClasses.ripplePulsate,
              ),
              child: clsx(classes.child, touchRippleClasses.child),
              childLeaving: clsx(
                classes.childLeaving,
                touchRippleClasses.childLeaving,
              ),
              childPulsate: clsx(
                classes.childPulsate,
                touchRippleClasses.childPulsate,
              ),
            }}
            timeout={DURATION}
            pulsate={pulsate}
            rippleX={rippleX}
            rippleY={rippleY}
            rippleSize={rippleSize}
          />,
        ]);
        nextKey.current += 1;
        rippleCallback.current = cb;
      },
      [classes],
    );

    const start = React.useCallback(
      (
        event: any = {},
        options: Partial<RxProps> = {},
        cb: Callback = () => {},
      ) => {
        
        const {
          pulsate = false,
          center = centerProp || options.pulsate,
          fakeElement = false, // For test purposes
        } = options;

        if (event?.type === "mousedown" && ignoringMouseDown.current) {
          ignoringMouseDown.current = false;
          return;
        }

        if (event?.type === "touchstart") {
          ignoringMouseDown.current = true;
        }

        const element = fakeElement ? null : container.current;
        const rect = element
          ? element.getBoundingClientRect()
          : {
              width: 0,
              height: 0,
              left: 0,
              top: 0,
            };

        // Get the size of the ripple
        let rippleX;
        let rippleY;
        let rippleSize;

        if (
          center ||
          event === undefined ||
          (event.clientX === 0 && event.clientY === 0) ||
          (!event.clientX && !event.touches)
        ) {
          rippleX = Math.round(rect.width / 2);
          rippleY = Math.round(rect.height / 2);
        } else {
          const { clientX, clientY } =
            event.touches && event.touches.length > 0
              ? event.touches[0]
              : event;
          rippleX = Math.round(clientX - rect.left);
          rippleY = Math.round(clientY - rect.top);
        }

        if (center) {
          rippleSize = Math.sqrt((2 * rect.width ** 2 + rect.height ** 2) / 3);

          // For some reason the animation is broken on Mobile Chrome if the size is even.
          if (rippleSize % 2 === 0) {
            rippleSize += 1;
          }
        } else {
          const sizeX =
            Math.max(
              Math.abs((element ? element.clientWidth : 0) - rippleX),
              rippleX,
            ) *
              2 +
            2;
          const sizeY =
            Math.max(
              Math.abs((element ? element.clientHeight : 0) - rippleY),
              rippleY,
            ) *
              2 +
            2;
          rippleSize = Math.sqrt(sizeX ** 2 + sizeY ** 2);
        }

        // Touche devices
        if (event?.touches) {
          // check that this isn't another touchstart due to multitouch
          // otherwise we will only clear a single timer when unmounting while two
          // are running
          if (startTimerCommit.current === null) {
            // Prepare the ripple effect.
            startTimerCommit.current = () => {
              startCommit({ pulsate, rippleX, rippleY, rippleSize, cb });
            };
            // Delay the execution of the ripple effect.
            // We have to make a tradeoff with this delay value.
            startTimer.start(DELAY_RIPPLE, () => {
              if (startTimerCommit.current) {
                startTimerCommit.current();
                startTimerCommit.current = null;
              }
            });
          }
        } else {
          startCommit({ pulsate, rippleX, rippleY, rippleSize, cb });
        }
      },
      [centerProp, startCommit, startTimer],
    );

    const pulsate = React.useCallback(() => {
      start({}, { pulsate: true });
    }, [start]);

    const stop = React.useCallback(
      (event: any, cb: Callback) => {
        startTimer.clear();

        // The touch interaction occurs too quickly.
        // We still want to show ripple effect.
        if (event?.type === "touchend" && startTimerCommit.current) {
          startTimerCommit.current();
          startTimerCommit.current = null;
          startTimer.start(0, () => {
            stop(event, cb);
          });
          return;
        }

        startTimerCommit.current = null;

        setRipples((oldRipples) => {
          if (oldRipples.length > 0) {
            return oldRipples.slice(1);
          }
          return oldRipples;
        });
        rippleCallback.current = cb;
      },
      [startTimer],
    );

    React.useImperativeHandle(
      ref,
      () =>
        ({
          pulsate,
          start,
          stop,
        }) as any,
      [pulsate, start, stop],
    );

    return (
      <TouchRippleRoot
        className={clsx(touchRippleClasses.root, classes.root, className)}
        ref={container as any}
        {...other}
      >
        <TransitionGroup component={null} exit>
          {ripples}
        </TransitionGroup>
      </TouchRippleRoot>
    );
  },
);

export default TouchRipple;
