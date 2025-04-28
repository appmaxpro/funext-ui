'use client';
import * as React from 'react';
import { useApp, } from '../hooks/useApp';
import type { NavigateProps } from './types';
import useEnhancedEffect from '../hooks/useEnhancedEffect';
import { useRouter } from '../hooks';

export function Navigate({
  to,
  replace,
  state,
}: NavigateProps) {
  
  const {Navigate:Nav} = useApp();
  const {navigate} = useRouter()!;

  useEnhancedEffect(()=> {

    if (Nav) return;

    let path =  to as string;
    if (typeof to !== 'string') {
      path = to.pathname;
    }
    navigate(path, {history: replace ? 'replace' : 'auto', state})
  }, []); 

  if (Nav) {
     return <Nav to={to} replace={replace} state={state}/>
  }
  return null;
}