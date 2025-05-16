import { FloatingOverlay, FloatingOverlayProps } from "@floating-ui/react";
import { useLayer } from "../../lib/layer";
import React from "react";
import {
  clsx,
  css,
  styled,
  StyledComponent,
  SxComponentProps,
  useMuxDefaultProps,
  useSlot,
} from "../../styles";
import { Fade, FadeProps } from "../../lib/transitions/fade";
import { useRefs } from "../../hooks";
import { AnimatableProps, getAnimationData, fadeOutKf, getAnimation, getAnimationOrName, shouldForwardProp } from "../internal/animation";
import emoStyle from '@emotion/styled';
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";
import { Presence } from "../../lib/presence";

const defaultAnimate = {
  animation: 'fade400'
}
const Basic = ({component, ...props}: FloatingOverlayProps & {component?: any}) => {
  console.log("FloatingOverlayProps:", props)
  return <FloatingOverlay {...props}/>;
};

type OverlayProps = SxComponentProps & {
  lockScroll?: boolean;
  visible?: boolean;
  open?: boolean;
  timeout?: FadeProps["timeout"];
  animate?: boolean | "transit";
  zIndex?: number;
} & AnimatableProps;


const OverlayRoot = styled(FloatingOverlay, {
  label: "MuiOverlay",
  shouldForwardProp: (propName) => shouldForwardProp(propName) &&
    propName !== "zIndex" &&
    propName !== "ownerState" &&
    propName !== "timeout"
})(
  ({ ownerState }: { ownerState: { zIndex: number } }) => ({
    display: "flex",
    'alignItems': "center",
    'justifyContent': "center",
    'backgroundColor': "transparent",
    //WebkitTapHighlightColor: "transparent",
    'zIndex': ownerState?.zIndex ?? -1,
    inset: 0,
    position: "fixed",
    ["&[data-visible]"]: {
      'backgroundColor': "rgb(0 0 0 / .3)",
    },
    
    
  }),
  getAnimationOrName('fade400') as any,
) as StyledComponent<FloatingOverlayProps & AnimatableProps>;

export const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay(inProps, forwardRef) {
    const props = useMuxDefaultProps({ props: inProps, name: "MuiOverlay" });
    const {
      children,
      className,
      component = "div",
      visible = false,
      animate = true,
      animation:animationProps = animate ? defaultAnimate : undefined,
      open,
      zIndex: zIndexProps,
      style,
      ...other
    } = props;

    const { zIndex: layerZIndex } = useLayer();

    const zIndex = zIndexProps ?? layerZIndex;

    const ref = useRestoreScroll(forwardRef, other.lockScroll);

    const animation = React.useMemo(
          () =>
            animate === "transit" && visible ? getAnimationData(
              { className, style, animate: animate && visible, animation: animationProps },
              open,
            ) : {},
          [open, animationProps, className, style, animate, visible],
        );

    if (animate === "transit" && visible) {
      return (
        <TransitionOverlay
          as={component}
          data-visible={visible ? "" : undefined}
          className={className}
          data-ui="Overlay"
          {...other}
          zIndex={zIndex}
          ref={ref}
        >
          {children}
        </TransitionOverlay>
      );
    }

    const ownerState = {
      ...other,
      open,
      component,
      visible,
      zIndex,
    };
    
    return (
      <Presence animate={animate && visible} present={!!open}>
        <OverlayRoot
          component={component}
          data-visible={visible ? "" : undefined}
          data-ui="Overlay"
          ownerState={ownerState}
          animate={animate && visible}
          zIndex={zIndex}
          {...other}
          {...animation}
          ref={ref}
        >
          {children}
        </OverlayRoot>
      </Presence>
    );
  },
);

const TransitionOverlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  function TransitionOverlay(props, forwardRef) {
    const {
      children,
      open,
      transitionProps: transitionPropsProps = {},
      Transition: TransitionComponent,
      timeout,
      zIndex,
      ...other
    } = props;

    const ownerState = {
      ...other,
      open,
      zIndex,
    };

    const externalForwardedProps = {
      slots: {
        transition: TransitionComponent,
      },
      slotProps: {
        transition: transitionPropsProps,
      },
    };

    const [TransitionSlot, transitionProps] = useSlot("transition", {
      elementType: Fade,
      externalForwardedProps,
      ownerState,
    });

    return (
      <TransitionSlot
        in={open}
        timeout={timeout}
        {...transitionProps}
        ref={forwardRef}
      >
        <OverlayRoot ownerState={ownerState} {...other}>
          {children}
        </OverlayRoot>
      </TransitionSlot>
    );
  },
);

function useRestoreScroll(
  forwardRef: React.ForwardedRef<HTMLDivElement>,
  lockScroll?: boolean,
) {
  const ref = React.useRef(null);
  const mergedRef = useRefs(forwardRef, ref);
  const scrollPosRef = React.useRef();

  React.useImperativeHandle;
  React.useEffect(() => {});

  return forwardRef;
}

export type { OverlayProps };
export default Overlay;
