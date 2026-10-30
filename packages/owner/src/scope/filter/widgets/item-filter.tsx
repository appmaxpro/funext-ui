import { Button, clsx, Dialog, IconButton, List, Spinner, Text } from "~/ui";
import React, { useMemo } from "react";
import { i18n } from "~/utils";
import type { FilterProps, FilterPropsType } from "../types";
import { Popup, iconIf, Icons, Items, type RenderOptions } from "~/components";

export interface ItemFilterProps {
  title: React.ReactNode;
  selected?: boolean;
  onClick?: (event: Event) => void;
  className?: string;
  startIcon?: React.ReactNode;
  value: any;
}

export const ItemFilter = React.forwardRef<HTMLElement, ItemFilterProps>(
  function ItemFilter(
    { title, className, selected, onClick, startIcon, value },
    ref,
  ) {
    return (
      <List.ItemButton
        ref={ref}
        //ripple={false}
        className={clsx("py-1 px-1 hover:bg-hd active:bg-hd gap-1", className)}
        data-value={String(value ?? "")}
        onClick={onClick}
        title={title}
      >
        <List.Prefix className="text-2xl">
          {startIcon ||
            (selected ? (
              <Icons.Check className="text-primary" />
            ) : (
              <Icons.Blank />
            ))}
        </List.Prefix>
        <span className="flex-1">{title}</span>
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
    const mtIcon =
      icon ??
      (function () {
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

    return iconIf(mtIcon ?? "Filter", "Filter");
  }, [icon, type, pType]);

  return (
    <List.Subheader
      gutters={false}
      className={clsx("flex items-center justify-between", className)}
      sx={{ lineHeight: "36px" }}
      ref={ref}
    >
      <div className="flex items-center gap-2 flex-1 font-medium text-md">
        <FilterIcon size={24} />
        {typeof title === "string" ? i18n.get(title) : title}
      </div>
      {loading ? (
        <Spinner size={20} color="primary" />
      ) : onRefresh ? (
        <span className="hover-show active-show hidden">
          <IconButton className="p-1" onClick={onRefresh} size="sm">
            <Icons.Refresh />
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
        "py-1 px-1 hover:bg-primary hover:text-white text-primary rounded text-center",
        className,
      )}
      onClick={onClick}
    >
      <List.Text primary={i18n.get("Load More")}/>
      <List.Suffix className="text-2xl">
        <Icons.ArrowDown size={24} />
      </List.Suffix>
    </List.ItemButton>
  );
});

type FilterTagProps<P extends FilterPropsType> = FilterProps<P> & {
  renderFilter: (options: RenderOptions & FilterProps<P>) => React.ReactNode;
};

export function FilterTag<P extends FilterPropsType>(props: FilterTagProps<P>) {
  const { renderFilter, ...rest } = props;
  const { value, item } = props;

  const btnRef = React.useRef<HTMLElement>(null);
  const renderFilterMemo = React.useMemo(() => {
    return (options: RenderOptions) => renderFilter({ ...options, ...rest });
  }, [props]);

  const renderContent = React.useCallback(
    (options: RenderOptions) => {
      return (
        <>
          <Dialog.Header
            onClose={options.close}
            className="py-1 px-2"
            titleClassName="p-0"
          >
            <Text variant="h6"><Items.Tr>{item.title ?? item.name}</Items.Tr></Text>
          </Dialog.Header>
          <Dialog.Body className="px-2 pb-3">
            {renderFilter({ ...options, ...rest })}
          </Dialog.Body>
          <Dialog.Footer>
            <Button onClick={options.close}>{i18n.get("Ok")}</Button>
          </Dialog.Footer>
        </>
      );
    },
    [props],
  );

  return (
    <Popup
      display="drawer"
      renderContent={renderContent}
      slots={{
        drawerProps: {
          fullScreen: true,
        },
      }}
    >
      <Button
        ref={btnRef}
        size="sm"
        className="justify-between rounded-full text-xs px-1.5 py-0"
        variant={value ? "ghost" : "outlined"}
        color="inherit"
      >
        {i18n.t(item.title ?? item.name)} <Icons.ChevronDown size={16} />
      </Button>
    </Popup>
  );
}
