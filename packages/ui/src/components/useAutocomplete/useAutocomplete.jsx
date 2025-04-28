/* eslint-disable no-constant-condition */
import * as React from "react";
import {
  useEventCallback,
  useControlled,
  useId,
  usePrevious,
} from "../../hooks";

// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
function stripDiacritics(string) {
  return string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function setRef(ref, value) {
  if (typeof ref === "function") {
    ref(value);
  } else {
    ref.current = value;
  }
}

export function createFilterOptions(config = {}) {
  const {
    ignoreAccents = true,
    ignoreCase = true,
    limit,
    matchFrom = "any",
    stringify,
    trim = false,
    matches,
  } = config;

  return (options, inputValue, getOptionLabel) => {
    let input = trim ? `${inputValue}`.trim() : `${inputValue}`;

    if (ignoreAccents) {
      input = stripDiacritics(input);
    }

    if (!options) {
      return options;
    }

    if (matches) {
      return options.filter((option) => matches(option, input));
    }

    if (ignoreCase) {
      input = input.toLowerCase();
    }

    const filteredOptions = !input
      ? options
      : options.filter((option) => {
          let candidate = (stringify || getOptionLabel)(option);
          if (ignoreCase) {
            candidate = candidate.toLowerCase();
          }
          if (ignoreAccents) {
            candidate = stripDiacritics(candidate);
          }

          return matchFrom === "start"
            ? candidate.startsWith(input)
            : candidate.indexOf(input) > -1;
        });

    return typeof limit === "number"
      ? filteredOptions.slice(0, limit)
      : filteredOptions;
  };
}

const defaultFilterOptions = createFilterOptions();
const defaultGetOptionLabel = (option) =>
  typeof option === "string" ? option : option.label ?? option;

// Number of options to jump in list box when `Page Up` and `Page Down` keys are used.
const pageSize = 5;

const defaultIsActiveElementInListbox = (listboxRef) =>
  listboxRef.current !== null &&
  listboxRef.current.parentElement?.contains(document.activeElement);

const MULTIPLE_DEFAULT_VALUE = [];

export function useAutocomplete(props) {
  const {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    unstable_isActiveElementInListbox = defaultIsActiveElementInListbox,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    unstable_classNamePrefix = "Mux",
    itemFocusClassName,
    itemFocusVisibleClassName,
    freeSolo = false,
    allowCreateOption = freeSolo,
    autoComplete = false,
    autoHighlight = false,
    autoSelect = false,
    blurOnSelect = false,
    clearOnBlur = true,
    clearOnSelect = freeSolo && clearOnBlur,
    selectOnFocus = false,
    handleHomeEndKeys = !freeSolo,
    clearOnEscape = false,
    openOnFocus = false,
    componentName = "useAutocomplete",
    multiple = false,
    defaultValue = multiple ? MULTIPLE_DEFAULT_VALUE : null,
    disableClearable = false,
    disableCloseOnSelect = false,
    disabled: disabledProp,
    disabledItemsFocusable = false,
    disableListWrap = false,
    optionMatches,
    filterOptions = optionMatches
      ? createFilterOptions({ matches: optionMatches })
      : defaultFilterOptions,
    filterSelectedOptions = false,
    allowFilter = true,

    getOptionDisabled,
    getOptionKey,
    getOptionLabel: getOptionLabelProp = defaultGetOptionLabel,
    groupBy,

    id: idProp,
    includeInputInList = false,
    inputValue: inputValueProp,
    optionEquals: optionEqualsProp,
    onChange,
    onClose,
    onHighlightChange,
    onInputChange,
    onOpen,
    open: openProp,
    options,
    readOnly = false,

    value: valueProp,
    action,
    inOpen,
    renderOutside,
    required,
  } = props;

  const id = useId(idProp);


  const optionEquals = React.useCallback(
    (opt1, opt2) => {
      if (opt1 === opt2 ) return true;
      if (!opt1 || !opt2 ) return false;

      return optionEqualsProp
      ? optionEqualsProp(opt1, opt2)
      : getOptionKey
        ? getOptionKey(opt1) === getOptionKey(opt2)
        : opt1 === opt2;
    },
    [getOptionKey, optionEqualsProp],
  );

  const getOptionLabel = (option) => {
    const optionLabel = getOptionLabelProp(option) || "";
    if (typeof optionLabel !== "string") {
      if (process.env.NODE_ENV !== "production") {
        const erroneousReturn =
          optionLabel === undefined
            ? "undefined"
            : `${typeof optionLabel} (${optionLabel})`;
        console.error(
          `MUX: The \`getOptionLabel\` method of ${componentName} returned ${erroneousReturn} instead of a string for ${JSON.stringify(
            option,
          )}.`,
        );
      }
      return String(optionLabel);
    }
    return optionLabel;
  };

  const ignoreFocus = React.useRef(false);
  const firstFocus = React.useRef(true);
  const inputRef = React.useRef(null);
  const listboxRef = React.useRef(null);
  const popupOutside = React.useRef(false);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const [focusedTag, setFocusedTag] = React.useState(-1);
  const defaultHighlighted = autoHighlight ? 0 : -1;
  const highlightedIndexRef = React.useRef(defaultHighlighted);

  const [value, setValueState] = useControlled({
    state: valueProp,
    defaultState: defaultValue,
    name: componentName,
    prop: "value",
  });
  const [inputValue, setInputValueState] = useControlled({
    state: inputValueProp,
    defaultState: "",
    name: componentName,
    prop: "inputValue",
  });

  const [focused, setFocused] = React.useState(false);

  const resetInputValue = React.useCallback(
    (event, newValue, reason) => {
      // retain current `inputValue` if new option isn't selected and `clearOnBlur` is false
      // When `multiple` is enabled, `newValue` is an array of all selected items including the newly selected item
      const isOptionSelected = multiple
        ? value.length < newValue.length
        : newValue !== null;

      if (!isOptionSelected && !clearOnBlur) {
        return;
      }
      let newInputValue;
      if (multiple || clearOnSelect) {
        newInputValue = "";
      } else if (newValue == null) {
        newInputValue = "";
      } else {
        const optionLabel = getOptionLabel(newValue);
        newInputValue = typeof optionLabel === "string" ? optionLabel : "";
      }

      if (inputValue === newInputValue) {
        return;
      }

      setInputValueState(newInputValue);

      if (onInputChange) {
        onInputChange(newInputValue, reason, event);
      }
    },
    [
      getOptionLabelProp,
      inputValue,
      multiple,
      onInputChange,
      setInputValueState,
      clearOnBlur,
      value,
    ],
  );

  const [open, setOpenState] = useControlled({
    state: openProp,
    defaultState: false,
    name: componentName,
    prop: "open",
  });

  const [inputPristine, setInputPristine] = React.useState(true);

  const inputValueIsSelectedValue =
    !multiple &&
    (value == null ? inputValue === "" : inputValue === getOptionLabel(value));

  
  /*
  console.log("inputValueIsSelectedValue:", inputValueIsSelectedValue,
     ", inputValue:", inputValue, ", value:", value, ", inputPristine:", inputPristine)
  */
  const popupOpen = (open && !readOnly) || openProp;

  const memoOptions = React.useMemo(
    () =>
      allowFilter && !freeSolo
        ? filterOptions(
            filterSelectedOptions
              ? options.filter((option) => {
                  return !(multiple ? value : [value]).some(
                    (value2) => value2 !== null && optionEquals(option, value2),
                  );
                })
              : options,
            // we use the empty string to manipulate `filterOptions` to not filter any options
            // i.e. the filter predicate always returns true

            inputValueIsSelectedValue && inputPristine ? "" : inputValue,
            getOptionLabel,
          )
        : options,
    [
      options,
      inputValueIsSelectedValue && inputPristine ? "" : inputValue,
      allowFilter,
      freeSolo,
      multiple,
      filterSelectedOptions ? value : "",
      filterSelectedOptions ? optionEquals : undefined,
      getOptionLabelProp,
    ],
  );

  const filteredOptions = popupOpen || inOpen ? memoOptions : [];

  if (popupOpen) {
    //console.log("filteredOptions:", filteredOptions?.length)
  }
  const previousProps = usePrevious({
    filteredOptions,
    value,
    inputValue,
  });

  React.useEffect(() => {
    const valueChange = !optionEquals(value, previousProps.value);

    if (focused && !valueChange) {
      return;
    }

    // Only reset the input's value when freeSolo if the component's value changes.
    if (freeSolo && !valueChange) {
      return;
    }

    resetInputValue(null, value, "reset");

    

  }, [value, resetInputValue, focused, previousProps.value, freeSolo]);

  const listboxAvailable = open && filteredOptions.length > 0;

  if (process.env.NODE_ENV !== "production") {
    if (value !== null && !freeSolo && options.length > 0 && allowFilter) {
      const missingValue = (multiple ? value : [value]).filter(
        (value2) => !options.some((option) => optionEquals(option, value2)),
      );

      if (missingValue.length > 0) {
        console.warn(
          [
            `MUI: The value provided to ${componentName} is invalid.`,
            `None of the options match with \`${
              missingValue.length > 1
                ? JSON.stringify(missingValue)
                : JSON.stringify(missingValue[0])
            }\`.`,
            "You can use the `optionEquals` prop to customize the equality test.",
          ].join("\n"),
        );
      }
    }
  }

  const focusTag = useEventCallback((tagToFocus) => {
    if (tagToFocus === -1) {
      if (inputRef.current) inputRef.current.focus();
    } else {
      anchorEl.querySelector(`[data-tag-index="${tagToFocus}"]`).focus();
    }
  });

  // Ensure the focusedTag is never inconsistent
  React.useEffect(() => {
    if (multiple && focusedTag > value.length - 1) {
      setFocusedTag(-1);
      focusTag(-1);
    }
  }, [value, multiple, focusedTag, focusTag]);

  function validOptionIndex(index, direction) {
    if (!listboxRef.current || index < 0 || index >= filteredOptions.length) {
      return -1;
    }

    let nextFocus = index;

    while (true) {
      const option = listboxRef.current.querySelector(
        `[data-option-index="${nextFocus}"]`,
      );

      // Same logic as MenuList.js
      const nextFocusDisabled = disabledItemsFocusable
        ? false
        : !option ||
          option.disabled ||
          option.getAttribute("aria-disabled") === "true";

      if (option && option.hasAttribute("tabindex") && !nextFocusDisabled) {
        // The next option is available
        return nextFocus;
      }

      // The next option is disabled, move to the next element.
      // with looped index
      if (direction === "next") {
        nextFocus = (nextFocus + 1) % filteredOptions.length;
      } else {
        nextFocus =
          (nextFocus - 1 + filteredOptions.length) % filteredOptions.length;
      }

      // We end up with initial index, that means we don't have available options.
      // All of them are disabled
      if (nextFocus === index) {
        return -1;
      }
    }
  }

  const setHighlightedIndex = useEventCallback(
    ({ event, index, reason = "auto" }) => {
      if (!inputRef.current) return;
      highlightedIndexRef.current = index;

      // does the index exist?
      if (index === -1) {
        inputRef.current.removeAttribute("aria-activedescendant");
      } else {
        inputRef.current.setAttribute(
          "aria-activedescendant",
          `${id}-option-${index}`,
        );
      }

      if (onHighlightChange) {
        onHighlightChange(
          index === -1 ? null : filteredOptions[index],
          reason,
          event,
        );
      }

      if (!listboxRef.current) {
        return;
      }

      const removeFocusClass = (target) => {
        if (itemFocusClassName) {
          itemFocusClassName.split(" ").forEach((c) => target.remove(c));
          target.remove(`${unstable_classNamePrefix}-k-focused`);
        } else {
          target.remove(`${unstable_classNamePrefix}-focused`);
        }
        if (itemFocusVisibleClassName) {
          itemFocusVisibleClassName.split(" ").forEach((c) => target.remove(c));
        } else {
          target.remove(`${unstable_classNamePrefix}-focusVisible`);
        }
      };
      const addFocusClass = (target) => {
        if (itemFocusClassName) {
          itemFocusClassName.split(" ").forEach((c) => target.add(c));
          target.add(`${unstable_classNamePrefix}-k-focused`);
        } else {
          target.add(`${unstable_classNamePrefix}-focused`);
        }
        if (reason === "keyboard") {
          if (itemFocusVisibleClassName) {
            itemFocusVisibleClassName.split(" ").forEach((c) => target.add(c));
          } else {
            target.add(`${unstable_classNamePrefix}-focusVisible`);
          }
        }
      };

      const prev = listboxRef.current.querySelector(
        itemFocusClassName
          ? `[role="option"].${unstable_classNamePrefix}-k-focused`
          : `[role="option"].${unstable_classNamePrefix}-focused`,
      );
      if (prev) {
        removeFocusClass(prev.classList);
      }

      let listboxNode = listboxRef.current;
      if (listboxRef.current.getAttribute("role") !== "listbox") {
        listboxNode =
          listboxRef.current.parentElement.querySelector('[role="listbox"]');
      }

      // "No results"
      if (!listboxNode) {
        return;
      }

      if (index === -1) {
        listboxNode.scrollTop = 0;
        return;
      }

      const option = listboxRef.current.querySelector(
        `[data-option-index="${index}"]`,
      );

      if (!option) {
        return;
      }
      addFocusClass(option.classList);

      // Scroll active descendant into view.
      // Logic copied from https://www.w3.org/WAI/content-assets/wai-aria-practices/patterns/combobox/examples/js/select-only.js
      // In case of mouse clicks and touch (in mobile devices) we avoid scrolling the element and keep both behaviors same.
      // Consider this API instead once it has a better browser support:
      // .scrollIntoView({ scrollMode: 'if-needed', block: 'nearest' });
      if (
        listboxNode.scrollHeight > listboxNode.clientHeight &&
        reason !== "mouse" &&
        reason !== "touch"
      ) {
        const element = option;

        const scrollBottom = listboxNode.clientHeight + listboxNode.scrollTop;
        const elementBottom = element.offsetTop + element.offsetHeight;
        if (elementBottom > scrollBottom) {
          listboxNode.scrollTop = elementBottom - listboxNode.clientHeight;
        } else if (
          element.offsetTop - element.offsetHeight * (groupBy ? 1.3 : 0) <
          listboxNode.scrollTop
        ) {
          listboxNode.scrollTop =
            element.offsetTop - element.offsetHeight * (groupBy ? 1.3 : 0);
        }
      }
    },
    [inputRef],
  );

  const changeHighlightedIndex = useEventCallback(
    ({ event, diff, direction = "next", reason = "auto" }) => {
      if (!popupOpen || !inputRef.current) {
        //console.log("changeHighlightedIndex: no inputRef");
        return;
      }

      const getNextIndex = () => {
        const maxIndex = filteredOptions.length - 1;

        if (diff === "reset") {
          return defaultHighlighted;
        }

        if (diff === "start") {
          return 0;
        }

        if (diff === "end") {
          return maxIndex;
        }

        const newIndex = highlightedIndexRef.current + diff;

        if (newIndex < 0) {
          if (newIndex === -1 && includeInputInList) {
            return -1;
          }

          if (
            (disableListWrap && highlightedIndexRef.current !== -1) ||
            Math.abs(diff) > 1
          ) {
            return 0;
          }

          return maxIndex;
        }

        if (newIndex > maxIndex) {
          if (newIndex === maxIndex + 1 && includeInputInList) {
            return -1;
          }

          if (disableListWrap || Math.abs(diff) > 1) {
            return maxIndex;
          }

          return 0;
        }

        return newIndex;
      };

      const nextIndex = validOptionIndex(getNextIndex(), direction);
      setHighlightedIndex({ index: nextIndex, reason, event });

      // Sync the content of the input with the highlighted option.
      if (autoComplete && diff !== "reset") {
        if (nextIndex === -1) {
          inputRef.current.value = inputValue;
        } else {
          const option = getOptionLabel(filteredOptions[nextIndex]) || '';
          inputRef.current.value = option;

          // The portion of the selected suggestion that has not been typed by the user,
          // a completion string, appears inline after the input cursor in the textbox.
          const index = option.toLowerCase().indexOf(inputValue.toLowerCase());
          if (
            index === 0 &&
            inputValue.length > 0 &&
            inputRef.current.setSelectionRange
          ) {
            inputRef.current.setSelectionRange(
              inputValue.length,
              option.length,
            );
          }
        }
      }
    },
    [inputRef],
  );

  const getPreviousHighlightedOptionIndex = () => {
    const isSameValue = (value1, value2) => {
      const label1 = value1 ? getOptionLabel(value1) : "";
      const label2 = value2 ? getOptionLabel(value2) : "";
      return label1 === label2;
    };

    if (
      highlightedIndexRef.current !== -1 &&
      previousProps.filteredOptions &&
      previousProps.filteredOptions.length !== filteredOptions.length &&
      previousProps.inputValue === inputValue &&
      (multiple
        ? value.length === previousProps.value.length &&
          previousProps.value.every(
            (val, i) => getOptionLabel(value[i]) === getOptionLabel(val),
          )
        : isSameValue(previousProps.value, value))
    ) {
      const previousHighlightedOption =
        previousProps.filteredOptions[highlightedIndexRef.current];

      if (previousHighlightedOption) {
        return filteredOptions.findIndex((option) => {
          return (
            getOptionLabel(option) === getOptionLabel(previousHighlightedOption)
          );
        });
      }
    }
    return -1;
  };


  const syncHighlightedIndex = React.useCallback(() => {
    if (!popupOpen) {
      return;
    }

    // Check if the previously highlighted option still exists in the updated filtered options list and if the value and inputValue haven't changed
    // If it exists and the value and the inputValue haven't changed, just update its index, otherwise continue execution
    const previousHighlightedOptionIndex = getPreviousHighlightedOptionIndex();
    if (previousHighlightedOptionIndex !== -1) {
      highlightedIndexRef.current = previousHighlightedOptionIndex;
      return;
    }

    const valueItem = multiple ? value[0] : value;

    // The popup is empty, reset
    if (filteredOptions.length === 0 || valueItem == null) {
      changeHighlightedIndex({ diff: "reset" });
      return;
    }

    if (!listboxRef.current) {
      return;
    }

    // Synchronize the value with the highlighted index
    if (valueItem != null) {
      const currentOption = filteredOptions[highlightedIndexRef.current];

      // Keep the current highlighted index if possible
      if (
        multiple &&
        currentOption &&
        value.findIndex((val) => optionEquals(currentOption, val)) !== -1
      ) {
        return;
      }

      const itemIndex = filteredOptions.findIndex((optionItem) =>
        optionEquals(optionItem, valueItem),
      );
      if (itemIndex === -1) {
        changeHighlightedIndex({ diff: "reset" });
      } else {
        setHighlightedIndex({ index: itemIndex });
      }
      return;
    }

    // Prevent the highlighted index to leak outside the boundaries.
    if (highlightedIndexRef.current >= filteredOptions.length - 1) {
      setHighlightedIndex({ index: filteredOptions.length - 1 });
      return;
    }

    // Restore the focus to the previous index.
    setHighlightedIndex({ index: highlightedIndexRef.current });
    // Ignore filteredOptions (and options, optionEquals, getOptionLabel) not to break the scroll position
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // Only sync the highlighted index when the option switch between empty and not
    filteredOptions.length,
    // Don't sync the highlighted index with the value when multiple
    // eslint-disable-next-line react-hooks/exhaustive-deps
    multiple ? false : value,
    filterSelectedOptions,
    changeHighlightedIndex,
    setHighlightedIndex,
    popupOpen,
    inputValue,
    multiple,
  ]);

  const handleListboxRef = useEventCallback((node) => {
    if(listboxRef.current === node)
      return;
    setRef(listboxRef, node);

    if (!node) {
      return;
    }
    const lastPos = listboxRef.current?.scrollTop;
    syncHighlightedIndex();
    let listboxNode = listboxRef.current;
    if (listboxNode && lastPos)
      listboxNode.scrollTop = lastPos;
  });

  

  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      if (!inputRef.current || inputRef.current.nodeName !== "INPUT") {
        if (inputRef.current && inputRef.current.nodeName === "TEXTAREA") {
          console.warn(
            [
              `A textarea element was provided to ${componentName} where input was expected.`,
              `This is not a supported scenario but it may work under certain conditions.`,
              `A textarea keyboard navigation may conflict with Autocomplete controls (for example enter and arrow keys).`,
              `Make sure to test keyboard navigation and add custom event handlers if necessary.`,
            ].join("\n"),
          );
        } else {
          console.error(
            [
              `MUI: Unable to find the input element. It was resolved to ${inputRef.current} while an HTMLInputElement was expected.`,
              `Instead, ${componentName} expects an input element.`,
              "",
              componentName === "useAutocomplete"
                ? "Make sure you have bound getInputProps correctly and that the normal ref/effect resolutions order is guaranteed."
                : "Make sure you have customized the input component correctly.",
            ].join("\n"),
          );
        }
      }
    }, [componentName]);
  }

  React.useEffect(() => {
    syncHighlightedIndex();

  }, [syncHighlightedIndex]);

  const handleOpen = (event) => {
    if(readOnly || disabledProp){
      //console.log(componentName, " readOnly or disabled.", {readOnly, disabled:disabledProp})
      return;
    }
    if (open) {
      setInputPristine(true);
      return;
    }

    setOpenState(true);
    setInputPristine(true);

    if (onOpen) {
      onOpen(event);
    }
  };

  const handleClose = (event, reason, outside) => {
    if (!open) {
      return;
    }
    popupOutside.current = !!outside;

    if (outside) {
      handleBlurDone(event, false);
    }

    setOpenState(false);

    if (onClose) {
      onClose(reason, event);
    }
    //console.log(componentName, ":handleClose: reason:", reason);
  };

  const handleValue = (event, newValue, reason, details) => {
    if (disabledProp || readOnly) {
      event && event.preventDefault();
      return;
    }

    if (multiple) {
      if (
        value.length === newValue.length &&
        value.every((val, i) => val === newValue[i])
      ) {
        return;
      }
    } else if (value === newValue) {
      return;
    }

    if (onChange) {
      onChange(newValue, reason, event, details);
    }

    setValueState(newValue);
  };

  const isTouch = React.useRef(false);

  const selectNewValue = (
    event,
    option,
    reasonProp = "selectOption",
    origin = "options",
  ) => {
    if (disabledProp || readOnly) {
      event && event.preventDefault();
      if (popupOpen) {
        handleClose(event, "escape");
      }
      return;
    }

    let reason = reasonProp;
    let newValue = option;

    if (multiple) {
      newValue = Array.isArray(value) ? value.slice() : [];

      if (process.env.NODE_ENV !== "production") {
        const matches = newValue.filter((val) => optionEquals(option, val));

        if (matches.length > 1) {
          console.error(
            [
              `MUX: The \`optionEquals\` method of ${componentName} does not handle the arguments correctly.`,
              `The component expects a single value to match a given option but found ${matches.length} matches.`,
            ].join("\n"),
          );
        }
      }

      const itemIndex = newValue.findIndex((valueItem) =>
        optionEquals(option, valueItem),
      );

      if (itemIndex === -1) {
        newValue.push(option);
      } else if (origin !== "freeSolo") {
        newValue.splice(itemIndex, 1);
        reason = "removeOption";
      }
    }

    //console.log("scrollTop ssss:", listboxRef?.current?.scrollTop);
    resetInputValue(event, newValue, reason);

    handleValue(event, newValue, reason, { option });
    if (
      !disableCloseOnSelect &&
      (!event || (!event.ctrlKey && !event.metaKey))
    ) {
      handleClose(event, reason, renderOutside && popupOpen);
      
    }

    if (
      blurOnSelect === true ||
      (blurOnSelect === "touch" && isTouch.current) ||
      (blurOnSelect === "mouse" && !isTouch.current)
    ) {
      if (inputRef.current) inputRef.current.blur();
    }
    //console.log("scrollTop yyyy:", listboxRef?.current?.scrollTop);
  };

  function validTagIndex(index, direction) {
    if (index === -1) {
      return -1;
    }

    let nextFocus = index;

    while (true) {
      // Out of range
      if (
        (direction === "next" && nextFocus === value.length) ||
        (direction === "previous" && nextFocus === -1)
      ) {
        return -1;
      }

      const option = anchorEl.querySelector(`[data-tag-index="${nextFocus}"]`);

      // Same logic as MenuList.js
      if (
        !option ||
        !option.hasAttribute("tabindex") ||
        option.disabled ||
        option.getAttribute("aria-disabled") === "true"
      ) {
        nextFocus += direction === "next" ? 1 : -1;
      } else {
        return nextFocus;
      }
    }
  }

  const handleFocusTag = (event, direction) => {
    if (!multiple) {
      return;
    }

    if (inputValue === "") {
      handleClose(event, "toggleInput");
    }

    let nextTag = focusedTag;

    if (focusedTag === -1) {
      if (inputValue === "" && direction === "previous") {
        nextTag = value.length - 1;
      }
    } else {
      nextTag += direction === "next" ? 1 : -1;

      if (nextTag < 0) {
        nextTag = 0;
      }

      if (nextTag === value.length) {
        nextTag = -1;
      }
    }

    nextTag = validTagIndex(nextTag, direction);

    setFocusedTag(nextTag);
    focusTag(nextTag);
  };

  const handleClear = (event, outside) => {
    setInputValueState("");
    popupOutside.current = !!outside;
    ignoreFocus.current = true;
    if (onInputChange) {
      onInputChange("", "clear", event);
    }

    handleValue(event, multiple ? [] : null, "clear");
  };

  const handleKeyDown = (other) => (event) => {
    if (other.onKeyDown) {
      other.onKeyDown(event);
    }

    if (event.defaultMuiPrevented) {
      return;
    }

    if (
      focusedTag !== -1 &&
      ["ArrowLeft", "ArrowRight"].indexOf(event.key) === -1
    ) {
      setFocusedTag(-1);
      focusTag(-1);
    }

    //console.log("handleKeyDown:", event.key);

    // Wait until IME is settled.
    if (event.which !== 229) {
      switch (event.key) {
        case "Home":
          if (popupOpen && handleHomeEndKeys) {
            // Prevent scroll of the page
            event.preventDefault();
            changeHighlightedIndex({
              diff: "start",
              direction: "next",
              reason: "keyboard",
              event,
            });
          }
          break;
        case "End":
          if (popupOpen && handleHomeEndKeys) {
            // Prevent scroll of the page
            event.preventDefault();
            changeHighlightedIndex({
              diff: "end",
              direction: "previous",
              reason: "keyboard",
              event,
            });
          }
          break;
        case "PageUp":
          // Prevent scroll of the page
          event.preventDefault();
          changeHighlightedIndex({
            diff: -pageSize,
            direction: "previous",
            reason: "keyboard",
            event,
          });
          handleOpen(event);
          break;
        case "PageDown":
          // Prevent scroll of the page
          event.preventDefault();

          changeHighlightedIndex({
            diff: pageSize,
            direction: "next",
            reason: "keyboard",
            event,
          });
          handleOpen(event);
          break;
        case "ArrowDown":
          // Prevent cursor move
          event.preventDefault();

          changeHighlightedIndex({
            diff: 1,
            direction: "next",
            reason: "keyboard",
            event,
          });
          handleOpen(event);
          break;
        case "ArrowUp":
          // Prevent cursor move
          event.preventDefault();

          changeHighlightedIndex({
            diff: -1,
            direction: "previous",
            reason: "keyboard",
            event,
          });
          handleOpen(event);
          break;
        case "ArrowLeft":
          handleFocusTag(event, "previous");
          break;
        case "ArrowRight":
          handleFocusTag(event, "next");
          break;
        case "Enter":
          if (disabledProp || readOnly) {
            event.preventDefault();
            handleClose(event, "escape");
            return;
          }
          if (!popupOpen && inputValue === "" && !required) {
            handleValue(event, multiple ? [] : null, "clear");
          } else if (highlightedIndexRef.current !== -1 && popupOpen) {
            const option = filteredOptions[highlightedIndexRef.current];
            const disabled = getOptionDisabled
              ? getOptionDisabled(option)
              : false;

            // Avoid early form validation, let the end-users continue filling the form.
            event.preventDefault();

            if (disabled) {
              return;
            }

            selectNewValue(event, option, "selectOption");

            // Move the selection to the end.
            if (autoComplete && inputRef.current.setSelectionRange) {
              inputRef.current.setSelectionRange(
                inputRef.current.value.length,
                inputRef.current.value.length,
              );
            }
          } else if (
            freeSolo &&
            inputValue !== "" &&
            inputValueIsSelectedValue === false
          ) {
            if (multiple) {
              // Allow people to add new values before they submit the form.
              event.preventDefault();
            }
            if (allowCreateOption) {
              selectNewValue(event, inputValue, "createOption", "freeSolo");
            }
          }
          break;
        case "Escape":
          if (popupOpen) {
            // Avoid Opera to exit fullscreen mode.
            event.preventDefault();
            // Avoid the Modal to handle the event.
            event.stopPropagation();
            handleClose(event, "escape");
          } else if (
            clearOnEscape &&
            (inputValue !== "" || (multiple && value.length > 0))
          ) {
            // Avoid Opera to exit fullscreen mode.
            event.preventDefault();
            // Avoid the Modal to handle the event.
            event.stopPropagation();

            handleClear(event);
          }
          break;
        case "Backspace":
          if (disabledProp || readOnly) {
            event.preventDefault();
            popupOpen && handleClose(event, "escape");
            return;
          }
          if (!multiple && inputValue === "" && !required) {
            handleValue(event, null, "clear");
          }
          // Remove the value on the left of the "cursor"
          if (multiple && inputValue === "" && value.length > 0) {
            const index = focusedTag === -1 ? value.length - 1 : focusedTag;
            const newValue = value.slice();
            newValue.splice(index, 1);
            handleValue(event, newValue, "removeOption", {
              option: value[index],
            });
          }
          break;
        case "Delete":
          if (disabledProp || readOnly) {
            event.preventDefault();
            popupOpen && handleClose(event, "escape");
            return;
          }
          // Remove the value on the right of the "cursor"
          if (
            multiple &&
            inputValue === "" &&
            value.length > 0 &&
            focusedTag !== -1
          ) {
            const index = focusedTag;
            const newValue = value.slice();
            newValue.splice(index, 1);
            handleValue(event, newValue, "removeOption", {
              option: value[index],
            });
          }
          break;
        default:
      }
    }
  };

  const handleFocusInside = (event) => {
    handleFocus(event, true);
  };

  const handleFocus = (event, inside) => {
    setFocused(true);
    popupOutside.current = !inside;
    if (inside) {
      if (openOnFocus && !ignoreFocus.current) {
        //console.log("handleFocus handleOpen");
        handleOpen(event);
      }
    }
  };

  const handleBlurInside = (event) => {
    handleBlur(event, true);
  };

  const handleBlur = (event, inside) => {
    // Ignore the event when using the scrollbar with IE11
    if (
      popupOpen &&
      ((!inside && renderOutside) ||
        unstable_isActiveElementInListbox(listboxRef))
    ) {
      inputRef.current.focus();
      //console.log("AutoSelect force refocus");
      return;
    }
    handleBlurDone(event, inside);
    handleClose(event, "blur", !inside);
  }
  
  const handleBlurDone = (event, inside) => {
    setFocused(false);
    firstFocus.current = true;
    ignoreFocus.current = false;

    if (autoSelect && highlightedIndexRef.current !== -1 && popupOpen) {
      selectNewValue(
        event,
        filteredOptions[highlightedIndexRef.current],
        "blur",
      );
    } else if (autoSelect && freeSolo && inputValue !== "") {
      selectNewValue(event, inputValue, "blur", "freeSolo");
    } else if (clearOnBlur || !inside) {
      resetInputValue(event, value, "blur", !inside ? "outside": undefined);
    }
    
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value;

    if (inputValue !== newValue) {
      setInputValueState(newValue);
      setInputPristine(false);

      if (onInputChange) {
        onInputChange(newValue, "input", event);
      }
    }

    if (newValue === "") {
      if (!disableClearable && !multiple) {
        handleValue(event, null, "clear");
      }
    } else {
      handleOpen(event);
    }
  };

  const handleOptionMouseMove = (event) => {
    const index = Number(event.currentTarget.getAttribute("data-option-index"));
    if (highlightedIndexRef.current !== index) {
      setHighlightedIndex({
        event,
        index,
        reason: "mouse",
      });
    }
  };

  const handleOptionTouchStart = (event) => {
    setHighlightedIndex({
      event,
      index: Number(event.currentTarget.getAttribute("data-option-index")),
      reason: "touch",
    });
    isTouch.current = true;
  };

  const handleOptionClick = (event, option) => {
    if (readOnly || disabledProp) {
      return;
    }
    const index = Number(event.currentTarget.getAttribute("data-option-index"));
    selectNewValue(event, option || filteredOptions[index], "selectOption");

    isTouch.current = false;
  };

  const handleTagDelete = (index) => (event) => {
    if (readOnly || disabledProp) {
      return;
    }
    const newValue = value.slice();
    newValue.splice(index, 1);
    handleValue(event, newValue, "removeOption", {
      option: value[index],
    });
  };

  const handlePopupIndicator = (event) => {
    if (popupOpen) {
      handleClose(event, "toggleInput");
    } else {
      handleOpen(event);
    }
  };

  // Prevent input blur when interacting with the combobox
  const handleMouseDown = (event) => {
    // Prevent focusing the input if click is anywhere outside the Autocomplete
    if (!event.currentTarget.contains(event.target)) {
      return;
    }
    if(multiple && focusedTag !== -1) {
      setFocusedTag(-1);
      focusTag(-1);
    }
    if (event.target.getAttribute("id") !== id) {
      event.preventDefault();
    }
  };

  // Focus the input when interacting with the combobox
  const handleClick = (event) => {
    // Prevent focusing the input if click is anywhere outside the Autocomplete
    if (!event.currentTarget.contains(event.target) || !inputRef.current) {
      return;
    }

    inputRef.current.focus();

    if (
      selectOnFocus &&
      firstFocus.current &&
      inputRef.current.selectionEnd - inputRef.current.selectionStart === 0
    ) {
      inputRef.current.select();
    }

    firstFocus.current = false;
  };

  const handleInputMouseDown = (event) => {
    if (!disabledProp && !readOnly && (inputValue === "" || !popupOpen)) {
      handlePopupIndicator(event);
    }
  };
  
  let dirty = freeSolo && inputValue.length > 0;
  let outsideDirty = popupOutside.current ? inputValue.length > 0 : false;
  dirty = dirty || (multiple ? value.length > 0 : value !== null);

  let groupedOptions = filteredOptions;
  if (groupBy) {
    // used to keep track of key and indexes in the result array
    const indexBy = new Map();
    let warn = false;

    groupedOptions = filteredOptions.reduce((acc, option, index) => {
      const group = groupBy(option);

      if (acc.length > 0 && acc[acc.length - 1].group === group) {
        acc[acc.length - 1].options.push(option);
      } else {
        if (process.env.NODE_ENV !== "production") {
          if (indexBy.get(group) && !warn) {
            console.warn(
              `MUI: The options provided combined with the \`groupBy\` method of ${componentName} returns duplicated headers.`,
              "You can solve the issue by sorting the options with the output of `groupBy`.",
            );
            warn = true;
          }
          indexBy.set(group, true);
        }

        acc.push({
          key: index,
          index,
          group,
          options: [option],
        });
      }

      return acc;
    }, []);
  }

  if (disabledProp && focused) {
    handleBlur();
  }

  return {
    getRootProps: (other = {}) => ({
      "aria-owns": listboxAvailable ? `${id}-listbox` : null,
      ...other,
      onKeyDown: handleKeyDown(other),
      onMouseDown: handleMouseDown,
      onClick: handleClick,
    }),
    getInputLabelProps: () => ({
      id: `${id}-label`,
      htmlFor: id,
    }),
    getInputProps: (outside) => ({
      id,
      value: outside ? "" : inputValue,
      onBlur: outside ? handleBlur : handleBlurInside,
      onFocus: outside ? handleFocus : handleFocusInside,
      onChange: handleInputChange,
      onMouseDown: outside ? undefined : handleInputMouseDown,
      // if open then this is handled imperatively so don't let react override
      // only have an opinion about this when closed
      "aria-activedescendant": popupOpen ? "" : null,
      "aria-autocomplete": autoComplete ? "both" : "list",
      "aria-controls": listboxAvailable ? `${id}-listbox` : undefined,
      "aria-expanded": listboxAvailable,
      // Disable browser's suggestion that might overlap with the popup.
      // Handle autocomplete but not autofill.
      autoComplete: "off",
      ref: inputRef,
      autoCapitalize: "none",
      spellCheck: "false",
      role: "combobox",
      type: "text",
      disabled: disabledProp,
      readOnly: readOnly || !allowFilter,
    }),
    getClearProps: (outside) => ({
      tabIndex: -1,
      type: "button",
      onClick: (event) => handleClear(event, outside),
    }),
    getPopupIndicatorProps: () => ({
      tabIndex: -1,
      type: "button",
      "area-haspopup": "true",
      "area-expanded": `${open}`,
      onClick: handlePopupIndicator,
    }),
    getTagProps: (index) => ({
      key: index,
      "data-tag-index": index,
      tabIndex: -1,
      ...(!readOnly && { onClose: handleTagDelete(index) }),
    }),
    getListboxProps: () => ({
      role: "listbox",
      id: `${id}-listbox`,
      "aria-labelledby": `${id}-label`,
      ref: handleListboxRef,
      tabIndex: -1,
      onMouseDown: (event) => {
        // Prevent blur
        event.preventDefault();
        inputRef?.current?.focus();
      },
      //onKeyDown: handleKeyDown({}),
    }),
    getOptionProps: (option, index) => {
      const selected = (multiple ? value : [value]).some(
        (value2) => value2 != null && optionEquals(option, value2),
      );
      const disabled = getOptionDisabled ? getOptionDisabled(option) : false;

      return {
        key: getOptionKey?.(option) ?? getOptionLabel(option),
        tabIndex: -1,
        role: "option",
        id: `${id}-option-${index}`,
        onMouseMove: !disabled ? handleOptionMouseMove : undefined,
        onClick: !disabled
          ? (event) => handleOptionClick(event, option)
          : undefined,
        onTouchStart: !disabled ? handleOptionTouchStart : undefined,
        "data-option-index": index,
        "aria-disabled": disabled,
        "aria-selected": selected,
      };
    },
    id,
    inputValue,
    value,
    dirty,
    outsideDirty,
    expanded: popupOpen && anchorEl,
    popupOpen: popupOpen,
    focused: focused || focusedTag !== -1,
    anchorEl,
    setAnchorEl,
    focusedTag,
    groupedOptions,
    handleClose,
    handleOpen,
  };
}

export default useAutocomplete;
