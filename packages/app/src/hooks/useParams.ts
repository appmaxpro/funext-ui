'use client';
import * as React from 'react';
import {RouterContext } from '../shared/context';
import { useRouter } from './useRouter';

export function useParams() {
  const {searchParams} = useRouter();
  return React.useMemo(()=> {
    const params:Record<string,string> = {};
    if(searchParams) {
      for(let [name, value] of searchParams.entries() ) {
        params[name] = value;
      }
    }
    return params;
  }, [searchParams]);
}