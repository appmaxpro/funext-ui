import { Button, Menu } from "~/ui";
import React from "react";
import { Icons } from "~/components";
import {
  CalendarPopup,
  formatRangeDates,
  getCurrenSelection,
  getPastSelection,
} from "~/components/shared/calendar";
import { Toolbar } from "~/components/shared/toolbar";
import { i18n, isPlainObject } from "~/utils";
import { DATE_RANGES, EMPTY_DEPS } from "~/utils/constant";

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

export function DateFilterButton({
  value,
  onChange,
}: {
  value: any;
  onChange: (value: any) => void;
}) {
  const options = React.useMemo(() => {
    return [
      ...getCurrenSelection(),
      "sep",
      ...getPastSelection(),
      "sep",
      { value: "range", title: i18n.get("Custom") },
    ];
  }, EMPTY_DEPS);

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
      onVisibleFn();
      onChange(values);
    },
    [onChange, onVisibleFn],
  );

  const onClick = React.useCallback(
    (e: React.SyntheticEvent<HTMLButtonElement>) => {
      const target = e.target as HTMLElement;
      const currentTarget = (e.currentTarget as HTMLElement) ?? target;
      const value = currentTarget.dataset["value"] ?? target.dataset["value"];

      console.log("data key:", value);
      if (value === "range") {
        setVisible(true);
      } else if (value) {
        onChange(value);
      }
      //console.log(e.currentTarget)
    },
    [onChange, setVisible],
  );

  const dateKey = React.useMemo(() => {
    const kk = typeof value === "string" 
    ? value 
    : (value ?? "this_month");

    if (typeof kk === "string" && kk in DATE_RANGES) {
      return (
        options.find(
          (option) => isPlainObject(option) && option.value === kk,
        ) as any
      )?.title;
    }
    return formatRangeDates(value);
  }, [value]);

  const menuItems = React.useMemo(
    () =>
      options.map((option, index) =>
        typeof option === "string" ? (
          <Menu.Divider key={index} />
        ) : (
          <Menu.Item key={index} data-value={option.value} onClick={onClick}>
            <Menu.Prefix>
              {dateKey === option.value ? (
                <Icons.Check className="text-primary" size="sm" />
              ) : (
                <Icons.Blank className="text-transparent" size="sm" />
              )}
            </Menu.Prefix>
            {option.title}
          </Menu.Item>
        ),
      ),
    [dateKey, onClick],
  );
  return (
    <Toolbar ref={toolRef} variant="dense">
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
        sideOffset={10}
        //</Toolbar>fallbackPlacements={["tob", "bottom"]}
      >
        <Menu.Trigger>
          <Button variant="ghost" className="gap-2 flex-nowrap" size="sm" color="inherit" style={{ maxWidth: 252, minWidth: 200 }}>
            <Icons.AccessAlarm />
            <span className="grow" style={{ textAlign: "justify" }}>
              {dateLabel}
            </span>
            
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
          mode="range"
          value={
            !visible ? undefined : Array.isArray(value) ? value : [new Date()]
          }
        />
      )}
    </Toolbar>
  );
}
