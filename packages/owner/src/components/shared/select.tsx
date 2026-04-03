import {
  Button,
  capitalize,
  Chip,
  clsx,
  Dialog,
  Input,
  memoTheme,
  styled,
  type InputProps,
} from "@funext/ui";
import React from "react";

import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  getMultiValues,
  i18n,
  joinMultiValues,
  type Option,
} from "~/utils";
import { toggleFilterValue } from "../../scope/filter/widgets/utils";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "./command";
import { Icons, Icon } from "./icons";
import {
  DynamicPopup,
  Popup,
  type Display,
  type DynamicDisplay,
  type PopupProps,
  type RenderOptions,
} from "./popup";

const autocompleteClasses = {
  tag: "select-tag",
  tagSizeSm: "tag-sm",
  tagSizeMd: "tag-md",
  tagSizeLg: "tag-lg",
  inputRoot: "select-input-root",
  input: "select-input",
  focused: "focused",
  clearIndicator: "clearIndicator",
  focusVisible: "focusVisible",
};

const AutoSelectRoot = styled("div", {
  name: "MuxAutoSelect",
  slot: "Root",
  overridesResolver: (props, styles) => {
    const { ownerState } = props;
    const { fullWidth, hasClearIcon, hasPopupIcon, inputFocused, size } =
      ownerState;

    return [
      { [`& .${autocompleteClasses.tag}`]: styles.tag },
      {
        [`& .${autocompleteClasses.tag}`]: styles[`tagSize${capitalize(size)}`],
      },
      { [`& .${autocompleteClasses.inputRoot}`]: styles.inputRoot },
      { [`& .${autocompleteClasses.input}`]: styles.input },
      {
        [`& .${autocompleteClasses.input}`]:
          inputFocused && styles.inputFocused,
      },
      styles.root,
      fullWidth && styles.fullWidth,
      hasPopupIcon && styles.hasPopupIcon,
      hasClearIcon && styles.hasClearIcon,
    ];
  },
})(
  memoTheme(({ theme }: any) => ({
    [`&.${autocompleteClasses.focused} .${autocompleteClasses.clearIndicator}`]:
      {
        visibility: "visible",
      },
    /* Avoid double tap issue on iOS */
    "@media (pointer: fine)": {
      [`&:hover .${autocompleteClasses.clearIndicator}`]: {
        visibility: "visible",
      },
    },
    [`& .${autocompleteClasses.tag}`]: {
      margin: 1,
      maxWidth: "calc(100% - 6px)",
      [`&.${autocompleteClasses.focusVisible}`]: {
        opacity: 0.8,
        //backgroundColor: `rgba(0, 0, 0, ${})`,
      },
    },
    [`& .${autocompleteClasses.input}`]: {
      flexGrow: 1,
      textOverflow: "ellipsis",
      opacity: 0,
    },
    variants: [
      {
        props: { fullWidth: true },
        style: { width: "100%" },
      },
      {
        props: { inputFocused: true },
        style: {
          [`& .${autocompleteClasses.input}`]: {
            opacity: 1,
          },
        },
      },
    ],
  })),
);

function renderInputValue(option?: Option, value?: any, placeholder?: string) {
  return option?.title ?? value ?? placeholder ?? "";
}

function renderTagInput(options: Option[], size: string, disabled: boolean) {
  const getCustomizedTagProps = (params: any) => ({
    className: autocompleteClasses.tag,
    disabled,
    size,
    key: String(params),
    //xsm: true,
  });

  const prefix = options.map((option, index) => {
    const { key, ...customTagProps } = getCustomizedTagProps(index);
    return (
      <Chip
        key={key}
        label={option.title ?? option.value}
        {...(customTagProps as any)}
      />
    );
  });

  return prefix;
}

type Props = InputProps & {
  options: Option[];
  value?: string | null;
  reference?:
    | "button"
    | "input"
    | ((options: {
        value?: string | null;
        onChange: (value: any) => void;
      }) => React.ReactNode);
  multiple?: boolean;
  search?: boolean;
  fit?: boolean;
  referenceProps?: any;
  onChange: (value: any) => void;
  display?: DynamicDisplay | DynamicDisplay["display"];
  popupProps?: PopupProps;
  popupTitle?: React.ReactNode;
  renderPopup?: (props: RenderOptions) => React.ReactNode;
};

export function Select(props: Props) {
  const {
    reference = "input",
    placeholder,
    referenceProps,
    value,
    multiple,
    options,
    size = "lg",
    disabled = false,
    fit,
    display,
    onChange,
    renderPopup,
    //renderInput,
    popupProps: iPopupProps,
    popupTitle,
    readOnly,
    ...rest
  } = props;

  const popupProps = React.useMemo(() => {
    if (!fit) return iPopupProps;
    if (!iPopupProps)
      return {
        slots: {
          popoverProps: {
            matchReferenceWidth: true,
          },
        },
      };
    //popoverProps
    const { slots } = iPopupProps ?? EMPTY_OBJECT;
    const { popoverProps } = slots ?? EMPTY_OBJECT;
    return {
      ...iPopupProps,
      slots: {
        ...slots,
        popoverProps: {
          ...popoverProps,
          matchReferenceWidth: true,
        },
      },
    };
  }, EMPTY_ARRAY);

  const { multi, single } = React.useMemo(() => {
    const multi = multiple ? getMultiValues(value) : undefined;
    const single = multiple ? undefined : value;
    return {
      multi: multi
        ? options.filter((o) => multi.includes(o.value!))
        : undefined,
      single: single ? options.find((o) => o.value === value) : undefined,
    };
  }, [value, options, multiple]);

  const isStatic = !display || typeof display === "string";
  const Pop = isStatic ? Popup : DynamicPopup;

  const renderCommand = ({ display, close }: RenderOptions) => {
    return (
      <SelectOptions
        value={value ?? undefined}
        options={options}
        input={display === "raw" ? <></> : undefined}
        disabled={disabled ?? readOnly}
        onChange={(newSelected: string) => {
          close();
          if (!(disabled ?? readOnly)) {
            const oldValue = multiple ? getMultiValues(value) : value;
            const newValue = toggleFilterValue(newSelected, oldValue, multiple);
            const finalValue = !newValue
              ? newValue
              : multiple
                ? joinMultiValues(newValue)
                : newValue;
            onChange(finalValue);
          }
        }}
      />
    );
  };

  const renderContent = (options: RenderOptions) => {
    switch (display) {
      case "popover":
      case "raw":
        return renderCommand(options);
      default:
        return (
          <>
            <Dialog.Header onClose={options.close} className="p-2">
              {popupTitle}
            </Dialog.Header>
            <Dialog.Body className="px-2">{renderCommand(options)}</Dialog.Body>
          </>
        );
    }
  };

  const renderInput = () =>
    typeof reference === "function" ? (
      reference({ value, onChange })
    ) : reference === "button" ? (
      <Button variant="outlined" disabled={disabled} {...referenceProps}>
        {renderInputValue(single, value)}
      </Button>
    ) : (
      <Input
        variant="outlined"
        suffix={<Icons.ChevronDown size={size === "lg" ? "md" : "sm"} />}
        readOnly
        value={single ? renderInputValue(single, value) : ""}
        disabled={disabled}
        size={size}
        prefix={
          multi
            ? renderTagInput(multi, size === "lg" ? "md" : "sm", disabled)
            : undefined
        }
        placeholder={placeholder}
        fullWidth
        rootProps={{
          className: clsx(
            autocompleteClasses.inputRoot,
            "max-w-inherit",
            multiple ? "min-w-inherit" : "min-w-[30px]",
          ),
        }}
        onClick={(event: any) => {
          if (event.target === event.currentTarget) {
            //handleInputMouseDown(event);
          }
        }}
      />
    );

  if (readOnly) return renderInput();

  return (
    <div className="flex flex-col gap-4">
      <Pop
        display={display as Display}
        renderContent={renderContent}
        {...popupProps}
      >
        {renderInput()}
      </Pop>
    </div>
  );
}

const DefInput = () => <CommandInput placeholder={i18n.t("Search...")} />;
const DefNoResult = () => (
  <CommandEmpty>{i18n.t("No results found.")}</CommandEmpty>
);

export function SelectOptions({
  options,
  input = <DefInput />,
  noResult = <DefNoResult />,
  onChange,
  value,
  className,
  disabled,
}: {
  options: Option[];
  input?: any;
  noResult?: any;
  onChange: (value: any) => void;
  value?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Command value={value} className={className}>
      {input}
      <CommandList>
        {noResult}
        {options.map((o, index) => (
          <CommandItem
            value={o.value}
            key={index}
            onSelect={onChange}
            disabled={disabled ? disabled : undefined}
          >
            {o.icon && <Icon name={o.icon} />}
            <span className="flex-1">{i18n.t(o.title ?? "")}</span>
            {o.data?.shortcut && (
              <CommandShortcut>{o.data?.shortcut}</CommandShortcut>
            )}
          </CommandItem>
        ))}
      </CommandList>
    </Command>
  );
}
