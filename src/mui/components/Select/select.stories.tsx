import type { Meta, StoryObj } from "@storybook/react";
import Color from "color";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import React from "react";
import { MaterialIcon } from "../../../icons/material-icon";
import { Badge } from "../Badge";
import { clsx } from "../../styles";
import {
  Input as MuiInput,
  Box,
  Box as MuiBox,
  Checkbox,
  useTheme,
  Button,
  IconButton,
  ListItem,
  ListItemButton,
  Select,
  Text,
  AutoSelect,
  autoSelectClasses,
  AutoSelectProps,
  Spinner,
  Popper,
  Input,
  Card,
  useMediaQuery,
} from "../..";
import {
  FloatingContext,
  useClick,
  UseFloatingReturn,
} from "@floating-ui/react";
import { twJoin } from "tailwind-merge";
import { AutoSelectRenderInputParams, getScrollClasses } from "../../..";
import { zIndex } from "../../theme/types";
import { fontSize } from "@mui/system";

//import './scroll.scss'

//import AutoSelect from './AutoSelect';
//import autoSelectClasses from './autoSelectClasses';

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
};

export default meta;

type Story = StoryObj<typeof Select>;

type Fruit = {
  title: string;
  value: string;
};

const FRUITS = [
  "Alfalfa Sprouts",
  "Apple",
  "Apricot",
  "Artichoke",
  "Asian Pear",
  "Asparagus",
  "Atemoya",
  "Avocado",
  "Bamboo Shoots",
  "Banana",
  "Bean Sprouts",
  "Beans",
  "Beets",
  "Belgian Endive",
  "Bell Peppers",
  "Bitter Melon",
  "Blackberries",
  "Blueberries",
  "Bok Choy",
  "Boniato",
  "Boysenberries",
  "Broccoflower",
  "Broccoli",
  "Brussels Sprouts",
  "Cabbage",
  "Cactus Pear",
  "Cantaloupe",
  "Carambola",
  "Carrots",
  "Casaba Melon",
  "Cauliflower",
  "Celery",
  "Chayote",
  "Cherimoya",
  "Cherries",
  "Coconuts",
  "Collard Greens",
  "Corn",
  "Cranberries",
  "Cucumber",
  "Dates",
  "Dried Plums",
  "Eggplant",
  "Endive",
  "Escarole",
  "Feijoa",
  "Fennel",
  "Figs",
  "Garlic",
  "Gooseberries",
  "Grapefruit",
  "Grapes",
  "Green Beans",
  "Green Onions",
  "Greens",
  "Guava",
  "Hominy",
  "Honeydew Melon",
  "Horned Melon",
  "Iceberg Lettuce",
  "Jerusalem Artichoke",
  "Jicama",
  "Kale",
  "Kiwifruit",
  "Kohlrabi",
  "Kumquat",
  "Leeks",
  "Lemons",
  "Lettuce",
  "Lima Beans",
  "Limes",
  "Longan",
  "Loquat",
  "Lychee",
  "Madarins",
  "Malanga",
  "Mandarin Oranges",
  "Mangos",
  "Mulberries",
  "Mushrooms",
  "Napa",
  "Nectarines",
  "Okra",
  "Onion",
  "Oranges",
  "Papayas",
  "Parsnip",
  "Passion Fruit",
  "Peaches",
  "Pears",
  "Peas",
  "Peppers",
  "Persimmons",
  "Pineapple",
  "Plantains",
  "Plums",
  "Pomegranate",
  "Potatoes",
  "Prickly Pear",
  "Prunes",
  "Pummelo",
  "Pumpkin",
  "Quince",
  "Radicchio",
  "Radishes",
  "Raisins",
  "Raspberries",
  "Red Cabbage",
  "Rhubarb",
  "Romaine Lettuce",
  "Rutabaga",
  "Shallots",
  "Snow Peas",
  "Spinach",
  "Sprouts",
  "Squash",
  "Strawberries",
  "String Beans",
  "Sweet Potato",
  "Tangelo",
  "Tangerines",
  "Tomatillo",
  "Tomato",
  "Turnip",
  "Ugli Fruit",
  "Water Chestnuts",
  "Watercress",
  "Watermelon",
  "Waxed Beans",
  "Yams",
  "Yellow Squash",
  "Yuca/Cassava",
  "Zucchini Squash",
];

const OPTIONS: Fruit[] = FRUITS.map(
  (name) => ({ title: name, value: name }),
  {},
);

const ControllableSelectStates = ({ attrs }) => {
  const [value, setValue] = useState(!!attrs.loading ? null : OPTIONS[0]);
  const [inputValue, setInputValue] = useState("");
  const theme = useTheme();
  console.log("ControllableSelectStates:", { value, inputValue });

  const animation = {
    unmount: {
      opacity: 0,
      transformOrigin: "left top",
      //y: '-100%',
      height: 0,
      transition: {
        duration: 0.2,
        ease: [0.17, 0.67, 0.83, 0.67],
        //times: [0, 0.1, 0.6, 1]
      },
    },
    mount: {
      opacity: 1,
      transformOrigin: "left top",
      //y: 0,
      height: "auto",
      transition: {
        duration: 0.2,
        ease: [0.17, 0.67, 0.83, 0.67],
        //times: [0, 0.1, 0.6, 1]
      },
    },
  };

  const animateFn = useCallback((context: UseFloatingReturn) => {
    const arrowXx = context.x ?? 0;
    const arrowYy = context.y ?? 0;
    const rect = context.refs.reference.current?.getBoundingClientRect();
    const refWidth = rect?.width;
    const arrowW = 0;
    const arrowH = 0;
    const transformX = arrowXx + arrowW / 2;
    const transformY = arrowYy + arrowH;
    const [side] = context.placement.split("-");
    const transformOrigin = {
      top: `${transformX}px${arrowH ? ` calc(100% + ${arrowH}px)` : " 100%"}`,
      bottom: `${transformX}px${arrowH ? ` ${-arrowH}px` : " 0px"}`,
      left: `${arrowH ? `calc(100% + ${arrowH}px) ` : "100% "}${transformY}px`,
      right: `${arrowH ? `${-arrowH}px ` : "0px "}${transformY}px`,
    }[side];

    return {
      unmount: { ...animation.unmount },
      mount: { ...animation.mount },
    };
  }, []);

  return (
    <div>
      <div>{`value: ${value !== null ? `'${value.title}'` : "null"}`}</div>
      <div>{`inputValue: '${inputValue}'`}</div>
      <br />
      <AutoSelect
        value={value}
        autoHighlight
        onChange={(newValue: any) => {
          setValue(newValue);
        }}
        id="controllable-states-demo"
        options={!!attrs.loading ? [] : OPTIONS}
        slotProps={{
          popper: {
            animate: animateFn,
            strategy: "fixed",
            keepMounted: true,
            disablePortal: !!attrs.disablePortal,
            style: (context) => ({
              ...context.floatingStyles,
              top: 0,
            }),
          },
          listbox: {
            sx: {
              padding: "8px 4px",
              [`& .${autoSelectClasses.option}`]: {
                borderRadius: "8px",
                padding: "8px 16px",
              },
            },
          },
          popupIndicator: {
            sx: {
              transitionProperty: "transform,background-color",
              transitionDuration: "150ms",
              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              transform: "rotate(-180)",
            },
          },
        }}
        getOptionKey={(x) => x?.value}
        getOptionLabel={(x) => x?.title}
        optionEquals={(o, v) => o?.value === v?.value}
        {...attrs}
        open={attrs.open ? true : undefined}
        label="Controllable"
        menuHeader={
          <MuiBox
            className="w-100 border-b	 border-b-gray-200 w-full"
            height={48}
          ></MuiBox>
        }
        menuFooter={
          <MuiBox className="bg-slate-50 w-100 p-2 w-full flex border-t border-t-gray-200">
            <MuiBox my="auto" display="flex" w={100}>
              <Button
                variant="ghost"
                size="sm"
                color="primary"
                className="rounded-full"
                onClick={() => console.log("onClick")}
              >
                Heloo
              </Button>
            </MuiBox>
          </MuiBox>
        }
      />
    </div>
  );
};

interface DefaultSelectProps<
  Value extends Fruit = Fruit,
  Multiple extends boolean | undefined = false,
> extends Omit<AutoSelectProps<Value, Multiple>, "options" | "multiple"> {
  options?: ReadonlyArray<Value>;
  multiple?: Multiple | true | false | undefined;
}

interface DefaultSelectMultipleProps<
  Value extends Fruit = Fruit,
  Multiple extends boolean = true,
> extends DefaultSelectProps<Value, Multiple> {}

const DefaultSelect = forwardRef((attrs: DefaultSelectProps, ref) => {
  //const [value, setValue] = useState(!!attrs.loading ? null : OPTIONS[0]);
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState<DefaultSelectProps["value"]>(
    (attrs.value ?? attrs.multiple ? [] : null) as DefaultSelectProps["value"],
  );
  const theme = useTheme();
  return (
    <AutoSelect
      value={value}
      onChange={(v: any) => setValue(v)}
      ref={ref}
      {...(attrs as any)}
      //autoHighlight
      options={!!attrs.loading ? [] : attrs.options ?? OPTIONS}
      getOptionKey={(x) => x?.value}
      getOptionLabel={(x) => x?.title ?? ""}
      optionEquals={(o, v) => o?.value === v?.value}
      //readOnly={!!attrs.readOnly}
      //required={!!attrs.required}
      //disabled={!!attrs.disabled}
      //openOnFocus={!!attrs.openOnFocus}
      //clearOnBlur={!!attrs.clearOnBlur}
      //autoComplete={!!attrs.autoComplete}
      loading={!!attrs.loading}
    />
  );
});

export const Basic = () => {
  const [attrs, setAttrs] = useState<{
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    autoComplete?: boolean;
    openOnFocus?: boolean;
    clearOnBlur?: boolean;
    loading?: boolean;
    open?: boolean;
    disableBorder?: boolean;
    disablePortal?: boolean;
  }>({
    autoComplete: false,
    clearOnBlur: false,
  });

  const handleCheckBox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name as keyof typeof attrs;
    setAttrs((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const renderCheckBox = (name: keyof typeof attrs) => {
    const checked = attrs[name] ?? false;
    return (
      <Checkbox
        name={name}
        label={name}
        checked={checked}
        onChange={handleCheckBox}
      />
    );
  };

  return (
    <MuiBox width={360} p={2}>
      <ControllableSelectStates attrs={attrs} />

      <MuiBox mt={2} mp={2}>
        <MuiInput
          label="Search"
          type="text"
          id="outlined-basic"
          endAdornment={
            <IconButton>
              <MaterialIcon icon="account_circle" />
            </IconButton>
          }
        />
      </MuiBox>
      <MuiBox my={2}>
        <MuiInput
          label="Search"
          type="text"
          id="outlined-basic1"
          variant="standard"
          startAdornment={
            <IconButton>
              <MaterialIcon icon="account_box" />
            </IconButton>
          }
          endAdornment={
            <IconButton>
              <MaterialIcon icon="account_circle" />
            </IconButton>
          }
        />
      </MuiBox>

      <MuiBox my={2}>
        <MuiInput
          label="With a start adornment"
          id="input-with-icon-adornment"
          startAdornment={
            <IconButton>
              <MaterialIcon icon="account_circle" />
            </IconButton>
          }
        />
      </MuiBox>

      <MuiBox display="flex" flexDirection="column" mb={3}>
        {renderCheckBox("required")}
        {renderCheckBox("readOnly")}
        {renderCheckBox("disabled")}
        {renderCheckBox("autoComplete")}
        {renderCheckBox("openOnFocus")}
        {renderCheckBox("clearOnBlur")}
        {renderCheckBox("open")}
        {renderCheckBox("loading")}
        {renderCheckBox("disableBorder")}
        {renderCheckBox("disablePortal")}
      </MuiBox>
    </MuiBox>
  );
};

function getListItemWrapperStyles(selected: boolean, disabled?: boolean) {
  return clsx(
    "flex items-center justify-between grow text-justify overflow-hidden outline-none gap-2.5 px-2 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none",
    selected && !disabled ? "bg-slate-200/50 dark:bg-slate-800" : "",
    disabled
      ? "cursor-default pointer-events-none opacity-50"
      : "cursor-pointer",
  );
}

export const Actions: Story = {
  render: () => (
    <div style={{ width: 250 }}>
      <DefaultSelect
        options={OPTIONS}
        disableClearable={true}
        freeSolo
        renderOption={(props, option, state) => {
          const { key, ...others } = props;
          return (
            <button
              key={key}
              {...others}
              className={getListItemWrapperStyles(
                state.selected,
                props.disabled,
              )}
            >
              {option.title}
            </button>
          );
        }}
      />
    </div>
  ),
};

export const Creatable = () => {
  const [value, setValue] = useState<Fruit | null>(null);
  const [text, setText] = useState("");

  const handleInputChange = useCallback((text: string) => {
    setText(text);
  }, []);

  const handleChange = useCallback((value: DefaultSelectProps["value"]) => {
    setValue(value as Fruit | null);
  }, []);

  const exists = useMemo(() => {
    return (
      value?.title.toLowerCase() === text.toLowerCase() ||
      OPTIONS.some((x) => x.title.toLowerCase() === text.toLowerCase())
    );
  }, [text, value?.title]);

  const extras = useMemo(
    () =>
      exists
        ? []
        : [
            {
              key: "create",
              title: `Create ${text}...`,
              onClick: () => {
                setValue({
                  title: text.toUpperCase(),
                  value: text,
                });
              },
            },
            {
              key: "select",
              title: `Select ${text}...`,
              onClick: () => {
                setValue({
                  title: text.toUpperCase(),
                  value: text,
                });
              },
            },
          ],
    [exists, text],
  );

  return (
    <div style={{ width: 250 }}>
      <DefaultSelect
        value={value}
        onChange={handleChange}
        onInputChange={handleInputChange}
        options={OPTIONS}
      />
    </div>
  );
};

export const Multiple: Story = {
  render: () => (
    <Box style={{ width: 250 }} m={8} d="flex" flexDirection="column" g={4}>
      <DefaultSelect multiple disablePortal label="No Limit" />

      <DefaultSelect
        multiple
        limitTags={3}
        disablePortal
        label="Limit 3 tags"
        options={[]}
      />

      <DefaultSelect multiple limitTags={0} disablePortal label="Limit tag 0" />
    </Box>
  ),
};

export const Async = () => {
  const [options, setOptions] = useState<Fruit[]>([]);
  const [loading, setLoading] = useState(false);

  const [text, setText] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleInputChange = useCallback((text: string) => {
    setLoading(true);
    setText(text);
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setLoading(false);
      setOptions(
        OPTIONS.filter((x) =>
          x.title.toLowerCase().includes(text.toLowerCase()),
        ),
      );
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [text]);

  const customOptions = useMemo(() => {
    if (options.length) return [];
    return [
      {
        key: "no-options",
        title: (
          <>
            {loading && <span>Loading...</span>}
            {loading || <span>No options</span>}
          </>
        ),
        disabled: true,
      },
    ];
  }, [loading, options.length]);

  return (
    <div style={{ width: 250 }}>
      <DefaultSelect
        options={options}
        onInputChange={handleInputChange}
        //customOptions={customOptions}
        loading={loading}
        extraAdornment={
          loading ? <Spinner size={20} color="primary" /> : undefined
        }
      />
    </div>
  );
};

export const Renderers = () => {
  return (
    <div style={{ width: 250 }}>
      <DefaultSelect
        multiple
        autoComplete={false}
        itemFocusClassName="bg-slate/20"
        itemFocusVisibleClassName="bg-slate/30"
        options={OPTIONS}
        renderOption={(props, option, state, ownerState) => (
          <ListItemButton
            {...props}
            as="li"
            className={clsx(
              props.className,
              getListItemWrapperStyles(state.selected, ownerState.disabled),
            )}
          >
            {option.value}
          </ListItemButton>
        )}
      />
    </div>
  );
};

function getSelectButtonStyles(selected: boolean, disabled?: boolean) {
  //ps-4 pe-2 py-2.5
  return clsx(
    "flex w-full gap-2.5 px-2 py-2.5 focus:outline-none",
    selected && !disabled
      ? "bg-primary text-white"
      : "hover:bg-primary-400 hover:text-white active:bg-primary active:text-white",
    disabled ? "pointer-events-none opacity-50" : "",
  );
}

export const SelectButton = () => {
  const [inputValue, setInputValue] = useState("");
  
  const ref = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const widthRef = useRef();
  const openRef = useRef(false);
  const butId = useId().replace(":", "");
  const multiple = true;
  const [value, setValue] = useState(multiple ? [] : null);
  //const [ref]
  const animation = {
    unmount: {
      opacity: 0,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
    mount: {
      opacity: 1,
      transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <Box className="w-full flex justify-center mt-10 px-5 relative">
      <Popper
        animate={animation}
        trigger={
          <Button
            endIcon={<MaterialIcon icon="keyboard_arrow_down" size={24} />}
            className="px-3"
            variant="filled"
            id={butId}
            style={{
              minWidth: 260,
            }}
          >
            {multiple ? ('Select '+value?.length +" items") : (value?.title ?? "Not selection ")}
          </Button>
        }
        interactions={(context) => [useClick(context)]}
        disablePortal
        dismiss={{}}
        focusProps={{
          initialFocus: ref,
        }}
        handler={(open) => {
          openRef.current = open;
          if (open) {
            setTimeout(() => {
              if (openRef.current) {
                widthRef.current = cardRef.current!.clientWidth;
              }
            }, 1000);
          } else {
            widthRef.current = undefined;
          }
        }}
      >
        <Card
          variant="elevation"
          elevation={3}
          className="min-w-60	max-w-80 duration-200 transition-height bg-body"
          ref={cardRef}
          style={{
            width: widthRef.current,
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ref.current?.focus();
            console.log("Card::onMouseDown");
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            ref.current?.focus();
          }}
        >
          <Card.Header
            className="py-1"
            title={<Text fw={500}>Select options</Text>}
          />
          <Card.Body className="p-0">
            <DefaultSelect
              //multiple
              open
              autoComplete={false}
              itemFocusClassName="bg-blue-50"
              itemFocusVisibleClassName="bg-blue-100"
              options={OPTIONS}
              //clearOnBlur
              autoFocus
              disablePopper
              //clearOnSelect
              forcePopupIcon={false}
              clearIcon={inputValue ? undefined : false}
              onInputChange={setInputValue}
              onChange={(value) => {
                if(!multiple)
                  document.getElementById(butId)?.click();
                setValue(value);
                setInputValue("");
              }}
              value={value}
              className="mx-2"
              placeholder="Search text"
              ref={ref}
              {...(multiple && {
                multiple,
                disableCloseOnSelect: true,
                renderInputValue: () => null 
              })}
              renderOption={(props, option, state, ownerState) => (
                <ListItemButton
                  ripple={false}
                  startIcon={
                    <Checkbox checked={state.selected} />
                  }
                  {...props}
                  as="li"
                  className={twJoin(
                    "flex w-full gap-2.5 px-2 focus:outline-none",
                    "py-0 fs-12",
                  )}
                >
                  {option.value}
                </ListItemButton>
              )}
              slotProps={{
                panel: {
                  className: "p-0",
                  elevation: 0,
                },
              }}
              renderInput={(props) => (
                <MuiInput
                  {...props}
                  autoFocus
                  startAdornment={
                    <MaterialIcon icon="search" size={20} className="px-1.5" />
                  }
                />
              )}
              menuHeader={
                multiple &&
                <div className="w-full grow border-y mt-1 p">
                  <ListItemButton
                    ripple={false}
                    startIcon={<Checkbox checked={value.length === OPTIONS.length} 
                    indeterminate={!!value?.length && value.length !== OPTIONS.length} />}
                    as="div"
                    className={twJoin(
                      "flex w-full gap-2.5 px-2 focus:outline-none",
                      "fs-12",
                    )}
                    onChange={
                      () => setValue(value!.length === OPTIONS.length ? [] : OPTIONS)
                    }
                  >
                    Select all
                  </ListItemButton>
                </div>
              }
            />
          </Card.Body>
        </Card>
      </Popper>
    </Box>
  );
};

export const Cmdk = () => {
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState(OPTIONS[0]);
  const ref = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const widthRef = useRef();
  const openRef = useRef(false);
  const butId = useId().replace(":", "");
  const theme = useTheme();
  const upMd = useMediaQuery(theme.breakpoints.up("md"));
  const md = useMediaQuery(theme.breakpoints.down("md"));

  //const [ref]
  const animation = {
    unmount: {
      opacity: 0,
      transform: "scale(.9)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0,
      },
    },
    mount: {
      opacity: 1,
      transform: "scale(1)",
      transition: {
        duration: 0.3,
        ease: "easeIn",
        //delay: 0.6,
      },
    },
  };

  const backdropAnimation = {
    unmount: {
      opacity: 0,
      transition: {
        //delay: 0.2,
        ease: "easeOut",
      },
    },
    mount: {
      opacity: 1,
      transition: {
        delay: 0,
        ease: "easeIn",
      },
    },
  };

  return (
    <Box className="w-full flex justify-center mt-10 px-5 relative">
      <Popper
        className="overflow-hidden flex max-w-full max-h-full w-full md:max-w-xl"
        placement="bottom"
        strategy="absolute"
        dismiss={{}}
        animate={animation}
        backdrop={{
          animate: backdropAnimation,
        }}
        style={{
          top: 0,
          bottom: 0,
          position: "relative",
          height: md ? '100'  : undefined
        }}
        focusProps={{
          modal: true,
          initialFocus: ref,
        }}
        overlay={{
          lockScroll: true,
          className: "z-modal flex justify-center items-center",
        }}
        aria-modal="true"
        roles={{ role: "dialog" }}
        trigger={
          <Button
            endIcon={<MaterialIcon icon="keyboard_arrow_down" size={24} />}
            className="px-3"
            variant="filled"
            id={butId}
            style={{
              width: 260,
            }}
          >
            {value ? value.title : "Not selection "}
          </Button>
        }
        interactions={(context) => [useClick(context)]}
        //disablePortal
        handler={(open) => {
          openRef.current = open;
          if (open) {
            setTimeout(() => {
              if (openRef.current) {
                //widthRef.current = cardRef.current!.clientWidth;
              }
            }, 1000);
          } else {
            widthRef.current = undefined;
          }
        }}
      >
        <Card
          variant="elevation"
          elevation={3}
          className="cmdk-palette-content antialiased w-full h-full max-h-full bg-body border shadow-menu md:rounded-lg divide-y transition-height"
          ref={cardRef}
          style={{
            width: widthRef.current,
          }}
          fill
        >
          <Card.Body className="!p-0">
            <DefaultSelect
              open
              autoComplete={false}
              itemFocusClassName="bg-hd-sm"
              itemFocusVisibleClassName="bg-hd-md"
              options={OPTIONS}
              //clearOnBlur
              autoSelect={false}
              autoFocus
              disablePopper
              disableCloseOnSelect
              freeSolo
              clearOnSelect
              forcePopupIcon={false}
              clearIcon={inputValue ? <MaterialIcon icon="cancel" /> : false}
              onInputChange={setInputValue}
              onChange={(value) => {
                document.getElementById(butId)?.click();
                setValue(value);
                setInputValue("");
              }}
              value={value}
              renderTags={() => null}
              className="border-b px-2 text-base text-body text-opacity-80"
              placeholder="Search text"
              ref={ref}
              size="lg"
              renderOption={(props, option, state, ownerState) => (
                <ListItemButton
                  ripple={false}
                  {...props}
                  as="li"
                  className={twJoin(
                    getSelectButtonStyles(state.selected, ownerState.disabled),
                    "ps-4 pe-2 rounded-md",
                  )}
                >
                  {option.value}
                </ListItemButton>
              )}
              slotProps={{
                panel: {
                  className: "overflow-hidden",
                  variant: "elevation",
                  elevation: 0,
                  sx: {
                    backgroundColor: "transparent",
                  },
                },
                listbox: {
                  className: clsx(
                    "px-1 my-4 max-h-80 scroll-py-2",
                    getScrollClasses(),
                  ),
                },
              }}
              renderInput={(props) => (
                <MuiInput
                  {...props}
                  autoFocus
                  disableBorder
                  startAdornment={<MaterialIcon icon="search" size={28} />}
                  nativeClassName="font-fw5"
                  adornmentsProps={{
                    start: {
                      className: "mx-1.5",
                    },
                    end: {
                      className: "mx-1.5",
                    },
                  }}
                />
              )}
            />
          </Card.Body>
        </Card>
      </Popper>
    </Box>
  );
};

export const AutoSelectCmdk = () => {
  const [inputValue, setInputValue] = useState("");
  const [value, setValue] = useState(OPTIONS[0]);
  const ref = useRef<HTMLElement | null>(null);
  const floatingContextRef = useRef<FloatingContext>(null);
  const butId = useId().replace(":", "");
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  const [popperType, setPopperType] = useState(0);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const heightRef = useRef(0);
  const inputValueRef = useRef("");

  const handleOpenState = useCallback(
    (open) => {
      //console.log("handleOpenState:", open, ",popperType:", popperType);
      if (popperType) {
        setTimeout(() => {
          heightRef.current = open
            ? floatingContextRef.current?.refs?.floating?.current
                ?.clientHeight ?? 0
            : 0;
          console.log("SetHeight:height:", heightRef.current);
        }, 1000);
      }
    },
    [popperType],
  );

  //const [ref]
  const animation = {
    unmount: {
      opacity: 0,
      transform: "scale(.9)",
      transition: {
        duration: 0.4,
        ease: "easeOut",
        delay: 0,
      },
    },
    mount: {
      opacity: 1,
      transform: "scale(1)",
      transition: {
        duration: 0.3,
        ease: "easeIn",
        //delay: 0.6,
      },
    },
  };

  const animationDrawer = {
    unmount: {
      opacity: 0,
      y: "100%",
      bottom: md || sm ? 0 : undefined,
      transition: {
        duration: 0.32,
        ease: "easeIn",
      },
    },
    mount: {
      opacity: 1,
      bottom: 0,
      y: 0,
      transition: {
        duration: 0.285,
        ease: "easeIn",
        //delay: 0.6,
      },
    },
  };

  const backdropAnimation = {
    unmount: {
      opacity: 0,
      transition: {
        //delay: 0.2,
        ease: "easeOut",
      },
    },
    mount: {
      opacity: 1,
      transition: {
        delay: 0,
        ease: "easeIn",
      },
    },
  };

  return (
    <Box className="w-full flex justify-center mt-10 px-5 relative gap-2">
      <select onChange={(e) => setPopperType(+e.target.value)}>
        <option value={0} selected={!popperType}>
          Default
        </option>
        <option value={1} selected={popperType === 1}>
          Cmdk
        </option>
        <option value={2} selected={popperType === 2}>
          Drawer
        </option>
      </select>
      <DefaultSelect
        autoComplete={false}
        itemFocusClassName="bg-hd-sm"
        itemFocusVisibleClassName="bg-hd-md"
        options={OPTIONS}
        openOnFocus={false}
        autoSelect={false}
        autoFocus
        clearOnSelect={!!popperType}
        clearOnBlur={false}
        forcePopupIcon={true}
        sx={{ width: "300px" }}
        placeholder="Search text"
        ref={ref}
        onCompleteState={handleOpenState}
        renderOption={(props, option, state, ownerState) => (
          <ListItemButton
            ripple={false}
            {...props}
            as="li"
            className={twJoin(
              getSelectButtonStyles(state.selected, ownerState.disabled),
              "ps-4 pe-2 rounded-md",
            )}
          >
            {option.value}
          </ListItemButton>
        )}
        slotProps={
          !popperType
            ? undefined
            : {
                panel: {
                  elevation: 0,
                  //...(heightRef.current && {height: heightRef.current})
                },
                listbox: {
                  className: clsx(
                    clsx(
                      "px-1 my-1 grow",
                      sm && popperType == 1 && "max-h-full",
                      !sm && popperType == 1 && "max-h-80",
                      popperType == 2 && "max-h-full",
                    ),
                    getScrollClasses(),
                  ),
                },
                popper: {
                  className: clsx(
                    "overflow-hidden flex max-w-full max-h-full w-full md:max-w-xl",
                    sm && "h-full",
                  ),
                  placement: "bottom",
                  strategy: "absolute",
                  animate: popperType == 2 ? animationDrawer : animation,

                  backdrop: {
                    animate: backdropAnimation,
                    onClick:
                      popperType == 2
                        ? (event) => {
                            const parentCard = cardRef.current?.parentElement;
                            let parent = event.target as unknown as HTMLElement;
                            while (parent) {
                              if (parent === parentCard) {
                                return;
                              }
                              parent =
                                parent.parentElement as unknown as HTMLElement;
                            }
                            floatingContextRef.current?.onOpenChange(
                              false,
                              event as any,
                              "blur",
                            );
                          }
                        : undefined,
                  },
                  style: ({ context, floatingStyles }) => {
                    floatingContextRef.current = context;
                    if (popperType == 1)
                      return {
                        position: context.strategy,
                        top: md ? 0 : context.y,
                        left: context.x,
                        height: sm
                          ? "100%"
                          : heightRef.current
                            ? heightRef.current
                            : undefined,
                      };

                    return {
                      position: context.strategy,
                      left: context.x,
                      height: sm
                        ? "100vh"
                        : heightRef.current
                          ? heightRef.current
                          : "auto",
                      maxHeight: sm ? "100vh" : "90vh",
                      bottom: 0,
                    };
                  },
                  focusProps: {
                    modal: true,
                    initialFocus: -1,
                  },
                  overlay: {
                    lockScroll: true,
                    style: {
                      overflow: "hidden",
                      zIndex: theme.zIndex.modal,
                    },
                  },
                  "aria-modal": "true",
                  roles: { role: "dialog" },
                  ...(popperType == 2 && { target: document.body }),
                },
              }
        }
        renderOutside={
          !popperType
            ? undefined
            : (getRootProps, getInputProps, ClearIndicator, open, children) => {
                const { ref, ...rest } = getInputProps(true);
                return (
                  <Card
                    variant="elevation"
                    elevation={3}
                    className={clsx(
                      "cmdk-palette-content antialiased w-full max-h-full overflow-hidden bg-body border shadow-menu divide-y transition-height",
                      !sm && popperType != 2 && "rounded-lg",
                      !sm && "h-full",
                    )}
                    fill
                    ref={cardRef}
                  >
                    <MuiInput
                      {...rest}
                      ref={ref}
                      rootProps={getRootProps()}
                      disableBorder
                      className="container-hover"
                      autoFocus
                      tabIndex={0}
                      startAdornment={<MaterialIcon icon="search" size={28} />}
                      size="lg"
                      endAdornment={
                        <Box
                          as="span"
                          sx={{ visibility: "hidden" }}
                          className="focus-within-show hover-show"
                        >
                          <ClearIndicator
                            size="sm"
                            sx={{ visibility: "visible" }}
                          />
                        </Box>
                      }
                      nativeClassName="font-fw5"
                      adornmentsProps={{
                        start: {
                          className: "mx-1.5",
                        },
                        end: {
                          className: "mx-1.5",
                        },
                      }}
                    />
                    {children}
                  </Card>
                );
              }
        }
        //open={open}
      />
      <Checkbox checked={open} onChange={() => setOpen(!open)} label="Open?" />
    </Box>
  );
};

type PopperType = "select" | "drawer" | "cmdk";

type SelectPopperTypeProps = Partial<DefaultSelectProps> & {
  popperType?: PopperType;
};

type PopperTypeBreakpointsProps = {
  lg?: SelectPopperTypeProps;
  md?: SelectPopperTypeProps;
  sm?: SelectPopperTypeProps;
  common?:
    | Partial<DefaultSelectProps>
    | ((
        bk: "lg" | "sm" | "md",
        popperType?: PopperType,
      ) => Partial<DefaultSelectProps> | null);
};

type PopperTypeProps = SelectPopperTypeProps | PopperTypeBreakpointsProps;

function useSelectPopperType({
  popperTypeProps,
}: {
  popperTypeProps?: PopperTypeProps;
}) {
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.down("md"));
  const sm = useMediaQuery(theme.breakpoints.down("sm"));
  useMemo(() => {
    if (popperTypeProps) {
      let selectPopperTypeProps: SelectPopperTypeProps;
      if (sm) {
        selectPopperTypeProps = popperTypeProps["sm"];
      } else if (md) {
        selectPopperTypeProps = popperTypeProps["md"];
      }
      selectPopperTypeProps ??= popperTypeProps["lg"] ?? popperTypeProps;
      const common = (popperTypeProps as PopperTypeBreakpointsProps).common;

      if (common) {
        selectPopperTypeProps = {
          ...(typeof common === "function"
            ? common(
                sm ? "sm" : md ? "md" : "lg",
                selectPopperTypeProps.popperType,
              )
            : common),
          ...selectPopperTypeProps,
        };
      }
    }
  }, [sm, md, popperTypeProps]);
}
