import type { RenderOptions } from "~/components/shared/popup";
import type { FilterGroup, FilterField, FilterTabs, FilterFieldDateOptions } from "~/utils/filter";

export type OnFilterChange = (name: string, value?: any) => void;
export type FilterPropsType = FilterGroup | FilterField | FilterTabs | FilterFieldDateOptions;

export interface FilterProps<FilterPropsType>
  extends Omit<React.ComponentPropsWithRef<"div">, "onChange"> {
  item: FilterPropsType;
  onChange: (event: Event) => void;
  toggleOpen?: (name: string) => void;
  isOpen?: boolean;
  value?: any;
  hideHeader?: boolean;
  tagMode?: boolean;
  display?: RenderOptions['display'];
  closePopup?: RenderOptions['close'];
  divider?: boolean;
}

export type FilterTagProps<P extends FilterPropsType> = FilterProps<P> & {
  renderFilter: (options: RenderOptions & FilterProps<P>) => React.ReactNode;
}