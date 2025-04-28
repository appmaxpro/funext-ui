'use client';
import * as React from 'react';
import {AppContext } from '../shared/context';

export function useApp() {
  const appContext = React.useContext(AppContext);
  return appContext;
}