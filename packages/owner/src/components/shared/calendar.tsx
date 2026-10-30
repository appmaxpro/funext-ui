"use client";

// A custom calendar that is compatible
// with react-day-picker v9 from https://date-picker.luca-felix.com/

import { Button, cn, Dialog, Drawer, Popover } from "~/ui";
import { isNumber, isPlainObject } from "lodash";
import * as React from "react";
import {
  DayPicker,
  labelNext,
  labelPrevious,
  useDayPicker,
  type DateRange,
  type DayPickerProps,
  type Locale,
  type OnSelectHandler,
} from "react-day-picker";
import { useLocalization } from "~/context";
import { DATE_RANGES, i18n, type Option } from "~/utils";
import { moment, type Moment } from "~/utils/l10n";
import { Icons } from "./icons";
import { ScrollArea, ScrollBar } from "./scroll-area";

const buttonNavClassName =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium" +
  " transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" +
  " disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
  " h-9 px-4 py-2 " + //size
  " absolute h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100";

const ghost =
  buttonNavClassName +
  " hover:bg-primary/20 hover:text-primary-900 focus:opacity-[0.9] active:opacity-[0.85]";
const outlined =
  buttonNavClassName +
  " border border-primary text-primary shadow-sm hover:bg-primary/10 hover:text-primary-900";
export type CalendarProps = DayPickerProps & {
  /**
   * In the year view, the number of years to display at once.
   * @default 12
   */
  yearRange?: number;

  /**
   * Wether to show the year switcher in the caption.
   * @default true
   */
  showYearSwitcher?: boolean;

  monthsClassName?: string;
  monthCaptionClassName?: string;
  weekdaysClassName?: string;
  weekdayClassName?: string;
  monthClassName?: string;
  captionClassName?: string;
  captionLabelClassName?: string;
  buttonNextClassName?: string;
  buttonPreviousClassName?: string;
  navClassName?: string;
  monthGridClassName?: string;
  weekClassName?: string;
  dayClassName?: string;
  dayButtonClassName?: string;
  rangeStartClassName?: string;
  rangeEndClassName?: string;
  selectedClassName?: string;
  todayClassName?: string;
  outsideClassName?: string;
  disabledClassName?: string;
  rangeMiddleClassName?: string;
  hiddenClassName?: string;
  selected?: Date | undefined;
};

type NavView = "days" | "years";

/**
 * A custom calendar component built on top of react-day-picker.
 * @param props The props for the calendar.
 * @default yearRange 12
 * @returns
 */
function Calendar({
  className,
  showOutsideDays = true,
  showYearSwitcher = true,
  yearRange = 12,
  numberOfMonths,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<NavView>("days");
  const [displayYears, setDisplayYears] = React.useState<{
    from: number;
    to: number;
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear();
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      };
    }, [yearRange]),
  );

  const { onPrevClick, startMonth, endMonth } = props;

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths;

  const _monthsClassName = cn("relative flex", props.monthsClassName);
  const _monthCaptionClassName = cn(
    "relative mx-10 flex h-7 items-center justify-center",
    props.monthCaptionClassName,
  );
  const _weekdaysClassName = cn("flex flex-row", props.weekdaysClassName);
  const _weekdayClassName = cn(
    "w-8 text-sm font-normal text-muted-foreground",
    props.weekdayClassName,
  );
  const _monthClassName = cn("w-full", props.monthClassName);
  const _captionClassName = cn(
    "relative flex items-center justify-center pt-1",
    props.captionClassName,
  );
  const _captionLabelClassName = cn(
    "truncate text-sm font-medium",
    props.captionLabelClassName,
  );

  const _buttonNextClassName = cn(
    outlined,
    "right-0",
    props.buttonNextClassName,
  );
  const _buttonPreviousClassName = cn(
    outlined,
    "left-0",
    props.buttonPreviousClassName,
  );
  const _navClassName = cn("flex items-start", props.navClassName);
  const _monthGridClassName = cn("mx-auto mt-4", props.monthGridClassName);
  const _weekClassName = cn("mt-2 flex w-max items-start", props.weekClassName);
  const _dayClassName = cn(
    "flex size-8 flex-1 items-center justify-center p-0 text-sm",
    props.dayClassName,
  );
  const _dayButtonClassName = cn(
    ghost,
    "size-8 rounded-md p-0 font-normal transition-none aria-selected:opacity-100",
    props.dayButtonClassName,
  );
  const buttonRangeClassName =
    "bg-accent [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground";
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    "day-range-start rounded-s-md",
    props.rangeStartClassName,
  );
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    "day-range-end rounded-e-md",
    props.rangeEndClassName,
  );
  const _rangeMiddleClassName = cn(
    "bg-accent !text-foreground [&>button]:bg-transparent [&>button]:!text-foreground [&>button]:hover:bg-transparent [&>button]:hover:!text-foreground",
    props.rangeMiddleClassName,
  );
  const _selectedClassName = cn(
    "[&>button]:bg-primary [&>button]:text-white [&>button]:hover:bg-primary [&>button]:hover:text-white",
    props.selectedClassName,
  );
  const _todayClassName = cn(
    "[&>button]:bg-primary [&>button]:text-white",
    props.todayClassName,
  );
  const _outsideClassName = cn(
    "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    props.outsideClassName,
  );
  const _disabledClassName = cn(
    "text-muted-foreground opacity-50",
    props.disabledClassName,
  );
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName);

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      style={{
        width: 248.8 * (columnsDisplayed ?? 1) + "px",
      }}
      classNames={{
        months: _monthsClassName,
        month_caption: _monthCaptionClassName,
        weekdays: _weekdaysClassName,
        weekday: _weekdayClassName,
        month: _monthClassName,
        caption: _captionClassName,
        caption_label: _captionLabelClassName,
        button_next: _buttonNextClassName,
        button_previous: _buttonPreviousClassName,
        nav: _navClassName,
        month_grid: _monthGridClassName,
        week: _weekClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        range_start: _rangeStartClassName,
        range_middle: _rangeMiddleClassName,
        range_end: _rangeEndClassName,
        selected: _selectedClassName,
        today: _todayClassName,
        outside: _outsideClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon =
            orientation === "left" ? Icons.ChevronLeft : Icons.ChevronRight;
          return <Icon className="h-4 w-4" />;
        },
        Nav: ({ className }) => (
          <Nav
            className={className}
            displayYears={displayYears}
            navView={navView}
            setDisplayYears={setDisplayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            onPrevClick={onPrevClick}
          />
        ),
        CaptionLabel: (props) => (
          <CaptionLabel
            showYearSwitcher={showYearSwitcher}
            navView={navView}
            setNavView={setNavView}
            displayYears={displayYears}
            {...props}
          />
        ),
        MonthGrid: ({ className, children, ...props }) => (
          <MonthGrid
            children={children}
            className={className}
            displayYears={displayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            navView={navView}
            setNavView={setNavView}
            {...props}
          />
        ),
      }}
      numberOfMonths={columnsDisplayed}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

function Nav({
  className,
  navView,
  startMonth,
  endMonth,
  displayYears,
  setDisplayYears,
  onPrevClick,
  onNextClick,
}: {
  className?: string;
  navView: NavView;
  startMonth?: Date;
  endMonth?: Date;
  displayYears: { from: number; to: number };
  setDisplayYears: React.Dispatch<
    React.SetStateAction<{ from: number; to: number }>
  >;
  onPrevClick?: (date: Date) => void;
  onNextClick?: (date: Date) => void;
}) {
  const { nextMonth, previousMonth, goToMonth } = useDayPicker();

  const isPreviousDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          moment(new Date(displayYears.from - 1, 0, 1)).diff(startMonth) < 0) ||
        (endMonth &&
          moment(new Date(displayYears.from - 1, 0, 1)).diff(endMonth) > 0)
      );
    }
    return !previousMonth;
  })();

  const isNextDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          moment(new Date(displayYears.to + 1, 0, 1)).diff(startMonth) < 0) ||
        (endMonth &&
          moment(new Date(displayYears.to + 1, 0, 1)).diff(endMonth) > 0)
      );
    }
    return !nextMonth;
  })();

  const handlePreviousClick = React.useCallback(() => {
    if (!previousMonth) return;
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from - (prev.to - prev.from + 1),
        to: prev.to - (prev.to - prev.from + 1),
      }));
      onPrevClick?.(
        new Date(
          displayYears.from - (displayYears.to - displayYears.from),
          0,
          1,
        ),
      );
      return;
    }
    goToMonth(previousMonth);
    onPrevClick?.(previousMonth);
  }, [previousMonth, goToMonth]);

  const handleNextClick = React.useCallback(() => {
    if (!nextMonth) return;
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from + (prev.to - prev.from + 1),
        to: prev.to + (prev.to - prev.from + 1),
      }));
      onNextClick?.(
        new Date(
          displayYears.from + (displayYears.to - displayYears.from),
          0,
          1,
        ),
      );
      return;
    }
    goToMonth(nextMonth);
    onNextClick?.(nextMonth);
  }, [goToMonth, nextMonth]);
  return (
    <nav className={cn("flex items-center", className)}>
      <Button
        variant="outlined"
        className="absolute left-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        type="button"
        tabIndex={isPreviousDisabled ? undefined : -1}
        disabled={isPreviousDisabled}
        aria-label={
          navView === "years"
            ? `Go to the previous ${displayYears.to - displayYears.from + 1} years`
            : labelPrevious(previousMonth)
        }
        onClick={handlePreviousClick}
      >
        <Icons.ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outlined"
        className="absolute right-0 h-7 w-7 bg-transparent p-0 opacity-80 hover:opacity-100"
        type="button"
        tabIndex={isNextDisabled ? undefined : -1}
        disabled={isNextDisabled}
        aria-label={
          navView === "years"
            ? `Go to the next ${displayYears.to - displayYears.from + 1} years`
            : labelNext(nextMonth)
        }
        onClick={handleNextClick}
      >
        <Icons.ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}

function CaptionLabel({
  children,
  showYearSwitcher,
  navView,
  setNavView,
  displayYears,
  ...props
}: {
  showYearSwitcher?: boolean;
  navView: NavView;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
  displayYears: { from: number; to: number };
} & React.HTMLAttributes<HTMLSpanElement>) {
  if (!showYearSwitcher) return <span {...props}>{children}</span>;
  return (
    <Button
      className="h-7 w-full truncate text-sm font-medium"
      variant="ghost"
      size="sm"
      onClick={() => setNavView((prev) => (prev === "days" ? "years" : "days"))}
    >
      {navView === "days"
        ? children
        : displayYears.from + " - " + displayYears.to}
    </Button>
  );
}

function MonthGrid({
  className,
  children,
  displayYears,
  startMonth,
  endMonth,
  navView,
  setNavView,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  displayYears: { from: number; to: number };
  startMonth?: Date;
  endMonth?: Date;
  navView: NavView;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
} & React.TableHTMLAttributes<HTMLTableElement>) {
  if (navView === "years") {
    return (
      <YearGrid
        displayYears={displayYears}
        startMonth={startMonth}
        endMonth={endMonth}
        setNavView={setNavView}
        navView={navView}
        className={className}
        {...props}
      />
    );
  }
  return (
    <table className={className} {...props}>
      {children}
    </table>
  );
}

function YearGrid({
  className,
  displayYears,
  startMonth,
  endMonth,
  setNavView,
  navView,
  ...props
}: {
  className?: string;
  displayYears: { from: number; to: number };
  startMonth?: Date;
  endMonth?: Date;
  setNavView: React.Dispatch<React.SetStateAction<NavView>>;
  navView: NavView;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { goToMonth, selected } = useDayPicker();

  return (
    <div className={cn("grid grid-cols-4 gap-y-2", className)} {...props}>
      {Array.from(
        { length: displayYears.to - displayYears.from + 1 },
        (_, i) => {
          const isBefore =
            moment(new Date(displayYears.from + i, 11, 31)).diff(startMonth!) <
            0;

          const isAfter =
            moment(new Date(displayYears.from + i, 0, 0)).diff(endMonth!) > 0;

          const isDisabled = isBefore || isAfter;
          return (
            <Button
              key={i}
              className={cn(
                "h-7 w-full text-sm font-normal text-foreground",
                displayYears.from + i === new Date().getFullYear() &&
                  "bg-accent font-medium text-accent-foreground",
              )}
              variant="ghost"
              onClick={() => {
                setNavView("days");
                goToMonth(
                  new Date(
                    displayYears.from + i,
                    (selected as Date | undefined)?.getMonth() ?? 0,
                  ),
                );
              }}
              disabled={navView === "years" ? isDisabled : undefined}
            >
              {displayYears.from + i}
            </Button>
          );
        },
      )}
    </div>
  );
}



const hours = Array.from({ length: 12 }, (_, i) => i + 1);

const popoverContent = {
  sx: {
    boxShadow:
      "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
  },
  className:
    "rounded-lg bg-card text-card-fg py-1.5 px-3 break-words whitespace-normal text-sm",
};

type CalendarPopupProps = Omit<CalendarProps, "onChange"> & {
  open?: boolean;
  setOpen: (open?: boolean) => void;
  reference?: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;
  dateLabel?: string;
  onChange: (value: any) => void;
  setPresent?: (a: boolean) => void;
  present: boolean;
  value: Date | number | string | any[] | undefined;
  display?: "popover" | "drawer" | "raw" | "dialog";
  mode?: "single" | "range";
  dateType?: "date" | "datetime";
  //setOpen: (open: Boolean)
};

function CalendarPopup({
  open,
  setOpen,
  reference,
  dateLabel: labelProps,
  onChange,
  value: valueProps,
  setPresent,
  present,
  display = "dialog",
  mode = "single",
  dateType = "date",
  ...props
}: CalendarPopupProps) {
  const locale = useDayPickerLocale();

  const [value, setValue] = React.useState<any>(() =>
    ensureDate(mode, valueProps),
  );

  React.useEffect(() => {
    if (open && valueProps) {
      setValue(ensureDate(mode, valueProps));
    }
  }, [open, valueProps, mode]);

  const onSelect = React.useCallback(
    (selected: DateRange | Date | undefined) => {
      setValue(selected);
    },
    [],
  );

  const dateLabel = React.useMemo(
    () => formatRangeDates(value, dateType),
    [value],
  );

  if (!present && !open) {
    return null;
  }

  const date =
    mode === "range"
      ? (value as DateRange)?.from
      : ((value as Date) ?? new Date());

  const handleOk = () => {
    if (mode === "range") {
      const range = value as DateRange;
      onChange(
        !range.to || range.to === range.from
          ? range.from
          : [range.from, range.to],
      );
      return;
    }
    onChange(value);
  };

  const handleSetToNow = () => {
    onChange(new Date());
  };

  const handleTimeChange = (type: "hour" | "minute" | "ampm", time: string) => {
    if (mode === "range") {
      const range = value as DateRange;
      const d1 = handleDateTimeChange(type, time, range.from);
      const d2 = handleDateTimeChange(type, time, range.to);
      setValue({
        from: d1,
        to: d2,
      });
      //onChange(!d2 || d1 === d2 ? d1 : [d1, d2]);
    } else {
      const d1 = handleDateTimeChange(type, time, value as Date);
      setValue(d1);
    }
    //onChange(d1);
  };

  const disabled = Boolean(!date);

  const calendar = (
    <Calendar
      locale={locale}
      autoFocus
      {...props}
      mode="range"
      selected={value as any}
      onSelect={onSelect as OnSelectHandler<any>}
    />
  );

  const content = (
    <>
      <Dialog.Header className="p-2">
        <h4>{dateLabel ?? labelProps}</h4>
      </Dialog.Header>
      <Dialog.Body className="p-2">
        <div className="sm:flex justify-center">
          {calendar}
          {dateType !== "date" && (
            <>
              <div className="flex flex-col sm:flex-row sm:h-[300px] divide-y sm:divide-y-0 sm:divide-x">
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    {hours.reverse().map((hour) => (
                      <Button
                        key={hour}
                        size="sm"
                        variant={
                          date && new Date(date).getHours() % 12 === hour % 12
                            ? "ghost"
                            : "text"
                        }
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() =>
                          handleTimeChange("hour", hour.toString())
                        }
                      >
                        {hour}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
                <ScrollArea className="w-64 sm:w-auto">
                  <div className="flex sm:flex-col p-2">
                    {Array.from({ length: 12 }, (_, i) => i * 5).map(
                      (minute) => (
                        <Button
                          key={minute}
                          size="sm"
                          variant={
                            date && new Date(date).getMinutes() === minute
                              ? "ghost"
                              : "text"
                          }
                          className="sm:w-full shrink-0 aspect-square"
                          onClick={() =>
                            handleTimeChange("minute", minute.toString())
                          }
                        >
                          {minute}
                        </Button>
                      ),
                    )}
                  </div>
                  <ScrollBar orientation="horizontal" className="sm:hidden" />
                </ScrollArea>
                <ScrollArea className="">
                  <div className="flex sm:flex-col p-2">
                    {["AM", "PM"].map((ampm) => (
                      <Button
                        key={ampm}
                        size="sm"
                        variant={
                          date &&
                          ((ampm === "AM" && new Date(date).getHours() < 12) ||
                            (ampm === "PM" && new Date(date).getHours() >= 12))
                            ? "ghost"
                            : "text"
                        }
                        className="sm:w-full shrink-0 aspect-square"
                        onClick={() => handleTimeChange("ampm", ampm)}
                      >
                        {ampm}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </div>
      </Dialog.Body>
      <Dialog.Footer>
        <Button onClick={() => setOpen()}>{i18n.get("Cancel")}</Button>
        <Button disabled={disabled} onClick={handleSetToNow}>
          {i18n.get("Now")}
        </Button>
        <Button disabled={disabled} onClick={handleOk}>
          {i18n.get("Ok")}
        </Button>
      </Dialog.Footer>
    </>
  );

  if (display === "popover") {
    return (
      <Popover
        open={open}
        onOpenChange={setOpen}
        reference={reference}
        animate
        contentProps={popoverContent}
        placement="bottom-end"
        arrow
        onPresent={setPresent}
      >
        {content}
      </Popover>
    );
  }

  if (display === "dialog") {
    return (
      <Dialog
        open={open}
        onClose={setOpen}
        reference={reference}
        onPresent={setPresent}
      >
        {content}
      </Dialog>
    );
  }

  return (
    <Drawer
      open={open}
      onClose={setOpen}
      direction="bottom"
      reference={reference}
      onPresent={setPresent}
      //dismiss={{}}
    >
      {content}
    </Drawer>
  );
}

export const getCurrenSelection: () => Option[] = () => [
  { value: "today", title: i18n.get("Today") },
  { value: "this_week", title: i18n.get("This Week") },
  { value: "this_month", title: i18n.get("This Month") },
  { value: "this_quarter", title: i18n.get("This Quarter") },
  { value: "this_year", title: i18n.get("This Year") },
];

export const getPastSelection: () => Option[] = () => [
  { value: "last_day", title: i18n.get("Yesterday") },
  { value: "last_week", title: i18n.get("Last Week") },
  { value: "last_month", title: i18n.get("Last Month") },
  { value: "last_quarter", title: i18n.get("Last Quarter") },
  { value: "last_year", title: i18n.get("Last Year") },
];

export const getNextSelection: () => Option[] = () => [
  { value: "next_day", title: i18n.get("Tomorrow") },
  { value: "next_week", title: i18n.get("Next Week") },
  { value: "next_month", title: i18n.get("Next Month") },
  { value: "next_quarter", title: i18n.get("Next Quarter") },
  { value: "next_year", title: i18n.get("Next Year") },
];

function ensureDate(mode: "single" | "range", value?: any) {
  if (mode === "range") {
    if (value == null) return {from: new Date() };
    if (Array.isArray(value)) {
      if (!value[0]) return { from: new Date() };
      if (!value[1] || value[0] === value[1])
        return { from: getDateValue(value[0]) ?? new Date() };
      return {
        from: getDateValue(value[0]) ?? new Date(),
        to: getDateValue(value[1]) ?? new Date(),
      };
    }
    if (isPlainObject(value)) {
      if (value.from instanceof Date) {
        return value;
      }
      return {
        from: getDateValue(value.from) ?? new Date(),
        to: getDateValue(value.to),
      };
    }
    if (typeof value === "string") {
      if (value.startsWith("range_")) {
        const ds = value.replace("range_", "").split("-");
        if (ds.length === 1) {
          return new Date(parseInt(ds[0]));
        }
        return {
          from: getDateValue(parseInt(ds[0])),
          to: getDateValue(parseInt(ds[1])),
        };
      }
    }
    return { from: getDateValue(value) ??new Date() };
  }
  return getDateValue(value);
}

function getDateValue(value?: any) {
  if (value == null) return undefined;
  if (value instanceof Date) return value;
  if (value instanceof moment) return (value as Moment).toDate();
  if (typeof value === "number") return new Date(value);
  if (typeof value === "string") return new Date(value);
  return undefined;
}

export function formatRangeDates(
  value:
    | string
    | Date
    | number
    | [Date, Date]
    | CalendarProps["selected"]
    | DateRange
    | null,
  dateType: "datetime" | "date" = "date",
) {
  let nValue: string | boolean =
    typeof value === "string" ? value : !value && "this_month";

  let label = "";
  if (isPlainObject(value)) {
    const range = value as DateRange;
    let v1 = range.from,
      v2 = range.to;

    if (!v2 || v1?.getTime() === v2?.getTime()) {
      label = v1?.toISOString().split("T")[0] ?? "";
    } else if (v1 && v2) {
      label = `${v1.toISOString()?.split("T")[0]} - ${v2.toISOString()?.split("T")[0]}`;
    }
  }
  if (Array.isArray(value)) {
    let v1 =
        typeof value[0] === "string"
          ? new Date(isNumber(value[0]) ? parseInt(String(value[0])) : value[0])
          : (value[0] ?? new Date()),
      v2 =
        typeof value[1] === "string"
          ? new Date(isNumber(value[1]) ? parseInt(String(value[1])) : value[1])
          : (value[1] ?? new Date());

    if (v1.getTime() === v2.getTime()) {
      label = v1!.toISOString().split("T")[0];
    } else {
      label = `${v1.toISOString()?.split("T")[0]} - ${v2.toISOString()?.split("T")[0]}`;
    }
  } else if (value instanceof Date) {
    label = value.toISOString().split("T")[0];
  } else if (isNumber(value)) {
    label = new Date(value).toISOString().split("T")[0];
  } else if (nValue && nValue in DATE_RANGES) {
    label = DATE_RANGES[nValue as keyof typeof DATE_RANGES];
  } else if (nValue && nValue.startsWith("range_")) {
    const ds = nValue.replace("range_", "").split("-");
    if (ds.length === 1) {
      return formatRangeDates(new Date(parseInt(ds[0])), dateType);
    }
    return formatRangeDates(
      [new Date(parseInt(ds[0])), new Date(parseInt(ds[1]))],
      dateType,
    );
  }
  return label;
}

function bcpTagToDatePickerLocale(
  tag: string,
  module: typeof import("react-day-picker/locale"),
): Locale | undefined {
  switch (tag) {
    case "ar":
      return module.ar;
    default:
      return module.enUS;
  }
}

const handleDateTimeChange = (
  type: "hour" | "minute" | "ampm",
  value: string,
  date: Date | undefined | null,
) => {
  if (date) {
    const newDate = new Date(date);
    if (type === "hour") {
      newDate.setHours(
        (parseInt(value) % 12) + (newDate.getHours() >= 12 ? 12 : 0),
      );
    } else if (type === "minute") {
      newDate.setMinutes(parseInt(value));
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      newDate.setHours(value === "PM" ? currentHours + 12 : currentHours - 12);
    }
    return newDate;
  }
};

/**
 * @description
 * Returns a `Locale` object that can be passed to the react-day-picker
 * `locale` prop.
 */
export function useDayPickerLocale() {
  const { language } = useLocalization();
  const [calendarLocale, setCalendarLocale] = React.useState<
    Locale | undefined
  >(undefined);
  React.useEffect(() => {
    import("react-day-picker/locale").then((mod) => {
      setCalendarLocale(bcpTagToDatePickerLocale(language, mod));
    });
  }, [language]);
  return calendarLocale;
}

export type { DateRange };

export { Calendar, CalendarPopup };
