import { cn } from "@funext/ui";
import * as React from "react";
import { i18n, type WidgetBlock } from "~/utils";
import { getEmptyWidgetState } from "../form";
import { useFormContext, useWidgetState, WidgetStateContext } from "~/context";
import { Root } from "./form";
import type { IFieldState, IFState, IWidgetState } from "~/scope";

export type Slot = React.ElementType | React.ComponentType;

export function useFormWidgetState<T extends IWidgetState=IWidgetState>() {
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
    console.warn("useFormField has invalid field block:", widget)
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

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
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

export {
  useFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Root,
};
