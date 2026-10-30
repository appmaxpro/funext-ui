"use client";
import invariant from "invariant";
import * as React from "react";
import { i18n } from "~/utils/i18n";
import {
  DialogsContext,
  type AlertOptions,
  type ConfirmOptions,
  type DialogHook,
  type DialogProps,
  type OpenAlertDialog,
  type OpenConfirmDialog,
  type OpenPromptDialog,
  type PromptOptions,
} from "../context/dialog";
import { Button, Dialog, Input, Spinner, Text as DialogContentText } from "~/ui";

function useDialogLoadingButton(onClose: () => Promise<void>) {
  const [loading, setLoading] = React.useState(false);
  const handleClick = async () => {
    try {
      setLoading(true);
      await onClose();
    } finally {
      setLoading(false);
    }
  };
  return {
    onClick: handleClick,
    loading,
  };
}

export interface AlertDialogPayload extends AlertOptions {
  msg: React.ReactNode;
}

export interface AlertDialogProps
  extends DialogProps<AlertDialogPayload, void> {}

export function AlertDialog({ open, payload, onClose }: AlertDialogProps) {
  //const appWindowContext = React.useContext(WindowContext);
  const t = i18n.get;
  const { onClick, loading } = useDialogLoadingButton(() => onClose());
  return (
    <Dialog
      size="xs"
      //fullWidth
      open={open}
      onClose={() => onClose()}
      //container={appWindowContext?.document.body}
    >
      {payload.title !== false && <Dialog.Header>{payload.title ?? t("alert")}</Dialog.Header>}
      <Dialog.Content className="py-0">{payload.msg}</Dialog.Content>
      <Dialog.Footer>
        <Button
          disabled={!open || loading}
          onClick={onClick}
          startIcon={loading ? <Spinner /> : undefined}
        >
          {payload.okText ?? t("ok")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export interface ConfirmDialogPayload extends ConfirmOptions {
  msg: React.ReactNode;
}

export interface ConfirmDialogProps
  extends DialogProps<ConfirmDialogPayload, boolean> {}

export function ConfirmDialog({ open, payload, onClose }: ConfirmDialogProps) {
  //const appWindowContext = React.useContext(WindowContext);
  const t = i18n.get;
  const cancelButtonProps = useDialogLoadingButton(() => onClose(false));
  const okButtonProps = useDialogLoadingButton(() => onClose(true));
  return (
    <Dialog
      size="xs"
      //fullWidth
      {...payload.dialogProps}
      open={open}
      onClose={() => onClose(false)}
      //container={appWindowContext?.document.body}
    >
      {payload.title !== false && <Dialog.Header>{payload.title ?? t("confirm")}</Dialog.Header>}
      <Dialog.Content className="py-0">{payload.msg}</Dialog.Content>
      <Dialog.Footer>
        <Button autoFocus disabled={!open} {...cancelButtonProps}>
          {payload.cancelText ?? t("cancel")}
        </Button>
        <Button color={payload.severity} disabled={!open} {...okButtonProps}>
          {payload.okText ?? t("ok")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export interface PromptDialogPayload extends PromptOptions {
  msg: React.ReactNode;
}

export interface PromptDialogProps
  extends DialogProps<PromptDialogPayload, string | null> {}

export function PromptDialog({ open, payload, onClose }: PromptDialogProps) {
  //const appWindowContext = React.useContext(WindowContext);

  const t = i18n.get;
  const [input, setInput] = React.useState("");
  const { loading: cancelLoading, ...cancelButtonProps } =
    useDialogLoadingButton(() => onClose(null));

  const [loading, setLoading] = React.useState(false);

  const name = "input";
  return (
    <Dialog
      size="xs"
      fullWidth
      {...payload.dialogProps}
      open={open}
      onClose={() => onClose(null)}
      panelProps={
        {
          ...payload.dialogProps?.panelProps,
          component: "form",
          onSubmit: async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            try {
              setLoading(true);
              const formData = new FormData(event.currentTarget);
              const value = formData.get(name) ?? "";
              invariant(
                typeof value === "string",
                "Value must come from a text input",
              );
              await onClose(value as string);
            } finally {
              setLoading(false);
            }
          },
        } as any
      }
      //container={appWindowContext?.document.body}
    >
      {payload.title !== false && <Dialog.Header>{payload.title ?? t("confirm")}</Dialog.Header>}
      <Dialog.Content className="py-0">
        <DialogContentText>{payload.msg} </DialogContentText>
        <Input
          autoFocus
          required
          margin="dense"
          id="name"
          name={name}
          type="text"
          fullWidth
          variant="standard"
          value={input}
          onChange={(event: any) => setInput(event.target.value)}
        />
      </Dialog.Content>
      <Dialog.Footer>
        <Button
          disabled={!open || cancelLoading}
          startIcon={cancelLoading ? <Spinner /> : undefined}
          {...cancelButtonProps}
        >
          {payload.cancelText ?? t("cancel")}
        </Button>
        <Button
          disabled={!open}
          startIcon={loading ? <Spinner /> : undefined}
          type="submit"
        >
          {payload.okText ?? t("ok")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}

export function useDialogs(): DialogHook {
  const { open, close } = React.useContext(DialogsContext)!;

  const alert = React.useCallback<OpenAlertDialog>(
    (msg, { onClose, ...options } = {}) =>
      open(AlertDialog, { ...options, msg }, { onClose }),
    [open],
  );

  const confirm = React.useCallback<OpenConfirmDialog>(
    (msg, { onClose, ...options } = {}) =>
      open(ConfirmDialog, { ...options, msg }, { onClose }),
    [open],
  );

  const prompt = React.useCallback<OpenPromptDialog>(
    (msg, { onClose, ...options } = {}) =>
      open(PromptDialog, { ...options, msg }, { onClose }),
    [open],
  );

  return React.useMemo(
    () => ({
      alert,
      confirm,
      prompt,
      open,
      close,
    }),
    [alert, close, confirm, open, prompt],
  );
}
