'use client';
import * as React from 'react';
import {RouterContext } from '../shared/context';

export function useRouter() {
  const router = React.useContext(RouterContext)!;
  return router;
}