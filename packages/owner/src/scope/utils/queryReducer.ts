import { type Reducer } from "react";
import set from "lodash/set";


import { removeEmpty, removeIfEmpty, removeKey, type Identifier } from "~/utils";
import type { ListParams, PageInfo } from "../types";

export const SET_SORT = "SET_SORT";

export const SET_PAGE = "SET_PAGE";
export const SET_PER_PAGE = "SET_PER_PAGE";

export const SET_PAGE_INFO = "SET_PAGE_INFO";

export const SET_FILTER = "SET_FILTER";
export const UPDATE_FILTER = "UPDATE_FILTER";


export const TOGGLE_GROUP = "TOGGLE_GROUP";

export const SET_SELECTION = "SET_SELECTION";
export const SET_SEARCH = "SET_SEARCH";
type ActionTypes =
  | {
      type: typeof SET_SORT;
      payload?: string | null;
    }
  | {
      type: typeof SET_PAGE;
      payload: number;
    }
  | {
      type: typeof SET_PER_PAGE;
      payload: number;
    }
    | {
      type: typeof SET_PAGE_INFO;
      payload: PageInfo;
    }
  | {
      type: typeof SET_FILTER;
      payload?: any;
    }
  | {
      type: typeof UPDATE_FILTER;
      payload: {
        filter: any;
      };
    }
  | {
    type: typeof TOGGLE_GROUP;
    payload: string
  }  
  | {
      type: typeof SET_SELECTION;
      payload: Identifier[] | null;
    }
  |
    {
      type: typeof SET_SEARCH;
      payload?: string | null;
    };


/**
 * This reducer is for the react-router query string.
 */
export const queryReducer = (
  prevState: ListParams,
  action: ActionTypes,
): ListParams => {
  const payload = action.payload;
  switch (action.type) {
    case SET_SORT:
      if (payload !== prevState.sort) {

        return removeIfEmpty({
          ...prevState,
          sort: payload,
          page: 1,
        }, 'sort') as ListParams;
      }

      return prevState;

    case SET_PAGE:
      return { ...prevState, page: payload };

    case SET_PER_PAGE:
      return { ...prevState, page: 1, pageSize: payload };
    case SET_PAGE_INFO:
      return { ...prevState, ...payload };

    case SET_FILTER: {
      return removeIfEmpty({
        ...prevState,
        page: 1,
        filter: payload,
      }, 'filter') as ListParams;
    }

    case UPDATE_FILTER: {
      const old = prevState.filter;
      const newFilter = removeEmpty({ ...old, ...payload });

      console.log("UPDATE_FILTER:", newFilter, ", old:", old);
      return removeIfEmpty({
        ...prevState,
        page: 1,
        filter: newFilter,
      }, "filter")as ListParams;
    }
    case TOGGLE_GROUP: {
       const old = prevState.openedGroups; 
       const openedGroups = old.includes(payload)
        ? old.filter((g) => g !== payload)
        : [...old, payload];
       return {
        ...prevState,
        openedGroups
       }
    }
    case SET_SELECTION: {
      return removeIfEmpty({
        ...prevState,
        selectedIds: payload,
      }, 'selectedIds') as ListParams;
    }
    case SET_SEARCH: {
      return removeIfEmpty({
        ...prevState,
        search: payload,
      }, 'search') as ListParams;
    }
  }
  return prevState;
};

export default queryReducer;
