import { cn } from "~/ui";
import * as React from "react";
import { i18n, type WidgetBlock } from "~/utils";
import { getEmptyWidgetState } from "../form";
import { useFormContext, useWidgetState, WidgetStateContext } from "~/context";
import { Root } from "./form";
import type { IFieldState, IFState, IWidgetState } from "~/scope";
import type { FieldControlProps, FieldProps } from "./types";

export type Slot = React.ElementType | React.ComponentType;

export function useFormWidgetState<T extends IWidgetState = IWidgetState>() {
  const widget = useWidgetState() ?? (getEmptyWidgetState() as T);
  const state = React.useSyncExternalStore(widget.subscribe, widget.snapshot);

  return { widget, state };
}

export function WidgetStateProvider({
  children,
  widget,
}: {
  children: React.ReactNode;
  widget: WidgetBlock;
}) {
  const context = useFormContext();
  const parent = useWidgetState();
  const state = React.useMemo<IWidgetState>(
    () => context.register(widget, parent),
    [context, widget],
  );

  React.useEffect(() => {
    return state.unregister.bind(state);
  }, [state]);

  return (
    <WidgetStateContext.Provider value={state}>
      {children}
    </WidgetStateContext.Provider>
  );
}

const useFormField = () => {
  //const stateContext = React.useContext(WidgetStateContext)
  const { state, widget } = useFormWidgetState();

  if (!widget.name) {
    console.warn("useFormField has invalid field block:", widget);
    throw new Error("useFormField should be used within block with valid name");
  }

  const { uid: id } = state;

  return {
    id,
    name: widget.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    state: state as IFState,
    field: widget as IFieldState,
  };
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      data-ui="FormItem"
      ref={ref}
      className={cn("flex flex-col space-y-2", className)}
      {...props}
    />
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<Slot>,
  React.ComponentPropsWithoutRef<Slot>
>(({ className, Slot = "label", ...props }, ref) => {
  const { state, formItemId, id } = useFormField();

  return (
    <Slot
      data-ui="FormLabel"
      ref={ref}
      className={cn(className, state.error && "text-error")}
      htmlFor={id}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<Slot>,
  React.ComponentPropsWithoutRef<Slot>
>(({ Slot = "div", ...props }, ref) => {
  const { state, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      data-ui="FormControl"
      ref={ref}
      id={formItemId}
      aria-describedby={
        !state.error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!state.error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      data-ui="FormDescription"
      ref={ref}
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { state, formMessageId } = useFormField();
  const body = state.error ? i18n.t(String(state.error)) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      data-ui="FormMessage"
      ref={ref}
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

const FieldControl = React.forwardRef<
  HTMLDivElement,
  FieldControlProps & React.ComponentProps<typeof FormControl>
>(
  (
    { field, state, className, showLabel: showLabelProp, withControl = true, ...props },
    ref,
  ) => {
    const schema = field.block.schema;

    const { noTitle } = schema;
    const showLabel = showLabelProp != null ? showLabelProp : !noTitle;

    return (
      <FormItem className={cn("min-w-[150px] p-1", className)} ref={ref}>
        {showLabel && (
          <FormLabel className="text-base font-normal leading-6">
            {i18n.t(schema.title ?? field.name)}
            {state.required && <span className="text-destructive ms-1">*</span>}
          </FormLabel>
        )}
        {withControl ? <FormControl {...props} /> : props.children}
        <FormMessage />
      </FormItem>
    );
  },
);
FieldControl.displayName = "FieldControl";

export {
  useFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FieldControl,
  Root,
};
