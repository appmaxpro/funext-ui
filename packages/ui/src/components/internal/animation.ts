import { SerializedStyles } from "@emotion/react";
import { keyframes, css, clsx } from "../../styles";
import { EMPTY_RECORD } from "../../lib/constants";
import rootShouldForwardProp from "../../styles/rootShouldForwardProp";

export const fadeInKf = keyframes`
  from {
    opacity: 0;
  }
`;

export const fadeOutKf = keyframes`
    to {
      opacity: 0;
    }
`;

export const fadeInLeftKf = keyframes`
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(-100%, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const fadeInDownKf = keyframes`
  from {
      opacity: var(--tw-enter-opacity, 1);
      transform: translate3d(0, -100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

export const fadeInRightKf = keyframes`
  from {
      opacity: var(--tw-enter-opacity, 1);
      transform: translate3d(100%, 0, 0);
    }
    to {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
`;


export const fadeInUpKf = keyframes`
  from {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(0, 100%, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;


export const fadeOutLeftKf = keyframes`
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  to {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(-100%, 0, 0);
  }
`;

export const fadeOutRightKf = keyframes`
  from {
      opacity: 1;
      transform: translate3d(0, 0, 0);
    }
    to {
      opacity: var(--tw-enter-opacity, 1);
      transform: translate3d(100%, 0, 0);
    }
`;

export const fadeOutDownKf = keyframes`
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  to {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(0, -100%, 0);
  }
`;

export const fadeOutUpKf = keyframes`
  from {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
  to {
    opacity: var(--tw-enter-opacity, 1);
    transform: translate3d(0, 100%, 0);
  }
`;

const scaleFadeInKf = keyframes`
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 1;
  }
`;

const scaleFadeOutKf = keyframes`
  from {
    opacity: 1;
  }
  50% {
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 0;
  } 
`;

const fadeScaleInKf = keyframes`
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  to {
    opacity: 1;
  }
`;

const fadeScaleOutKf = keyframes`
  from {
    opacity: 1;
  }
  to {
    transform: scale3d(0.9, 0.9, 0.9);
    opacity: 0;
  } 
`;

const enterKf = keyframes`
  0% {
      opacity: var(--tw-enter-opacity,1);
      transform: translate3d(var(--tw-enter-translate-x,0),var(--tw-enter-translate-y,0),0) scale3d(var(--tw-enter-scale,1),var(--tw-enter-scale,1),var(--tw-enter-scale,1)) rotate(var(--tw-enter-rotate,0))
  }
`;

const exitKf = keyframes`
  to {
      opacity: var(--tw-exit-opacity,1);
      transform: translate3d(var(--tw-exit-translate-x,0),var(--tw-exit-translate-y,0),0) scale3d(var(--tw-exit-scale,1),var(--tw-exit-scale,1),var(--tw-exit-scale,1)) rotate(var(--tw-exit-rotate,0))
  }
`;
const enterCss = css`
  animation-duration: var(--tw-enter-duration, .3s);
  animation-timing-function: var(--tw-enter-timing, cubic-bezier(0.32,0.72,0,1));
  animation-name: ${enterKf} ;
`;

const exitCss = css`
  animation-duration: var(--tw-exit-duration, .3s);
  animation-timing-function: var(--tw-exit-timing, cubic-bezier(0.32,0.72,0,1));
  animation-name: ${exitKf} ;
`;

const enterExitCss = css`
  transform-origin: var(--popper-transform-origin, center);
  &[data-state="open"] {
    ${enterCss};
  }

  &[data-state="close"] {
    ${exitCss};
  }
`;

const fadeCss = css`
  will-change: opacity;
  &[data-state="open"] {
    animation: ${fadeInKf} 200ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-state="close"] {
    animation: ${fadeOutKf} 300ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const slideFadeInCss = css`
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  animation-duration: 400ms;
  will-change: transform, opacity;
  

  &[data-side="left"] {
    animation-name: ${fadeInLeftKf};
  }

  &[data-side="right"] {
    
    animation-name: ${fadeInRightKf};
  }

  &[data-side="top"] {
    
    animation-name: ${fadeInUpKf};
  }

  &[data-side="bottom"] {
    animation-name: ${fadeInDownKf};
  }

  &[data-state="open"] {
    animation-direction: normal;
  }

  &[data-state="close"] {
    animation-direction: reverse;
  }
`;

const advanceSlideFadeInCss = css`
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  animation-duration: 400ms;
  will-change: transform, opacity;

  &[data-side="left"] {
    animation-name: ${fadeInLeftKf};
  }

  &[data-side="right"] {
    animation-name: ${fadeInRightKf};
  }

  &[data-side="top"] {
    animation-name: ${fadeInUpKf};
  }

  &[data-side="bottom"] {
    animation-name: ${fadeInDownKf};
  }

  &[data-state="open"] {
    animation-direction: normal;
  }

  &[data-state="close"] {
    animation-direction: reverse;
  }
`;

const liteScaleFadeInKf = keyframes`
  0% {
    transform: scale(.95);
  }
`;

const liteScaleFadeOutKf = keyframes`
  to {
    transform: scale(.95);
  }
`;

const scaleFadeCss = css`
  transform-origin: var(--popper-transform-origin, center);
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  &[data-state="open"] {
    animation: ${scaleFadeInKf} 300ms;
  }
  &[data-state="close"] {
    animation: ${scaleFadeOutKf} 200ms;
  }
`;

const fadeScaleCss = css`
  transform-origin: var(--popper-transform-origin, center);
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  animation-duration: 400ms; 
  &[data-state="open"] {
    animation-name: ${fadeScaleInKf};
  }
  &[data-state="close"] {
    animation-name: ${fadeScaleOutKf};
  }
`;

const liteScaleFadeCss = css`
  transform-origin: var(--popper-transform-origin, center);
  animation-timing-function: var(--animation-timing, cubic-bezier(0.4, 0, 0.2, 1));
  
  &[data-state="open"] {
    animation: ${liteScaleFadeInKf} 1s;
  }
  &[data-state="close"] {
    animation: ${liteScaleFadeOutKf} 1s;
  }
`;



const EMPTY_STYLES = css``;

const animations: Record<string, SerializedStyles> = {
  fade400: fadeCss,
  scaleFade: scaleFadeCss,
  fadeScale: fadeScaleCss,
  slideFadeIn: slideFadeInCss,
  liteScaleFade: liteScaleFadeCss,
  enter: enterCss,
  exit: exitCss,
  general: enterExitCss,
  "": EMPTY_STYLES,
};




type Animation =
  | string
  | {
      name?: string;
      base?: SerializedStyles;
      multi?: boolean;
    };

type AnimatedProps = {
  animate?: boolean;
  animation?: Animation;
  enter?: Animation;
  exit?: Animation;
};

type AnimatableProps = {
  animation?: AnimatedProps;
};

type AnimatedOrNameProps = AnimatedProps | string ;

const cache = new WeakMap<
  object,
  SerializedStyles | Map<string, SerializedStyles>
>();
function getAnimation(
  props: AnimatedOrNameProps,
): ReturnType<typeof css> | undefined {
  const result = _getAnimation(props)
  //console.log("getAnimation:::", props, ", result:", result)
  return result
}
function _getAnimation(
  props: AnimatedOrNameProps,
): ReturnType<typeof css> | undefined {
  //console.log("getAnimation:::", props)
  if (typeof props === "string") return animations[props];

  if (!props.animate) return EMPTY_STYLES;
  const { animation } = props;
  if (typeof animation === "string") return animations[animation];

  if (animation?.name) {
    const style = animations[animation.name];
    if (!style) return animation.base;

    if (typeof animation.base === "object") {
      let result = cache.get(animation.base);
      let map: Map<string, SerializedStyles>;
      if (result) {
        if (animation.multi) {
          map = result as Map<string, SerializedStyles>;
          if (!map) {
            map = new Map();
            cache.set(result, map);
          }
          result = map.get(animation.name);
          if (!result) {
            result = css`
              ${style};
              ${animation.base};
            `;
            map.set(animation.name, result);
          }
        }
        return result as SerializedStyles;
      }

      result = css`
        ${style};
        ${animation.base};
      `;

      if (animation.multi) {
        map = new Map();
        cache.set(animation.base, map);
        map.set(animation.name, result);
      } else {
        cache.set(animation.base, result);
      }
      return result;
    }
  }
  return animation?.base;
}

function getAnimationOr(styles: SerializedStyles) {
  return (props: AnimatedProps) =>
    getAnimation(props) ?? (props.animate ? styles : EMPTY_STYLES);
}

function getAnimationOrName(otherName: string) {
  return (props: AnimatedProps) =>
    getAnimation(props) ?? ( props.animate
      ? (animations[otherName] ?? EMPTY_STYLES)
      : EMPTY_STYLES);
}

function getAnimationSafe(props: AnimatedOrNameProps) {
  
  return getAnimation(props) ?? EMPTY_STYLES;
}

function registerAnimation(name: string, styles: SerializedStyles) {
  animations[name] = styles;
}

function getAnimationStyles(name: string) {
  return animations[name];
}

const shouldForwardAnimateProp = (propName: PropertyKey) =>
  propName !== "animate" && propName !== "animation";

const shouldForwardProp = (propName: PropertyKey) =>
  propName === 'as' || (shouldForwardAnimateProp(propName) && rootShouldForwardProp(propName))

function getAnimationData(
  props:{
    animate?:boolean; 
    className?: string, 
    style?: any, 
    openStyle?: any, 
    closeStyle?: any ,
    animation?: AnimatedProps | string; 
  },
  open?: boolean,
) {
  let { animation: animationProps, ...others } = props;
  if (open == null || !animationProps) return others;
  let inAnimation:AnimatedProps|undefined ;
  if(!animationProps || typeof animationProps === 'string') {
    return props
  } else{
    inAnimation = animationProps;
  }

  const { animate = props.animate, animation, enter, exit } = inAnimation;
  if (!animate) {
    return others;
  }
  let { className, style: asStyle } = others;
  let stateStyle = others[open ? 'openStyle' : 'closeStyle'];
  let style = asStyle && stateStyle ? {...asStyle, ...stateStyle} : asStyle ?? stateStyle;

  if (open) {

    if (typeof enter === "string") {
      return {
        ...others,
        className: clsx(className, enter),
        style,
        animation,

      };
    }

    if (enter) {
      return {
        ...others,
        className,
        style,
        animation: enter,
      };
    }
    return {
      ...others,
      animation,
      className,
      style
    };
  } else {
    if (typeof exit === "string") {
      return {
        ...others,
        className: clsx(className, exit),
        style,
        animation,
      };
    }
    if (exit) {
      return {
        ...others,
        className,
        style,
        animation: exit,
      };
    }
    return {
      ...others,
      animation,
      className,
      style
    };
  }
}

export {
  getAnimation,
  registerAnimation,
  getAnimationOr,
  shouldForwardAnimateProp,
  shouldForwardProp,
  getAnimationOrName,
  getAnimationSafe,
  getAnimationStyles,
  getAnimationData,
  EMPTY_STYLES,
};

export type { AnimatedProps, Animation, AnimatableProps, AnimatedOrNameProps };
