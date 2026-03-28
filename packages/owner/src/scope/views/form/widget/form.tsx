import * as React from "react";
import { EMPTY_ARRAY } from "~/utils";
import { useFormSate } from "../form";
import { useFormContext } from "~/context";
import { useSingleClickHandler } from "./hooks";
import { composeRefs } from "~/utils/compose-ref";
import { getFieldErrors, useAfterActions } from "../form-handler";
import type { SxComponentProps } from "@funext/ui/src";
import type { IFormContext } from "~/scope";

interface FormProps extends SxComponentProps {
  form: IFormContext;
}

export function Root({ children, ref, form }: FormProps) {
  const state = React.useSyncExternalStore(form.subscribe, form.snapshot);
  const readonly = state.readonly;

  return React.useMemo(
    () =>
      form.parentForm ? (
        <SubForm ref={ref} form={form}>
          {children}
        </SubForm>
      ) : readonly ? (
        <RootPanel ref={ref} form={form}>
          {children}
        </RootPanel>
      ) : (
        <RootForm ref={ref as any} form={form}>
          {children}
        </RootForm>
      ),
    [readonly, ref],
  );
}



export function RootForm({ children, ref, form }: FormProps) {
  const onSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      e.stopPropagation();
      //e.currentTarget.checkValidity()
      await form.commit();
      if (e.currentTarget.checkValidity()) {
        await form.submit();
      }
    },
    [form],
  );
  return (
    <form ref={ref} onSubmit={onSubmit}>
      <SubForm form={form}>{children}</SubForm>
    </form>
  );
}

function SubForm({ children, form, ref }: FormProps) {
  /*
    const handleOnSaveErrors = useCallback(
      async function onError(
        error: ErrorReport,
      ): Promise<DataRecord> {
        const { entityId, entityName, title, message } = error;
        if (entityId && entityName) {
          const confirmed = await dialogs.confirm({
            title: title!,
            content: (
              <div>
                <p>{message}</p>
                <p>{i18n.get("Would you like to reload the record?")}</p>
              </div>
            ),
          });

          if (confirmed) {
            const {
              record: { id },
            } = get(formAtom);
            if ((id ?? 0) > 0) {
              return { id };
            }
          }
          throw 500;
        }
        throw error;
      },
      [formAtom],
    ),
  );*/

  const doSave = React.useCallback(
    async (options?: {
      shouldSave?: boolean;
      callOnSave?: boolean;
      callOnRead?: boolean;
      callOnLoad?: boolean;
      handleErrors?: boolean;
    }) => {
      const {
        shouldSave = true,
        callOnSave = true,
        callOnRead = true,
        callOnLoad = options?.callOnSave !== false,
        handleErrors = false,
      } = options ?? {};
      const formState = form;

      await getFieldErrors(form);

      /*
        if (onSaveAction && callOnSave) {
          await actionExecutor.execute(onSaveAction);
        }*/

      if (!shouldSave) return formState.record;
      /*
        const [savingRecord, restoreDummyValues] = prepareRecordForSave();
        const opts = handleErrors ? { onError: handleOnSaveErrors } : undefined;
        const { select } = formState;

        let res = await dataStore.save(savingRecord, {
          ...opts,
          select,
        });

        set(formAtom, (state) =>
          restoreSelectedStateWithSavedRecord(state, res),
        );

        if (callOnRead) {
          const fetched = res.id ? await doRead(res.id, select) : res;

          res = restoreDummyValues(res, fetched);

          doEdit(res, {
            callAction: false,
            callOnLoad,
            readonly,
            isNew: savingRecord.id !== res.id,
            keepStates: true,
          });
        }

        return res;
        */
    },
    EMPTY_ARRAY,
  );

  const onSave: typeof doSave = useAfterActions(
    React.useCallback(
      async (options) => {
        // XXX: Need to find a way to coordinate top save and grid commit.
        form.executer.waitFor(300);
        await form.commit();
        return doSave(options);
      },
      [doSave],
    ),
  );

  const handleOnSave = React.useCallback(async () => {
    try {
      await onSave({
        handleErrors: true,
      });
    } catch (error) {
      // default handler will show the errors
    }
  }, [onSave]);

  const handleSave = useSingleClickHandler(
    React.useCallback(
      async (e?: React.SyntheticEvent) => {
        const onSaveClick = e?.type === "click";
        if (!onSaveClick) {
          const input = document.activeElement as HTMLInputElement;
          const elem = containerRef.current;

          if (input && elem?.contains(input)) {
            input.blur?.();
            input.focus?.();
          }

          // fake click to trigger outside click logic of any editable row
          elem?.click?.();
        }
        await form.executer.waitFor();
        return form.executer.wait().then(handleOnSave);
      },
      [form],
    ),
  );

  const containerRef = React.useRef<HTMLDivElement>(null);
  return <div ref={composeRefs(containerRef, ref)}>{children}</div>;
}

function RootPanel({ children, form, ref }: FormProps) {
  return (
    <div ref={ref} className="contents">
      {children}
    </div>
  );
}
