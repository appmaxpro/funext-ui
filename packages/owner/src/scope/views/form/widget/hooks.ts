import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getWidgetStateForm,
  type BasicWidgetState,
  type IFieldState,
  type IWidgetState,
} from "~/scope";
import { EMPTY_ARRAY, EMPTY_OBJECT, type Schema } from "~/utils";
import { dialogs } from "~/hooks/use-dialogs";
import { useScheduleLayoutEffect } from "~/hooks/use-schedule-layout-effect";
import { isEqual } from "lodash";

export function useReadonly(widget: BasicWidgetState, checkRoot = false) {
  const readonlyAtom = useMemo(() => {
    return () => {
      let state = widget.state;

      if (state.readonly || state.disabled) return true;
      let parent = widget.parent;
      while (parent) {
        let state = parent.state;
        if (!checkRoot || state.readonly || state.disabled) return true;

        parent = parent.parent;
      }
      return false;
    };
  }, [checkRoot, widget, widget.state]);

  return readonlyAtom;
}

export function useClick(widget: IWidgetState) {
  const block = widget.block;
  const schema = block.schema;

  const props = widget.state.props ?? {};

  const form = getWidgetStateForm(widget)!;

  const [wait, setWait] = useState(false);

  const readonly = useReadonly(widget)() || form.state.readonly;
  const disabled = wait || readonly;

  const onClick = useCallback(async (e: Event) => {
    const { prompt, link, action } = props;
    const { onClick } = block;

    if (prompt) {
      const confirmed = await dialogs.confirm(prompt, {
        severity: "warning",
      });

      if (!confirmed) return;
    }
    if (link) {
      return link && window.open(link, "_self", "noopener,noreferrer");
    }
    try {
      e.preventDefault();
      setWait(true);
      // With main form, need to commit any editable widgets before the action.
      if (!form.parentForm) {
        await form.commit();
      }

      await form.executer.waitFor();
      if (onClick) {
        return await form.executer.runNow(
          async () => await onClick(widget.context),
        );
      }
      if (typeof action !== "string") {
        return;
      }
      await form.executer.execute(action, {
        context: {
          _source: schema.name,
          _signal: schema.name,
        },
      });
    } finally {
      setWait(false);
    }
  }, EMPTY_ARRAY);

  return { disabled, onClick };
}

export function useSingleClickHandler(
  handler: (e?: React.MouseEvent<HTMLButtonElement>) => void,
) {
  const clicking = useRef(false);

  return useCallback(
    async (e?: React.MouseEvent<HTMLButtonElement>) => {
      if (e?.detail === 2 || clicking.current) return;

      clicking.current = true;
      try {
        await handler(e);
      } finally {
        clicking.current = false;
      }
    },
    [handler],
  );
}

const defaultFormatter = <T>(value?: T | null) =>
  value === null || value === undefined ? "" : String(value);

const defaultConverter = <T>(text: string) => (text ? (text as T) : null);

const defaultValidator = () => true;

/**
 * This hook can be used with input fields to handle value updates.
 *
 * @param field the field value atom
 * @param options additional options
 */
export function useInput<T>(
  field: IFieldState,
  options?: {
    /**
     * The default value to use when the atom value is null or undefined.
     */
    defaultValue?: T | null;

    /**
     * When to fire the onChange event.
     */
    triggerOn?: "blur" | "change";

    /**
     * Validate the input text.
     *
     * Only validated input text will be propagated to valueAtom.
     *
     * @param text the input text to validate
     * @returns true if valid false otherwise
     */
    validate?: (text: string) => boolean;

    /**
     * Format the value to string.
     */
    format?: (value?: T | null) => string;

    /**
     * Convert the input text to target value.
     */
    parse?: (text: string) => T | null;

  },
) {
  const fSchema = field.block.schema;
  const {
    defaultValue,
    triggerOn = "blur",
    validate = defaultValidator,
    format = defaultFormatter,
    parse = defaultConverter,
  } = options ?? {};

  //const [value = defaultValue] = field;
  const value = field.value ?? defaultValue;
  const valueText = useMemo(() => format(value) ?? "", [format, value]);
  const [changed, setChanged] = useState(false);
  const [text, setText] = useState(valueText);

  const dirtyRef = useRef<boolean | undefined>();

  const setValue = useCallback(
    (value: any, fireOnChange: boolean, makeDirty?: boolean) => {
      field.set(value, fireOnChange, makeDirty);
    },
    [],
  );
  const update = useCallback(
    (text: string, fireOnChange: boolean, makeDirty: boolean=true) => {
      if (validate(text)) {
        field.set(parse(text), fireOnChange, makeDirty);
      }
    },
    [parse, validate],
  );

  const onChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    (event) => {
      setChanged(event.target.value !== valueText);
      setText(event.target.value);
      if (triggerOn === "change") {
        update(event.target.value, true);
      }
    },
    [triggerOn, update, valueText],
  );

  const onFocus = useCallback<
    React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >((event) => {
    //field.setState("touched", true);
    field.setState("focused", true);
  }, []);

  const onBlur = useCallback<
    React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    (event) => {
      dirtyRef.current = undefined;
      setChanged((changed) => {
        if (changed) {
          if (triggerOn === "blur") {
            update(event.target.value, true);
          }
          return false;
        }
        return changed;
      });
      field.setState("focused", false);
    },
    [changed, triggerOn, update],
  );

  const onKeyDown = useCallback<
    React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    (event) => {
      if (event.key === "Enter") {
        setChanged((changed) => {
          if (changed) {
            update(text, true);
            return false;
          }
          return changed;
        });
      }
    },
    [changed, text, update],
  );

  useEffect(() => {
    setText(() => format(value) ?? "");
  }, [format, value]);

  return {
    text,
    setText,
    value,
    setValue,
    setChanged,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
  } as const;
}


export function useSimpleInput<T>(
  field: IFieldState,
  options?: {
    /**
     * When to fire the onChange event.
     */
    triggerOn?: "blur" | "change";
    onChange?: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => any;

}) {
  const fSchema = field.block.schema;
  const {
    triggerOn = "blur",
    onChange: onChangeHandler
  } = options ?? {};

  //const [value = defaultValue] = field;
  const value = field.value;

  const [changed, setChanged] = useState(false);
  const valueRef = useRef<any>(value);

  const dirtyRef = useRef<boolean | undefined>();


  const setValue = useCallback(
    (value: any, fireOnChange: boolean, makeDirty?: boolean) => {
      field.set(value, fireOnChange, makeDirty);
    },
    [],
  );

  const update = useCallback(
    (value: any, makeDirty?: boolean) => {
      dirtyRef.current = makeDirty != null ? makeDirty : !isEqual(valueRef.current, value)
      valueRef.current = value;
    },
    EMPTY_ARRAY,
  );
  
  const testChange = useCallback(()=> {
    if(isEqual(valueRef.current, value)) {
      setValue(valueRef.current, triggerOn === "change", triggerOn === "change")
    }
     
  }, [value]);


  const onChange = useCallback<
    React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    (event) => {
      if(onChangeHandler) {
        const val = onChangeHandler(event);
        if(val !== undefined)
          valueRef.current = val;
      } else {
        try{
          setValue(event.target.value, false, true)
        } catch(e) {
          console.error(e)
        }
      }
    },
    EMPTY_ARRAY,
  );

  const onFocus = useCallback<
    React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >((event) => {
    field.setState("focused", true);
  }, []);

  const onBlur = useCallback<
    React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    (event) => {
      field.setState("focused", false);
      if(dirtyRef.current) {
        setValue(valueRef.current, triggerOn === "blur", true);
      }
      dirtyRef.current = undefined;
    },
    [changed, triggerOn],
  );

  const onKeyDown = useCallback<
    React.KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement>
  >(
    (event) => {
      if (event.key === "Enter") {
        if(dirtyRef.current) {
          setValue(valueRef.current, true, true);
        }
        dirtyRef.current = undefined;
      }
    },
    EMPTY_ARRAY,
  );

  return {
    value,
    setValue,
    setChanged,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
  } as const;
}