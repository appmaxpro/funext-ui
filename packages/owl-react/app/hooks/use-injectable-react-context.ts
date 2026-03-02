import { useContextMap, type ContextMap } from '../its-fine';
import { type Context, useMemo } from 'react';
//import { BehaviorSubject, distinctUntilChanged, Observable } from 'rxjs';
import { reactive } from '@odoo/owl';

/** Read functions for React contexts */
export type InjectableReactContext = {
  //read: <T>(context: Context<T>) => Observable<T | undefined>;
  read: <T>(context: Context<T>) => T | undefined;
  readCurrent: <T>(context: Context<T>) => T | undefined;
};

/** Creates a PassedReactContext */
export function useInjectableReactContext() {
  const contextMap = reactive(useContextMap());
  const all$ = useMemo(() => contextMap, [contextMap]);

  //all$.next(contextMap);

  const injectableReactContext: InjectableReactContext = useMemo(
    () => ({
      read: (x) =>
        all$.get(x),
      readCurrent: (x) => all$.get(x),
    }),
    [all$]
  );
  /*
  const injectableReactContext: InjectableReactContext = useMemo(
    () => ({
      read: (x) =>
        all$.pipe(
          map((contexts) => contexts.get(x)),
          distinctUntilChanged()
        ),
      readCurrent: (x) => all$.value?.get(x),
    }),
    [all$]
  );*/

  return injectableReactContext;
}