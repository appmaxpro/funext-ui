import { FloatingOverlay } from "@floating-ui/react";
import { useLayer } from "../../lib/layer";
import React from "react";
import {
  styled,
  SxComponentProps,
  useMuxDefaultProps,
  useSlot,
} from "../../styles";
import { Fade, FadeProps } from "../../lib/transitions/fade";
import { useRefs } from "../../hooks";
import { zIndex } from "../../theme/types";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";

type OverlayProps = SxComponentProps & {
  lockScroll?: boolean;
  visible?: boolean;
  open?: boolean;
  timeout?: FadeProps["timeout"];
  animate?: boolean;
  zIndex?: number;
};

const OverlayRoot = styled(FloatingOverlay, {
  name: "MuiOverlay",
  slot: "Root",
})(({ ownerState }: { ownerState: { zIndex: number } }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent",
  WebkitTapHighlightColor: "transparent",
  zIndex: ownerState.zIndex,
  "&[data-visible]": {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
}));

const Overlay = React.forwardRef<HTMLDivElement, OverlayProps>(
  function Overlay(inProps, forwardRef) {
    const props = useMuxDefaultProps({ props: inProps, name: "MuiOverlay" });
    const {
      children,
      className,
      component = "div",
      visible = false,
      open,
      transitionProps: transitionPropsProps = {},
      Transition: TransitionComponent,
      timeout,
      animate = true,
      zIndex: zIndexProps,
      ...other
    } = props;


    const {zIndex:layerZIndex} = useLayer();

    const zIndex = zIndexProps ?? layerZIndex;

    //const reducedMotion = usePrefersReducedMotion();

    const ownerState = {
      ...other,
      open,
      component,
      visible,
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

    const ref = useRestoreScroll(forwardRef, other.lockScroll);
    const child = (
      <OverlayRoot
          as={component}
          aria-hidden
          data-visible={visible ? '' : undefined}
          data-ui='Overlay'
          className={className}
          ownerState={ownerState}
          {...other}
          ref={ref}
        >
          {children}
        </OverlayRoot>
    )
    if (!animate || !visible)
      return child;

    return (
      <TransitionSlot
        in={open}
        timeout={timeout}
        {...other}
        {...transitionProps}
      >
        {child}
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

export type {
  OverlayProps
}
export default Overlay