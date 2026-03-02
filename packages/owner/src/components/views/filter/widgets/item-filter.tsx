import {
  clsx,
  IconButton,
  List,
  Spinner,
  toThemeColorClassOrStyle,
} from "@funext/ui";
import React, { useMemo } from "react";
import { iconIf, Icons } from "~/components/other/icons";
import { i18n } from "~/utils";

export interface ItemFilterProps {
  title: React.ReactNode;
  selected?: boolean;
  onClick: (event: Event) => void;
  className?: string;
  startIcon?: React.ReactNode;
  value: any;
}

export const ItemFilter = React.forwardRef<HTMLElement, ItemFilterProps>(
  function ItemFilter({ title, className, selected, onClick, startIcon, value}, ref) {
    return (
      <List.ItemButton
        ref={ref}
        ripple={false}
        className={clsx("py-1 px-1 hover:bg-hd-sm active:bg-hd-sm", className)}
        data-value={String(value ?? "")}
        startIcon={
          <List.Prefix className="me-1 text-2xl">
            {startIcon || 
              (selected ? <Icons.Check className="text-primary"/> : <Icons.Blank/>)}
          </List.Prefix>
        }
        onClick={onClick}
      >
        {title}
      </List.ItemButton>
    );
  },
);

export interface ItemFilterHeaderProps {
  title: React.ReactNode;
  icon?: string;
  type?: string;
  pType?: string;
  className?: string;
  endIcon?: React.ReactNode;
  loading?: boolean;
  onRefresh?: () => void;
  iconColor?: string;
}

export const ItemFilterHeader = React.forwardRef<
  HTMLLIElement,
  ItemFilterHeaderProps
>(function ItemFilterHeader(props, ref) {
  const {
    title,
    icon,
    type,
    pType,
    endIcon,
    loading,
    onRefresh,
    className,
    iconColor,
  } = props;
  const FilterIcon = useMemo(() => {
    const mtIcon = icon ?? (function () {
      switch (type) {
        case "select":
          return "Checklist";
        case "node":
          return "AccountTree";
      }

      switch (pType) {
        case "date":
        case "datetime":
        return "AccessAlarm";
        case "mto":
        case "mtm":
        return "Checklist";
      }
    })();

    return iconIf(mtIcon ??  "Filter",  "Filter");
  }, [icon, type, pType]);


  return (
    <List.Subheader
      gutters={false}
      className={clsx("flex items-center justify-between", className)}
      sx={{ lineHeight: "36px" }}
      ref={ref}
    >
      <div className="flex items-center gap-2">
        <FilterIcon size={24} />
        {typeof title === 'string' ? i18n.get(title) : title}
      </div>
      {loading ? (
        <Spinner size={20} color="primary" />
      ) : onRefresh ? (
        <span className="hover-show active-show hidden">
          <IconButton className="p-1" onClick={onRefresh} size="sm">
            <Icons.Refresh/>
          </IconButton>
        </span>
      ) : (
        endIcon
      )}
    </List.Subheader>
  );
});

export interface LoadMoreFilterProps {
  onClick: (event: Event) => void;
  className?: string;
}

export const LoadMoreFilter = React.forwardRef<
  HTMLElement,
  LoadMoreFilterProps
>(function LoadMoreFilter({ className, onClick }, ref) {
  return (
    <List.ItemButton
      ref={ref}
      className={clsx(
        "py-1 px-1 hover:bg-primary hover:text-white text-primary rounded",
        className,
      )}
      startIcon={
        <List.Prefix className="me-1">
          <Icons.CropSquare
            size={24}
            className={"text-transparent"}
          />
        </List.Prefix>
      }
      endIcon={<Icons.KeyboardArrowDown size={24} />}
      onClick={onClick}
    >
      {i18n.get("Load More")}
    </List.ItemButton>
  );
});

