import { type Component } from '@odoo/owl';
import React, { type ForwardedRef, forwardRef, useContext } from 'react';
import { OwlAppContext } from './owl-context';
import { ReactOwlWrapper} from './react-owl-wrapper';
import type { OwlRoot, OwlProps } from './types';
function OwlWrapper(
    props: {
      name: string;
      component: any;
      inputs?: Record<string, any>;
      events?: Record<string, (ev: Event) => any>;
      outputs?: Record<string, (value: any) => any>;
      tmpl: string;
      tmplContext?: Record<string, any>;
      children?: any;
    },
    forwardedRef: ForwardedRef<OwlRoot<OwlProps, any>>
  ) {
    const app = useContext(OwlAppContext)!;  
    return (
      <ReactOwlWrapper
        name={props.name}
        component={props.component}
        app={app}
        tmpl={props.tmpl}
        tmplContext={props.tmplContext}
        events={props.events}
        outputs={props.outputs}
        ref={forwardedRef}
      >
        {props.children}
      </ReactOwlWrapper>
    );
  }


  
  const OwlWrapperForwardRef = forwardRef(OwlWrapper);
  
  export { OwlWrapperForwardRef as OwlWrapper };