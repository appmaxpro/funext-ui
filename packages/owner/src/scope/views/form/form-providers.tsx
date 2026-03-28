import {
  forwardRef,
  type ReactNode,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";

import { EMPTY_ARRAY, type DataRecord } from "~/utils";
/*
export const FormWidgetProviders = forwardRef<
  FormWidgetsHandler,
  { children: ReactNode; record?: DataRecord }
>(function FormWidgetProviders({ children, record }, ref) {
  const refs = useRef({
    widgets: new Set<IValidator>(),
    editableWidgets: new Set<() => void>(),
  });

  const handleAddWidgetValidator = useCallback((fn: IValidator) => {
    const widgets = refs.current.widgets;
    widgets.add(fn);
    return () => widgets.delete(fn);
  }, EMPTY_ARRAY);

  const handleAddEditableWidget = useCallback((fn: () => void) => {
    const editableWidgets = refs.current.editableWidgets;
    editableWidgets.add(fn);
    return () => editableWidgets.delete(fn);
  }, EMPTY_ARRAY);

  const handleCommitEditableWidgets = useCallback(() => {
    const editableWidgets = refs.current.editableWidgets;
    return Promise.all(Array.from(editableWidgets).map((fn) => fn()));
  }, EMPTY_ARRAY);

  const handleValidate = useCallback(() => {
    const widgets = refs.current.widgets;
    return Array.from(widgets).some((checkWidgetInvalid) =>
      checkWidgetInvalid(),
    );
  }, EMPTY_ARRAY);

  useImperativeHandle(
    ref,
    () => ({
      validate: handleValidate,
      commit: handleCommitEditableWidgets,
    }),
    [handleValidate, handleCommitEditableWidgets],
  );

  return (
    <EditableFormContext.Provider
      value={useMemo(
        () => ({
          id: record?.id,
          add: handleAddEditableWidget,
          addValidator: handleAddWidgetValidator,
          commit: handleCommitEditableWidgets,
        }),
        [
          record?.id,
          handleAddEditableWidget,
          handleCommitEditableWidgets,
          handleAddWidgetValidator,
        ],
      )}
    >
      {children}
    </EditableFormContext.Provider>
  );
});
*/