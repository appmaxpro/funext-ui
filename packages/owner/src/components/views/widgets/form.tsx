import { cn } from "@funext/ui";
import * as React from "react";
import type Rt from "react";
import {
  EMPTY_ARRAY,
  EMPTY_OBJECT,
  EMPTY_RECORD,
  i18n,
  isField,
  type FieldBlock,
  type WidgetBlock,
} from "~/utils";
import {
  getEmptyWidgetState,
  useFormContext,
  type IFieldState,
  type IWidgetState,
} from "../form";
import { WidgetStateContext } from "~/context";

export type Slot = React.ElementType | React.ComponentType;

export const useFieldState = () => {
  const widget = React.useContext(WidgetStateContext) ?? getEmptyWidgetState();
  const state = React.useSyncExternalStore(widget.subscribe, widget.snapshot);

  return { state, widget };
};

export function WidgetStateProvider({
  children,
  widget,
}: {
  children: React.ReactNode;
  widget: WidgetBlock;
}) {
  return React.useMemo(
    () =>
      isField(widget.schema) ||
      widget.hideIf ||
      widget.readonlyIf ||
      widget.onClick
        ? React.createElement(ActiveProvider, { widget, children })
        : React.createElement(WidgetStateContext.Provider, {
            value: getEmptyWidgetState(),
            children,
          }),
    EMPTY_ARRAY,
  );
}
function ActiveProvider({
  children,
  widget,
}: {
  children: React.ReactNode;
  widget: WidgetBlock;
}) {
  const context = useFormContext();

  const state = React.useMemo<IWidgetState>(
    () => context.register(widget),
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

const FormField = ({
  field,
  children,
}: {
  field: FieldBlock;
  children: React.ReactNode;
}) => {
  return <WidgetStateProvider widget={field}>{children}</WidgetStateProvider>;
};

const useFormField = () => {
  //const stateContext = React.useContext(WidgetStateContext)
  const { state, widget } = useFieldState();

  if (!widget.name) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { uid: id } = state;

  return {
    id,
    name: widget.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    state,
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
  const { state, formItemId } = useFormField();

  return (
    <Slot
      ref={ref}
      className={cn(state.error && "text-error", className)}
      htmlFor={formItemId}
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
        !!state.error
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

function Form({ children, ref }: React.ComponentPropsWithRef<'form'>) {
  const form = useFormContext();
  const readonly = form.state.readonly
  
  return <form ref={ref}>
    {children}
  </form>

}

export {
  useFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  Form
};
