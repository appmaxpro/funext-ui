import React, { useState, createRef, useRef, useCallback, useEffect, CSSProperties } from "react";
import { Component, Container } from "./Animation.style";
import { clsx, styled, SxComponentProps } from '../../styles'
interface Props extends SxComponentProps{
  count?: number,
  delay?: string,
  duration?: string | number,
  infinite?: boolean,
  onAnimationEnd?: Function,
  onAnimationIteration?: Function,
  onAnimationStart?: Function,
  reveal?: boolean,
  type ?: string,
  elemRef ?: Function,
  countIterations ?: any, 
  clientHeight ?: number,
  currentRef ?: any, 
}

const Animation = (props: Props) => {
  const {
    tag,
    children,
    className,
    count,
    delay,
    duration,
    infinite,
    reveal,
    style,
    currentRef,
    clientHeight,
    type,
    countIterations,
    onAnimationStart:onAnimationStartProp,
    onAnimationIteration:onAnimationIterationProp,
    onAnimationEnd:onAnimationEndProp,
    ...attributes
  } = props;

  const [state, setState] = useState({
    isVisible: false,
    revealed: false,
    countIterations: 0,
  });

  const elemRef = createRef<HTMLDivElement>();

  const onAnimationStart = useRef(onAnimationStartProp).current
  const onAnimationIteration = useRef(onAnimationIterationProp).current
  const onAnimationEnd = useRef(onAnimationEndProp).current

  const handleStart = useCallback(() => {
    setState((state)=> {
      return {
        ...state,
        countIterations: state.countIterations + 1,
      }
    });

    if (onAnimationStart) {
      onAnimationStart();
    }
  }, [setState, onAnimationStart]);

  const handleIteration = useCallback(() => {
    if (onAnimationIteration) {
      setState((state)=> {
        return {
          ...state,
          countIterations: state.countIterations + 1,
        }
      });
      onAnimationIteration();
    }
  }, [setState, onAnimationIteration]);

  const handleEnd = useCallback(() => {
    setState((state)=> {
      if (onAnimationEnd && count === (state.countIterations + 1) ) {
        onAnimationEnd();
      }
      return {
        ...state,
        countIterations: state.countIterations + 1,
      }
    });
    
  }, [setState, onAnimationEnd]);

  const getOffset = (elem:HTMLElement) => {
    const box = elem.getBoundingClientRect();
    const { body } = document;
    const docEl = document.documentElement;
    const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    const clientTop = docEl.clientTop || body.clientTop || 0;
    const top = box.top + scrollTop - clientTop;
    return Math.round(top);
  };

  const updatePredicate = useCallback(() => {
    const windowHeight = window.innerHeight;
    const scroll = window.scrollY;
    const docHeight = document.documentElement.offsetHeight;
    const currentRef = elemRef.current!;
    if (
      (windowHeight + scroll - 100 > getOffset(currentRef) &&
        scroll < getOffset(currentRef)) ||
      (windowHeight + scroll - 100 >
        getOffset(currentRef) + currentRef.clientHeight &&
        scroll < getOffset(currentRef) + currentRef.clientHeight) ||
      (windowHeight + scroll === docHeight &&
        getOffset(currentRef) + 100 > docHeight)
    ) {
      setState({
        ...state,
        isVisible: true,
        revealed: true,
      });
    } else if (!state.revealed) {
      setState({
        ...state,
        isVisible: false,
        revealed: true,
      });
    }
  }, [state, elemRef]);

  useEffect(() => {

    let thisState = state;
    setState((state) => {
      thisState = state;
      if (state.revealed != reveal) {
         return {
          ...state,
          isVisible: !reveal,
          revealed: !reveal,
        }
      }
      return state;
    });

    if (thisState.revealed) {
      window.addEventListener("scroll", updatePredicate);
      updatePredicate();

      return () => {
        window.removeEventListener("scroll", updatePredicate);
      };
    }
    
  }, [reveal]);


  const styleObject = {
    animationDuration: duration,
    animationDelay: delay,
    animationIterationCount: infinite ? false : count,
    visibility: state.isVisible ? "visible" : "hidden",
    animationName: type,
  };

  const hiddenStyles = {
    animationName: "none",
    visibility: "hidden",
  };

  const getAllStyles = Object.assign(styleObject, style);

  const classes = clsx(
    state.isVisible && "animated",
    type && type,
    infinite && "infinite",
    className
  );

  let animationComponent = (
      <Container>
        <Component
          data-test="animation"
          className={classes}
          onAnimationEnd={handleEnd}
          onAnimationIteration={handleIteration}
          onAnimationStart={handleStart}
          ref={elemRef}
          style={state.isVisible && state.revealed ? getAllStyles : hiddenStyles}
          {...attributes}
        >
        {children}
        </Component>
      </Container>
  );
  return animationComponent;
};


Animation.defaultProps = {
  tag: "div",
  reveal: false,
  duration: 1,
  count: 1,
};

export default Animation;
export { Animation as CDBAnimation };