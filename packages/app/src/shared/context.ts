import * as React from 'react';
import type { Nav, Router, AppProviderProps } from '../app';


export const NavContext = React.createContext<Nav>([]);

export const RouterContext = React.createContext<Router | null>(null);

export const AppContext = React.createContext<{
  Navigate?: AppProviderProps['Navigate'];
}>({});