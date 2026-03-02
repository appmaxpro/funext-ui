import type { Identifier } from "~/utils";

export type FilterParams = {
  openedGroups: string[];
  filter?: Record<string, any>;
  search?: string;
};

export type ListParams = FilterParams & {
  sort?: string | null | undefined;
  selectedIds?: Identifier | null | undefined;
  page: number;
  pageSize: number;
  total: number;
  offset: number;
  pages: number;
};

export interface ListModifiers {
  changeParams: (action: any) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSort: (sort?: string | null) => void;
  setFilters: (filters?: any) => void;
  updateFilters: (filters: any, debounce?: boolean) => void;
  setSearch: (s?: string | null) => void;
  toggleGroup: (name: string) => void;
  setSelectionIds: (selectedIds?: any[] | null) => void;
}
