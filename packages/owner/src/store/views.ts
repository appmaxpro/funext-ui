import { shallowEqual } from '@funext/ui';
import { create } from 'zustand'
import { getItemPath } from '~/utils/navigation';
import type { Breadcrumb, Navigation, OutletRoute, PageRoute } from '~/utils/types';


export type ViewOptions = {
  params?: Record<string, any>;
  keys?: [];
  
}

export interface ViewState {
  title: string;
  path: string;
  id: string;
  route: OutletRoute;
  parent?: ViewState;
  options?: any;
  navigation?: Navigation;
}

export type NullViewState = ViewState | null | undefined
export type ViewStore = {
  pages: ViewState[],
  popups: ViewState[],
  add(state:ViewState, options?: ViewOptions): void;
  remove(state?:ViewState): any;
  current(): NullViewState;
};

type Next = ['next' | 'push', null] | ['ignore' | 'update', ViewState]

function getOption(options: ViewOptions) {
   return options.keys?.reduce((acc, next) => ({...acc,[next]: options.params?.[next]}), {}) || options.params 
}


function canPersist(currentRoute: PageRoute, nextRoute: PageRoute) {
   return !!currentRoute.persist
}

function getPath(view: ViewState) {
  const navigation = view.navigation ?? (view.route.parent ? [view.route.parent] : [view.route]);
  return getItemPath(navigation, view.route)
}


function getNext(view: ViewState, list: ViewState[],
   isPage: boolean, options?: ViewOptions): Next {
  const route = view.route
  if ((isPage && route.kind !== 'page') || (!isPage && route.kind === 'page')) {
      return ['next', null]
  }

  const navigation = view.navigation ?? (view.route.parent ? [view.route.parent] : [view.route]);
  const currentPath = getItemPath(navigation, view.route)
  const pos = list.findIndex(a => currentPath === getItemPath(navigation, a.route))
  if (pos >= 0) {
    const found = list[pos];
    
    const op1 = getOption(options ?? {});
    const op2 = getOption(found.options ?? {});

    if(shallowEqual(op1, op2)){
        return ['ignore', found]
    }
    if (!op1 && op2) {
        return ['ignore', found]
    }

    return ['update', found];
  }
  return ['push', null]
}

export const useViewStore = create<ViewStore>((set, get) => ({
  pages: [],
  popups: [],
  current: ()=> get().pages.at(-1),
  add(newState:ViewState, options?: ViewOptions) {
    set((store) => {
      
      const {pages, popups} = store;
      let list = popups;
      let [step, found] = getNext(newState, list, false, options ?? newState.options);
      
      if (step === 'next') {
          list = pages;
          [step, found] = getNext(newState, list, true, options)
      }

      const viewType = list === pages ? 'pages' : 'popups';

      if (found) {
        
        if (step === 'ignore') {
          
          if (list.at(-1) !== found) {
            list = [...list.filter(item => item !== found), found]
            return {...store, [viewType]: list}
          }

          return store;
        }
        const newPage = {...found, ...newState, options: {...found.options, ...(options ?? newState.options)}}
        list = [...list.filter(item => item !== found), newPage]
        return {...store, [viewType]: list}
      }
      

      const newView = {...newState, options: {...options ?? newState.options}}

      if (viewType === 'pages') {
        const current = list.at(-1)?.route as PageRoute
        if (current && !canPersist(current, newView.route as PageRoute)) {
            list = list.slice(0, -1)
        }

      }

      list = [...list, newView] 

      return {...store, [viewType]: list}
    })
  },
  remove(state?:ViewState){
    set((store) => {
      
      const toRemove:NullViewState = state ?? store.popups.at(-1) ??  store.pages.at(-1) ;
      if (toRemove){
        let popups = store.popups.filter(item => item.route !== toRemove.route)
        if (popups.length !== store.popups.length){
            return {...store, popups}
        }
        let pages = store.pages.filter(item => item.route !== toRemove.route)
        return {...store, pages}
      }
      return store
    })
  }
}))