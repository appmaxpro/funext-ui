  fadeIn: (x: number, y: number, config?: RippleConfig) => RippleRef;
import { RippleConfig, RippleRef } from './ripple-ref';
import {Ripple, RippleTarget} from './ripple';

import { useForwardedRef } from '../../core/hooks/use-refs';
import { useState, ForwardedRef, useEffect, useRef, useCallback } from 'react';

// @floating-ui
import {
  useId
} from "@floating-ui/react";

export * from './ripple';
export * from './ripple-ref';
import style from './styles.module.scss';



export interface RippleProps<T> extends RippleConfig {
  ref: ForwardedRef<T>;
  disabled?: boolean;
  trigger?: HTMLElement;
}

const RippleType = typeof Ripple;

export interface RippleResult<T extends HTMLElement> {
  setupElement: (element: HTMLElement) => void;
  fadeIn: (x: number, y: number, config?: RippleConfig) => void;
  fadeOut:() => void;
  ref: ForwardedRef<T>;
  className: string;
  rippleId?: string;
}

export interface RippleValue {
  time: number;
  ripple: Ripple;
}

const rippleCache = new Map<string, RippleValue>();

export function useRipple<T extends HTMLElement>(props: RippleProps<T>) : RippleResult<T> {
   const {ref, disabled, trigger, ...rest} = props;
   const elementRef = useForwardedRef<T>(ref);
   const rippleRef = useRef<Ripple|null>(null);
   const rippleRefId = useRef<string|null>(null);
   const rippleRefRef = useRef<RippleRef|undefined>();

   //const elementRef = ref ? ref : fwRef;
   const domId = useId();

   //console.log("useRipple: className:", rest);

   const setupElement = useCallback((element: HTMLElement)=> {
       if (rippleRef.current) {
          rippleRef.current.setupElement(element);
       }
   }, [rippleRef.current]);

   useEffect(()=>{
    if(elementRef.current) {
      const activeTrigger = trigger ?? elementRef.current;
      const rippleDisabled = disabled ?? !!(elementRef.current as any).disabled;
      if (!rippleDisabled) {
        let rippleId = elementRef.current.getAttribute('data-ripple-id');
        if (!rippleId) {
          rippleId = rippleRefId.current || domId.replace(/:/g, '');
          //elementRef.current.setAttribute("data-ripple", rippleId);        
        }
        if (rippleRefId.current != rippleId) {
          rippleRefId.current = rippleId;
        }
      } else if(rippleRefId.current){
        //elementRef.current.removeAttribute('data-ripple');
        rippleRefId.current = null; 
      }
      //console.log("Create ripple:", rippleId, ", hasRipple:", !!rippleRef.current );
    }
  }, [elementRef]);

   useEffect(()=>{
      if(elementRef.current) {
        const activeTrigger = trigger ?? elementRef.current;
        const rippleDisabled = disabled ?? !!(elementRef.current as any).disabled;
        if (!rippleDisabled) {
          const ripple = new Ripple({rippleDisabled, rippleConfig: rest} as unknown as RippleTarget, elementRef.current);
          rippleRef.current = ripple;
          ripple.setupElement(activeTrigger);
          return () => {          
            setTimeout(()=> {
              ripple.destroyElement(activeTrigger);
            }, 500);
          };
        } else if (rippleRef.current) {
          rippleRef.current.destroyElement(activeTrigger);
          rippleRef.current = null;
        }
      }
      
   }, [rippleRefId.current, disabled]);

   const fadeIn = useCallback((x: number, y: number, config?: RippleConfig)=> {
      rippleRefRef.current = rippleRef.current?.fadeInRipple(x, y, config);
   }, [rippleRef.current]);

   const fadeOut = useCallback(()=> {
    if (rippleRefRef.current) {
      rippleRef.current?.fadeOutRipple(rippleRefRef.current);
      rippleRefRef.current = undefined;
    }
   }, [rippleRef.current]);

   return {
    ref: elementRef,
    setupElement,
    fadeIn,
    fadeOut,
    className: disabled ? '': style['mat-ripple'],
    rippleId: rippleRefId.current || undefined
   } 

}