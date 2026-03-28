

import * as React from "react";


export type LocationProps = {
  scope?: string | RegExp; 
  children?: React.ReactNode;
  url?: string
};

type NestedArray<T> = Array<T | NestedArray<T>>;

interface KnownProps {
  path: string;
  query: Record<string, string>;
  params: Record<string, string>;
  default?: boolean;
  rest?: string;
  component?: React.ComponentType;
}

interface ArbitraryProps {
  [prop: string]: any;
}

type MatchProps = KnownProps & ArbitraryProps;

export type RouterProps = {
  onRouteChange?: (url: string) => void;
  children?: NestedArray<React.ReactNode>;
  Layout?:React.ComponentType;
  stacked?: boolean;
}

interface RouteLocation{
  url: string;
  path: string;
  query: Record<string, string>;
  action: 'push' | 'pop' | 'replace';
  state?: any | null;
}


export interface RouterLocationValue extends RouteLocation{
  navigate: (state: RouteLocation) => void;
  canRoute: (state: RouteLocation) => Promise<boolean>;
}

export type BlockerFn = (current: RouteLocation, next: RouteLocation) => Promise<boolean>;



interface RouteHook {
  path: string;
  query: Record<string, string>;
  params: Record<string, string>;
}

type RoutableProps =
  | { path: string; default?: false; }
  | { path?: never; default: true; }

export type RouteProps<Props> = RoutableProps & { component: React.ComponentType<Props> };

export type RoutePropsForPath<Path extends string> = Path extends '*'
  ? { params: {}; rest: string }

  : Path extends `:${infer placeholder}?/${infer rest}`
  ? { [k in placeholder]?: string } & { params: RoutePropsForPath<rest>['params'] & { [k in placeholder]?: string } } & Omit<RoutePropsForPath<rest>, 'params'>

  : Path extends `:${infer placeholder}/${infer rest}`
  ? { [k in placeholder]: string } & { params: RoutePropsForPath<rest>['params'] & { [k in placeholder]: string } } & Omit<RoutePropsForPath<rest>, 'params'>

  : Path extends `:${infer placeholder}?`
  ? { [k in placeholder]?: string } & { params: { [k in placeholder]?: string } }

  : Path extends `:${infer placeholder}*`
  ? { [k in placeholder]?: string } & { params: { [k in placeholder]?: string } }

  : Path extends `:${infer placeholder}+`
  ? { [k in placeholder]: string } & { params: { [k in placeholder]: string } }

  : Path extends `:${infer placeholder}`
  ? { [k in placeholder]: string } & { params: { [k in placeholder]: string } }

  : Path extends (`/${infer rest}` | `${infer _}/${infer rest}`)
  ? RoutePropsForPath<rest>

  : { params: {} };
