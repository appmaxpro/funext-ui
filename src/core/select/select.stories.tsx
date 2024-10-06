import type { Meta, StoryObj } from "@storybook/react";
import Color from "color";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { MaterialIcon } from "../../icons/material-icon";
import { Badge } from "../badge";
import { Box } from "../box";
import { clsx } from "../clsx";
import { 
  Input as MuiInput,
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
  Input
} from "../../mui";
import { height } from "@mui/system";
import { useClick } from "@floating-ui/react";
import { twJoin } from "tailwind-merge";
import classNames from "classnames";
import Card from "@/mui/components/Card";

import './scroll.scss'

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

const ControllableSelectStates = ({attrs}) => {
  const [value, setValue] = useState(!!attrs.loading ? null : OPTIONS[0]);
  const [inputValue, setInputValue] = useState('');
  const theme = useTheme();
  console.log("ControllableSelectStates:", {value, inputValue});

  const animation = {
    unmount: {
      opacity: 0,
      transformOrigin: "top",
      transform: "scale(0.9)",
      y: 0,
      //height: '0px',
      transition: { 
        duration: 0.2,
        ease: [0.17, 0.67, 0.83, 0.67],
        //times: [0, 0.1, 0.6, 1]
      },
    },
    mount: {
      opacity: 1,
      transformOrigin: "top",
      transform: "scale(1)",
      y: 100,
      transition: { 
        duration: 0.2,
        ease: [0.17, 0.67, 0.83, 0.67],
        //times: [0, 0.1, 0.6, 1]
      },
    }
    
  };

  return (
    <div>
      <div>{`value: ${value !== null ? `'${value.title}'` : 'null'}`}</div>
      <div>{`inputValue: '${inputValue}'`}</div>
      <br />
      <AutoSelect
        value={value}
        //open={false} 
        autoHighlight
        onChange={(newValue:any) => {
          setValue(newValue);
        }}
        id="controllable-states-demo"
        options={!!attrs.loading ? [] : OPTIONS}
        slotProps={{
          popper:{
            animate: animation,
            //strategy: 'fixed',
            keepMounted: true,
            disablePortal: true
          },
          listbox: {
            sx: {
              padding: '8px 4px',
              [`& .${autoSelectClasses.option}`]: {
                borderRadius: '8px',
                padding: '8px 16px',
              }
            }
          },
          popupIndicator: {
            sx: {
              transitionProperty: 'transform,background-color',
              transitionDuration: '150ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              transform: 'rotate(-180)'
            }
          }
        }}
        
        getOptionKey={(x) => x?.value}
        getOptionLabel={(x) => x?.title}
        optionEquals={(o, v) => o?.value === v?.value}
        {...attrs}
        open={attrs.open ? true : undefined}
        //open={!!attrs.open}
        label="Controllable"
        
        menuHeader={
          <MuiBox className="w-100 border-b	 border-b-gray-200 w-full" 
          height={48}>

          </MuiBox> 
        }
        menuFooter={
          <MuiBox 
            className="bg-slate-50 w-100 p-2 w-full flex border-t border-t-gray-200" 
           >
            <MuiBox my="auto" display='flex' w={100}>
              <Button variant="ghost" size="sm" color="primary" shadow={false} className="rounded-full"
                onClick={()=> console.log("onClick")}
              >Heloo</Button>
            </MuiBox>
          </MuiBox> 
        }
      />
    </div>
  );
}

const DefaultSelect = (attrs:AutoSelectProps<any, any, any, any, any> ) => {
  //const [value, setValue] = useState(!!attrs.loading ? null : OPTIONS[0]);
  const [inputValue, setInputValue] = useState('');
  const [value, setValue] = useState(attrs.value || attrs.multiple ? [] : null);
  const theme = useTheme();
  return (
    <div>
      <AutoSelect
        value={value}
        onChange={(v:any) => setValue(v)}
        //open={false} 
        {...attrs}
        //autoHighlight
        options={!!attrs.loading ? [] : attrs.options ?? OPTIONS}
        getOptionKey={(x) => x?.value}
        getOptionLabel={(x) => x?.title}
        optionEquals={(o, v) => o?.value === v?.value}
        //readOnly={!!attrs.readOnly}
        //required={!!attrs.required}
        //disabled={!!attrs.disabled}
        //openOnFocus={!!attrs.openOnFocus}
        //clearOnBlur={!!attrs.clearOnBlur}
        //autoComplete={!!attrs.autoComplete}
        loading={!!attrs.loading}
      />
    </div>
  );
}



export const Basic = () => {



  const [attrs, setAttrs] = useState<{
    required?: boolean;
    readOnly?: boolean;
    disabled?: boolean;
    autoComplete?: boolean;
    openOnFocus?: boolean;
    clearOnBlur?: boolean;
    loading?: boolean;
    open?: boolean,
    disableBorder?: boolean,
    disablePortal?: boolean
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
      <Checkbox name={name} label={name} checked={checked} onChange={handleCheckBox}/>
    );
  }

  return (
    <MuiBox width={360} p={2}>
      <ControllableSelectStates attrs={attrs}/>

      <MuiBox mt={2} mp={2}>
        <MuiInput label="Search" type="text" id="outlined-basic"
            endAdornment={
              <IconButton>
                    <MaterialIcon icon="account_circle" />
                </IconButton>
            }
        /> 
      </MuiBox>
      <MuiBox my={2}>
        <MuiInput label="Search" type="text" id="outlined-basic1" 
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
      </MuiBox>

      
       
      
    </MuiBox>
  );
};

function getListItemWrapperStyles(selected: boolean, disabled?: boolean) {
  return clsx(
    "flex items-center justify-between grow text-justify overflow-hidden outline-none gap-2.5 px-2 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none",
    selected && !disabled
      ? "bg-slate-200/50 dark:bg-slate-800"
      : "",
    disabled
      ? "cursor-default pointer-events-none opacity-50"
      : "cursor-pointer"
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
          const {key, ...others} = props;
          return (<button key={key} {...others} className={getListItemWrapperStyles(state.selected, props.disabled)}>
            {option.title}
          </button>);
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

  const handleChange = useCallback((value: SelectValue<Fruit, false>) => {
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
        customOptions={extras}
      />
    </div>
  );
};

export const Multiple: Story = {
  render: () => (
    <div style={{ width: 250 }}>
      <DefaultSelect
        label="Select me"
        multiple
        limitTags={0}
        disablePortal
        keepMounted
      />
    </div>
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
    return ()=> clearTimeout(timerRef.current);
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
          loading ? <Spinner size={20} color="primary"/> : undefined
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
        open
        autoComplete={false}
        itemFocusClassName="bg-slate/20"
        itemFocusVisibleClassName="bg-slate/30"
        options={OPTIONS}
        renderOption={(props, option, state)=> 
          <ListItemButton {...props}
           as='li' 
           className={clsx(props.className, getListItemWrapperStyles(state.selected, props.disabled))}>
              {option.value}
          </ListItemButton>
        }
        
      />
    </div>
  );
};

function getSelectButtonStyles(selected: boolean, disabled?: boolean) {
  return clsx(
    "block gap-2.5 px-2 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none",
    selected && !disabled
      ? "bg-slate-200/50 dark:bg-slate-800"
      : "",
    disabled
      ? "pointer-events-none opacity-50"
      : ""
  );
}

export const SelectButton = () => {
    const [inputValue, setInputValue] = useState('');
    const [value, setValue] = useState(OPTIONS[0]);
    const ref = useRef<HTMLElement|null>(null);
    const cardRef = useRef<HTMLElement|null>(null);
    const widthRef = useRef();
    const openRef = useRef(false);
    const butId = useId().replace(":", '');
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


    return <Box className="w-full flex justify-center mt-10 px-5 relative">
      <Popper
        animate={animation}
        trigger={
            <Button 
              endIcon={<MaterialIcon icon="keyboard_arrow_down" size={24}/>}
              className="px-3"
              variant="filled"
              id={butId}
              style={{
                minWidth:260
              }}
            >{value ?  value.title : 'Not selection '}</Button>
        }
        interactions={(context) => [useClick(context)]}
        disablePortal
        dismiss={{}}
        
        focusProps={{
            initialFocus: ref
        }}
        handler={(open) => {
           openRef.current = open;
           if (open) {
            setTimeout(()=> {
              if (openRef.current){
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
        className="min-w-60	max-w-80 duration-200 transition-height" 
        ref={cardRef}
        style={{
          width: widthRef.current
        }}
        >
        <Card.Header className="m-0 -x-2 px-3 py-2 border-b" shadow={false}>
          <Text variant='h6' fw={500} fontSize={14}>
            Select Menu
          </Text>
        </Card.Header>  
        <Card.Body className="p-0">
          <DefaultSelect
            //multiple
            open
            autoComplete={false}
            itemFocusClassName="bg-slate/20"
            itemFocusVisibleClassName="bg-slate/30"
            options={OPTIONS}
            clearOnBlur
            autoFocus
            disablePopper
            disableCloseOnSelect
            freeSolo
            clearOnSelect
            forcePopupIcon={false}
            clearIcon={inputValue ? undefined : false}
            onInputChange={setInputValue}
            onChange={(value) => {
              document.getElementById(butId)?.click()
              setValue(value);
              setInputValue('');
            }}
            value={value}
            renderTags={()=> null}
            className="border-b"
            placeholder="Search text"
            ref={ref}
            renderOption={(props, option, state)=> 
              <ListItemButton 
                ripple={false}
                {...props}
                as='li' 
                className={twJoin(getSelectButtonStyles(state.selected, props.disabled), 'py-1 fs-12')}>
                  {option.value}
              </ListItemButton>
            }
            slotProps={{
              panel: {
                className: 'shadow-none p-0',
              }
            }}

            renderInput={
              (props)=> <MuiInput 
                {...props} 
                autoFocus
                disableBorder
                startAdornment={
                  <MaterialIcon icon="search" size={20} className="px-1.5"/>
                }
              />
            }
          />
        </Card.Body>
      </Card>
    </Popper> 

    </Box>
}
