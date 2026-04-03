import {
  EMPTY_ARRAY,
  i18n,
  type DataContext,
  type DataRecord,
  type FieldErrors,
} from "~/utils";
import type { IFormContext, IWidgetState, Ref } from "../../types";
import { useCallback, useMemo, useRef, type RefObject } from "react";
import { DefaultActionHandler, type Schedule } from "../../action";
import { useFormContext } from "~/context";

export const getErrorsAsString = (errors: FieldErrors[]) => {
  const titles = new Set(
    Object.values(errors).flatMap((e) =>
      Object.values(e)
        .filter(Boolean)
        .flatMap((v) => (typeof v === "object" ? Object.values(v) : v)),
    ),
  )
    .entries()
    .toArray();
  /*
  titles.length &&
    alerts.error({
      message: (
        <ul>
          {titles.map((title, i) => (
            <li key={i}>{title}</li>
          ))}
        </ul>
      ),
    });*/
};

export const getFieldErrors = (formState: IFormContext, fieldName?: string) => {
  const { states, fields } = formState;

  const isHidden = function isHidden(s: IWidgetState): boolean {
    return Boolean(
      s.state.hidden ||
        (s.name && fields.get(s.name)?.state?.hidden) ||
        (s.parent && isHidden(s.parent as IWidgetState)),
    );
  };

  const serverErrors = fields
    .values()
    .filter((k) => k.state.error?.error)
    .filter((v) => states.values().some((w) => w.name === v.name))
    .map((o) => states.values().find((w) => w.name === o.name))
    .filter((s) => !isHidden(s!))
    .map((w) => {
      const error = i18n.get(
        `{0} is invalid`,
        w?.block?.schema?.title || w?.name,
      );
      return { error } as FieldErrors;
    })
    .toArray();

  const errors = fields
    .values()
    .filter((s) => fieldName === undefined || s.name === fieldName)
    .filter((s) => !isHidden(s))
    .filter(
      (s) =>
        Object.keys(s.state.error ?? {}).length > 0 && s.state.valid !== true,
    )
    .map((s) => s.state.error?.error)
    .filter(Boolean)
    .toArray()
    .concat(serverErrors as string[]);

  return errors.length ? errors : null;
};

export const getFormErrors = async (formState: IFormContext) => {
  const errors = getFieldErrors(formState);
  if (errors) {
    return errors;
  }
  await formState.validate();
  return getFieldErrors(formState);
};

export const doValidate = async (formState: IFormContext) => {
  const errors = await getFormErrors(formState);
  if (errors) {
    //showErrors(errors);
    return Promise.reject();
  }
};

export const useHandleFocus = (
  containerRef: RefObject<HTMLDivElement | null>,
) => {
  const handleFocus = useCallback(() => {
    const elem = containerRef.current;
    if (elem) {
      const selector = ["input", "select", "textarea"]
        .map(
          (name) =>
            `${name}[data-input]:not([readonly]), [data-input] ${name}:not([readonly]), ${name}[tabindex]:not([readonly])`,
        )
        .join(", ");
      const input = elem.querySelector(selector) as HTMLInputElement;
      focusAndSelectInput(input);
    }
  }, [containerRef]);
  return handleFocus;
};

export const focusAndSelectInput = (input?: null | HTMLInputElement) => {
  if (input) {
    input.focus();
    input.select();
  }
};

type ActionOptions = {
  refresh?: () => void;
  submit: () => Promise<any>;
  validate?: () => Promise<any>;
  readonly schedule: Schedule;
  readonly context: DataContext;
  readonly formContext: IFormContext;
};

class FromActionHandler extends DefaultActionHandler {
  _opt: Ref<ActionOptions>;

  constructor(options: Ref<ActionOptions>) {
    super();
    this._opt = options;
  }

  get options() {
    return this._opt.current;
  }

  async setValues(values: DataRecord) {
    return this.options!.formContext.reset(values);
  }

  get context() {
    return this.options!.context;
  }

  schedule(id: string | number, cb: () => void) {
    this.options!.schedule(id, cb);
  }

  async save(record?: DataRecord): Promise<void> {
    return await this.options!.submit();
  }

  async edit(record?: DataRecord | null) {}

  async validate() {
    return await this.options!.validate?.();
  }

  async refresh(target?: string) {
    return await this.options!.refresh?.();
  }

  async close() {}
}

export function useActionHandler(options: Ref<ActionOptions>) {
  return useMemo(() => new FromActionHandler(options), EMPTY_ARRAY);
}

function useFormHandler() {}
