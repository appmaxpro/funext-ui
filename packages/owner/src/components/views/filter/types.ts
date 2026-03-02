import type { FilterGroup, FilterField } from "~/utils/filter";

export type OnFilterChange = (name: string, value?: any) => void;

export interface FilterProps<F extends FilterGroup | FilterField>
  extends Omit<React.ComponentPropsWithRef<"div">, "onChange"> {
  item: F;
  onChange: (event: Event) => void;
  toggleOpen: (name: string) => void;
  isOpen?: boolean;
  value?: any;
}
