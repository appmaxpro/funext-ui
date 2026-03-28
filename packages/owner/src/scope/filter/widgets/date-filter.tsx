import { Button, Dialog, Flex, IconButton, List, Stack } from "@funext/ui";
import { useMemo } from "react";
import {
  ItemFilter,
  ItemFilterHeader,
  type ItemFilterProps,
} from "./item-filter";
import {
  EMPTY_ARRAY,
  getWidgetProp,
  i18n,
  isPlainObject,
  type Option,
} from "~/utils";
import type {
  FilterFieldDateOptions,
  FilterFieldOptions,
} from "~/utils/filter";
import type { FilterProps, OnFilterChange } from "../types";
import React from "react";
import {
  CalendarPopup,
  formatRangeDates,
  Items,
  type DateRange,
} from "~/components/shared";
import { Icons } from "~/components";
import { Popup, type RenderOptions } from "~/components/shared/popup";

export const DATE_RANGES = {
  today: "Today",

  this_week: "This Week",
  this_month: "This Month",
  this_quarter: "This Quarter",
  this_year: "This Year",

  last_day: "Yesterday",
  last_week: "This Week",
  last_month: "This Month",
  last_quarter: "This Quarter",
  last_year: "This Year",

  next_day: "Tomorrow",
  next_week: "Next Week",
  next_month: "Next Month",
  next_quarter: "Next Quarter",
  next_year: "Next Year",
};

const getCurrenSelection: () => Option[] = () => [
  { value: "today", title: i18n.get("Today") },
  { value: "this_week", title: i18n.get("This Week") },
  { value: "this_month", title: i18n.get("This Month") },
  { value: "this_quarter", title: i18n.get("This Quarter") },
  { value: "this_year", title: i18n.get("This Year") },
];

const getPastSelection: () => Option[] = () => [
  { value: "last_day", title: i18n.get("Yesterday") },
  { value: "last_week", title: i18n.get("Last Week") },
  { value: "last_month", title: i18n.get("Last Month") },
  { value: "last_quarter", title: i18n.get("Last Quarter") },
  { value: "last_year", title: i18n.get("Last Year") },
];

const getNextSelection: () => Option[] = () => [
  { value: "next_day", title: i18n.get("Tomorrow") },
  { value: "next_week", title: i18n.get("Next Week") },
  { value: "next_month", title: i18n.get("Next Month") },
  { value: "next_quarter", title: i18n.get("Next Quarter") },
  { value: "next_year", title: i18n.get("Next Year") },
];

function useDateSelection({ options, name }: FilterFieldDateOptions) {
  return useMemo(() => {
    const selectionArray: Option[] = [];
    options?.forEach((v) => {
      if (selectionArray.length) {
        selectionArray.push({});
      }
      switch (v) {
        case "current":
          selectionArray.push(...getCurrenSelection());

          break;
        case "last":
          selectionArray.push(...getPastSelection());
          break;
        case "next":
          selectionArray.push(...getNextSelection());
          break;
      }
    });
    if (options?.includes("range")) {
      if (selectionArray.length) {
        selectionArray.push({});
      }
      selectionArray.push({ value: "range", title: i18n.get("Custom") });
    }
    return selectionArray;
  }, EMPTY_ARRAY);
}

export function DateFilter({
  item,
  onChange,
  value,
  tagMode,
  showPopup,
  setShowPopup,
  display,
  closePopup,
  divider
}: FilterProps<FilterFieldDateOptions> & {
  showPopup?: boolean;
  setShowPopup?: (visible: boolean) => void;
}) {
  //const { title, value, } = item;

  const selections = useDateSelection(item);
  console.log("DateFilter::setValues:", value);
  return (
    <List
      data-ui="FilterItemList"
      className={`w-full flex-1 ${divider ? 'border-t-1 pt-2': ''}`}
      data-list=""
      data-filter_key={item.name}
    >
      {!closePopup && (
        <ItemFilterHeader
          icon={getWidgetProp(item.props, "icon")}
          title={item.title ?? item.name}
          type={item.type}
          pType={item.pType ?? "date"}
        />
      )}
      {selections.map((option, index) =>
        option.value !== "range" ? (
          option.value ? (
            <ItemFilter
              key={`filter_${index}`}
              value={option.value}
              selected={option.value === value}
              title={option.title}
              onClick={onChange}
            />
          ) : (
            <List.Divider />
          )
        ) : (
          <CustomDateFilter
            key={`filter_${index}`}
            value={value}
            selected={String(value).startsWith("range_")}
            title={option.title}
            onClick={onChange}
            display={display}
            closePopup={closePopup}
          />
        ),
      )}
    </List>
  );
}

export const CustomDateFilter = React.forwardRef<
  HTMLElement,
  ItemFilterProps & {
    closePopup: FilterProps<any>["closePopup"];
    display?: FilterProps<any>["display"];
  }
>(function DateFilter(props, ref) {
  const {
    value,
    selected,
    onClick: onClickProp,
    closePopup,
    display,
    title,
    ...rest
  } = props;

  const btnRef = React.useRef<HTMLElement>(null);
  const rootRef = React.useRef<HTMLElement>(null);

  const dateLabel = React.useMemo(
    () => (selected ? formatRangeDates(value as any) : null),
    [value],
  );

  const [visible, setVisible] = React.useState<boolean | undefined>(false);

  const [present, setPresent] = React.useState(false);

  const setValues = React.useCallback(
    (values: any) => {
      console.log("DateFilter::setValues:", values);
      let root = rootRef.current!;
      if (isPlainObject(value)) {
        const range = value as unknown as DateRange;
        root.dataset["new_value"] =
          `range_${range.from?.getTime()}-${range.to?.getTime()}`;
      } else if (Array.isArray(values)) {
        root.dataset["new_value"] =
          `range_${values[0].getTime()}-${values[1].getTime()}`;
      } else if (values instanceof Date) {
        root.dataset["new_value"] = `range_${values.getTime()}`;
      } else {
        delete root.dataset["new_value"];
        root.dataset["value"] = value;
      }
      rootRef.current!.click();
      setVisible(false);
    },
    [value],
  );

  const onClick = React.useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      onClickProp?.(e as any);
    },
    [selected, onClickProp],
  );

  const toggleShowPopup = React.useCallback(() => {
    setVisible((visible) => {
      !visible && closePopup?.();
      return !visible;
    });
  }, [closePopup, setVisible]);

  return (
    <Stack
      onClick={onClick}
      ref={rootRef as any}
      data-value={selected ? value : undefined}
      data-new_value={undefined}
      width="100%"
    >
      <Flex gap={1} width="100%">
        <List.Item className="flex items-center w-full p-0">
          <List.Prefix className="text-2xl">
            <Icons.Blank />
          </List.Prefix>
          <span className="flex-1">{title}</span>
          <List.Suffix className="text-2xl">
            <IconButton size="sm" ref={btnRef as any} onClick={toggleShowPopup}>
              <Icons.MoreVert />
            </IconButton>
          </List.Suffix>
        </List.Item>

        {(present || visible) && (
          <CalendarPopup
            onChange={setValues}
            open={visible}
            setOpen={setVisible}
            present={present}
            setPresent={setPresent}
            reference={btnRef.current}
            display="dialog"
            //dateLabel={dateLabel in DATE_RANGES ? undefined : dateLabel}
            mode="range"
            value={
              !visible ? undefined : Array.isArray(value) ? value : [new Date()]
            }
          />
        )}
      </Flex>
      {dateLabel && (
        <Flex gap={2} className="items-center">
          <IconButton size="sm" onClick={setValues}>
            <Icons.Close size="sm" />
          </IconButton>

          <span className="flex-1 text-sm wrap-break-word">{dateLabel}</span>
        </Flex>
      )}
    </Stack>
  );
});
