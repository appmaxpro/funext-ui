// @ts-nocheck
import {forwardRef, useMemo} from 'react';
import type {SerializedStyles} from '@emotion/react';
import type {HTMLMotionProps, MotionProps, MotionStyle} from 'framer-motion';
import {motion, useIsPresent} from 'framer-motion';
import {defined, NODE_ENV} from '../../mui/utils';
import PanelProvider from './PanelProvider';
import testableTransition from '../../mui/utils/testableTransition';
import domId from '../utils/domId';
import styled from '@emotion/styled';
import {useTheme, type Theme} from '../../mui/styles';
type OriginPoint = Partial<{x: number; y: number}>;

export declare type Side = 'top' | 'right' | 'bottom' | 'left';

export declare type Alignment = 'start' | 'end';

export declare type AlignedPlacement = `${Side}-${Alignment}`;

export declare type Placement = Side | AlignedPlacement;


  /**
 * How long to wait before opening the overlay
 */
const OPEN_DELAY = 50;

/**
 * How long to wait before closing the overlay when isHoverable is set
 */
const CLOSE_DELAY = 50;

export interface UseHoverOverlayProps {
  /**
   * className for when a wrapper is used. Does nothing using skipWrapper.
   */
  className?: string;
  /**
   * Display mode for the container element. Does nothing using skipWrapper.
   */
  containerDisplayMode?: React.CSSProperties['display'];
  /**
   * Time to wait (in milliseconds) before showing the overlay
   */
  delay?: number;
  /**
   * Time in ms until overlay is hidden. When used with isHoverable this is
   * used as the time allowed for the user to move their cursor into the overlay)
   */
  displayTimeout?: number;
  /**
   * Force the overlay to be visible without hovering
   */
  forceVisible?: boolean;
  /**
   * If true, user is able to hover overlay without it disappearing. (nice if
   * you want the overlay to be interactive)
   */
  isHoverable?: boolean;
  /**
   * Offset along the main axis.
   */
  offset?: number;
  /**
   * Position for the overlay.
   */
  position?: Placement;
  /**
   * Only display the overlay only if the content overflows
   */
  showOnlyOnOverflow?: boolean;
  /**
   * Whether to add a dotted underline to the trigger element, to indicate the
   * presence of a overlay.
   */
  showUnderline?: boolean;
  /**
   * If child node supports ref forwarding, you can skip apply a wrapper
   */
  skipWrapper?: boolean;
  /**
   * Color of the dotted underline, if available. See also: showUnderline.
   */
  underlineColor?: string;
}

interface OverlayProps extends HTMLMotionProps<'div'> {
  /**
   * Whether the overlay should animate in/out. If true, we'll also need
   * the `placement` and `originPoint` props.
   */
  animated?: boolean;
  /**
   * Props to be passed into <OverlayArrow />. If undefined, the overlay will
   * render with no arrow.
   */
  arrowProps?: OverlayArrowProps;
  children?: React.ReactNode;
  /**
   * The CSS styles for the "origin point" over the overlay. Typically this
   * would be the arrow (or tip).
   */
  originPoint?: OriginPoint;
  /**
   * Additional style rules for the overlay content.
   */
  overlayStyle?: React.CSSProperties | SerializedStyles;
  /**
   * Indicates where the overlay is placed. This is useful for the animation to
   * be animated 'towards' the placment origin, giving it a pleasing effect.
   */
  placement?: Placement;

  arrow?: React.ReactNode;
}


const overlayAnimation: MotionProps = {
  transition: {duration: 0.2},
  initial: {opacity: 0},
  animate: {
    opacity: 1,
    scale: 1,
    transition: testableTransition({
      type: 'linear',
      ease: [0.5, 1, 0.89, 1],
      duration: 0.2,
    }),
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: testableTransition({type: 'spring', delay: 0.2}),
  },
};

/**
 * Used to compute the transform origin to give the scale-down micro-animation
 * a pleasant feeling. Without this the animation can feel somewhat 'wrong'
 * since the direction of the scale isn't towards the reference element
 */
function computeOriginFromArrow(
  placement?: Placement,
  originPoint?: OriginPoint
): MotionStyle {
  const simplePlacement = placement?.split('-')[0];
  const {y, x} = originPoint ?? {};

  // XXX: Bottom means the arrow will be pointing up.
  switch (simplePlacement) {
    case 'top':
      return {originX: x ? `${x}px` : '50%', originY: '100%'};
    case 'bottom':
      return {originX: x ? `${x}px` : '50%', originY: 0};
    case 'left':
      return {originX: '100%', originY: y ? `${y}px` : '50%'};
    case 'right':
      return {originX: 0, originY: y ? `${y}px` : '50%'};
    default:
      return {originX: `50%`, originY: '50%'};
  }
}

/**
 * A overlay component that has an optional nice ease in animation along with
 * a scale-down animation that animates towards an origin (think a tooltip
 * pointing at something).
 *
 * If animated (`animated` prop is true), should be used within a
 * `<AnimatePresence />`.
 */
// @ts-expect-error
const Overlay = styled(
  forwardRef<HTMLDivElement, OverlayProps>(
    (
      {
        children,
        arrowProps,
        animated,
        placement,
        originPoint,
        style,
        //overlayStyle: _overlayStyle,
        arrow,
        ...props
      },
      ref
    ) => {
      const theme = useTheme();

      const isTestEnv = NODE_ENV === 'test';
      const animationProps =
        !isTestEnv && animated
          ? {
              ...overlayAnimation,
              style: {
                ...style,
                ...computeOriginFromArrow(placement, originPoint),
              }
            }
          : {style};
      
      const {palette} = theme;

      //console.log("Overlay placement:", placement);
      return (
        <motion.div {...props} {...animationProps} ref={ref}>
          {defined(arrowProps) && <OverlayArrow {...arrowProps}/>}
          <PanelProvider>{children}</PanelProvider>
        </motion.div>
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

  /* Specificity hack to allow override styles to have higher specificity than
   * styles provided in any styled components which extend Overlay */
  :where(*) {
    ${p => p.overlayStyle as any}
  }
`;

interface PositionWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Determines the zindex over the position wrapper
   */
  zIndex: number;
}

/**
 * The PositionWrapper should be used when you're using the AnimatedOverlay as
 * part of dynamically positioned component (useOverlayPosition). Generally
 * this component will receive the `overlayProps`.
 *
 * This component ensures the wrapped AnimatedOverlay will not receive pointer
 * events while it is being animated out. Especially useful since the
 * `overlayProps` includes a onMouseEnter to allow the overlay to be hovered,
 * which we would not want while its fading away.
 */
const PositionWrapper = forwardRef<HTMLDivElement, PositionWrapperProps>(
  // XXX(epurkhiser): This is a motion.div NOT because it is animating, but
  // because we need the context of the animation starting for applying the
  // `pointerEvents: none`.
  (
    {
      // XXX: Some of framer motions props are incompatible with
      // HTMLAttributes<HTMLDivElement>. Due to the way useOverlay uses this
      // component it must be compatible with that type.
      onAnimationStart: _onAnimationStart,
      onDragStart: _onDragStart,
      onDragEnd: _onDragEnd,
      onDrag: _onDrag,
      zIndex,
      style,
      ...props
    },
    ref
  ) => {
    const isPresent = useIsPresent();
    return (
      <motion.div
        {...props}
        ref={ref}
        style={{...style, zIndex, pointerEvents: isPresent ? 'auto' : 'none'}}
      />
    );
  }
);


interface OverlayArrowProps extends React.ComponentPropsWithRef<'div'> {
  background?: string;
  border?: string;
  placement?: Placement;
  size?: number;
  strokeWidth?: number;
}

function BaseOverlayArrow(
  {
    size = 16,
    strokeWidth = 1,
    placement,
    background = 'backgroundElevated',
    border = 'translucentBorder',
    ...props
  }: OverlayArrowProps,
  ref: React.Ref<HTMLDivElement>
) {
  /**
   * SVG height
   */
  const h = Math.round(size * 0.4);
  /**
   * SVG width
   */
  const w = size;
  /**
   * SVG stroke width
   */
  const s = strokeWidth;
  const arrowPath = [
    `M 0 ${h - s / 2}`,
    `C ${w * 0.25} ${h - s / 2} ${w * 0.45} ${s / 2} ${w / 2} ${s / 2}`,
    `C ${w * 0.55} ${s / 2} ${w * 0.75} ${h - s / 2} ${w} ${h - s / 2}`,
  ].join('');

  const strokeMaskId = useMemo(() => domId('stroke-mask'), []);
  const fillMaskId = useMemo(() => domId('fill-mask'), []);

  return (
    <Wrap ref={ref} placement={placement} size={size} {...props}>
      <SVG
        overflow="visible"
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        border={border}
        background={background}
      >
        <defs>
          <mask id={strokeMaskId}>
            <rect x="0" y={-strokeWidth} width="100%" height="100%" fill="white" />
          </mask>
          <mask id={fillMaskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <path d={arrowPath} vectorEffect="non-scaling-stroke" stroke="black" />
          </mask>
        </defs>

        <path
          d={`${arrowPath} V ${h} H 0 Z`}
          mask={`url(#${fillMaskId})`}
          className="fill"
        />
        <path d={arrowPath} mask={`url(#${strokeMaskId})`} className="stroke" />
      </SVG>
    </Wrap>
  );
}

const OverlayArrow = forwardRef(BaseOverlayArrow);

const Wrap = styled('div')<{size: number; placement?: Placement}>`
  position: relative;
  display: flex;
  width: ${p => p.size}px;
  height: ${p => p.size}px;

  ${p =>
    p.placement?.startsWith('top') &&
    `bottom: 0; transform: translateY(50%) rotate(180deg);`}
  ${p => p.placement?.startsWith('bottom') && `top: 0; transform: translateY(-50%) ;`}
  ${p =>
    p.placement?.startsWith('left') &&
    `right: 0; transform: translateX(50%) rotate(90deg);`}
  ${p =>
    p.placement?.startsWith('right') &&
    `left: 0; transform: translateX(-50%) rotate(-90deg);`}
`;

const SVG = styled('svg')<{background: string; border: string}>`
  position: absolute;
  bottom: 50%;
  fill: none;
  stroke: none;

  path.stroke {
    stroke: ${p => p.border || 'rgba(0, 0, 0, 0.5)'};
  }
  path.fill {
    fill: ${p => p.background || p.theme.palette.background.default};
  }
`;


export {Overlay, PositionWrapper};