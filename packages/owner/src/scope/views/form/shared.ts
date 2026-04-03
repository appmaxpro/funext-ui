import type React from "react";
import type { ActionHandler } from "~/scope/action";
import type { ListModifiers, ListParams } from "~/scope/types";
import type { Block, FieldErrors, SearchOptions, SearchResult } from "~/utils";

export type IValidator = () => FieldErrors[] | null;
export type ICommitter = () => void;


export type FilterFormProps = {
  search(): Promise<any>;
  filter?: any;
  updateFilters: (filter: any, delay?: boolean) => void;
  onSubmit?():void;
  onReset?():void;
}

export interface FormWithActionHandler {
  readonly actionHandler: ActionHandler;
}