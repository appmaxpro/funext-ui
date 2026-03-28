import CalendarIcon from "@funext/icons/CalendarToday";
import CheckIcon from "@funext/icons/Check";
import CheckBoxOutlineBlankIcon from "@funext/icons/CheckBoxOutlineBlank";
import { Button, Menu } from "@funext/ui";
import React from "react";
import {
  CalendarPopup,
  formatRangeDates
} from "~/components/shared/calendar";
import { Toolbar } from "~/components/shared/toolbar";
import { DATE_RANGES } from "~/utils/constant";

const menuProps = {
  style: {
    maxHeight: "calc(100vh * 2 / 3)",
    overflow: "hidden",
  },
  contentProps: {
    style: {
      width: "var(--popper-reference-width)",
      overflow: "hidden",
      maxHeight: "inherit",
    },
    "data-ui": "NewMenuContent",
  },
  listProps: {
    component: "div",
    style: {
      overflow: "auto",
      maxHeight: "inherit",
    },
    hover: true,
    active: true,
    focus: true,
    //global: true,
    "data-menu-list": "yes",
    itemStyle: {
      disabled: "",
      className:
        "px-3 py-2 bg-secondary/25 rounded-0 hover:bg-header-min " +
        "active:bg-slate-200 dark:active:bg-slate-700 focus:bg-slate-200 " +
        "dark:focus:bg-slate-700",
    },
  },
};

export function DateFilterFilter() {
  const [value, setValue] = React.useState<
    string | Date | number | [Date, Date] | null
  >("this_month");
  const toolRef = React.useRef<HTMLElement>(null);
  const [visible, setVisible] = React.useState<boolean>(false);

  const [present, setPresent] = React.useState(false);

  const dateLabel = React.useMemo(() => formatRangeDates(value), [value]);

  const onVisibleFn = React.useCallback(
    (visible?: boolean) => {
      setVisible(visible ?? false);
    },
    [setVisible],
  );

  const setValues = React.useCallback(
    (values: any) => {
      setValue(values);
      onVisibleFn();
    },
    [setValue, onVisibleFn],
  );

  const onClick = React.useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      const key = e.currentTarget.dataset["key"];
      console.log("data key:", key);
      if (key === "custom") {
        setVisible(true);
      } else if (key) {
        setValue(key);
      }
      //console.log(e.currentTarget)
    },
    [setValue],
  );

  const dateKey =
    typeof value === "string"
      ? value
      : value && Array.isArray(value)
        ? "custom"
        : "this_month";

  const menuItems = React.useMemo(
    () =>
      Object.keys(DATE_RANGES).map((key) => (
        <Menu.Item
          key={key}
          data-key={key}
          onClick={onClick}
          startIcon={
            dateKey === key ? (
              <CheckIcon className="text-primary" size="sm" />
            ) : (
              <CheckBoxOutlineBlankIcon
                className="text-transparent"
                size="sm"
              />
            )
          }
        >
          {DATE_RANGES[key as keyof typeof DATE_RANGES]}
        </Menu.Item>
      )),
    [dateKey, onClick],
  );
  return (
    <Toolbar ref={toolRef}>
      <Menu
        sticky="partial"
        listProps={menuProps.listProps}
        contentProps={menuProps.contentProps}
        strategy="fixed"
        //boundary={[{height: 260 }, {height: 260 }, {height: 260 }, {height: 260 }]}
        matchReferenceWidth
        constrainSize
        fallbackPlacements={["bottom"]}
        style={menuProps.style}
        //</Toolbar>fallbackPlacements={["tob", "bottom"]}
      >
        <Menu.Trigger>
          <Button variant="ghost" color="inherit" style={{ width: 252 }}>
            <div className="flex gap-2 flex-nowrap grow">
              <CalendarIcon />
              <span className="grow" style={{ textAlign: "justify" }}>
                {dateLabel}
              </span>
            </div>
          </Button>
        </Menu.Trigger>

        {menuItems}
      </Menu>
      {(present || visible) && (
        <CalendarPopup
          onChange={setValues}
          open={visible}
          setPresent={setPresent}
          present={present}
          setOpen={onVisibleFn}
          reference={toolRef.current}
          dateLabel={dateLabel in DATE_RANGES ? undefined : dateLabel}
          mode="range"
          value={
            !visible ? undefined : Array.isArray(value) ? value : [new Date()]
          }
        /> 
      )}
    </Toolbar>
  );
}
