import {
  composeEventHandlers,
  Dialog,
  Drawer,
  Popover,
  useScreenSize,
} from "~/ui";
import React from "react";
import { EMPTY_OBJECT, getElementRef } from "~/utils";
import { composeRefs } from "~/utils/compose-ref";

export const isItemDisabled = (comp: any) =>
  !comp ||
  comp.props?.disabled ||
  comp.props?.["area-disabled"] ||
  comp.props?.["area-hidden"];

export type TriggerAction = {
  open: (open?: boolean) => void;
  toggle: () => void;
};

type TriggerActionCallback = TriggerAction & {
  ref: (ref: HTMLElement | null) => void;
};

type PopoverProps = React.ComponentProps<typeof Popover>;
type DialogProps = React.ComponentProps<typeof Dialog>;
type DrawerProps = React.ComponentProps<typeof Drawer>;

export type Display = "popover" | "drawer" | "dialog" | "raw";
export type RenderOptions = {
  display: Display;
  close: () => void;
};
export type DynamicDisplay = {
  display?: Display;
  sm?: Display;
  md?: Display;
};

export type PopupSlots = {
  popoverProps?: Partial<PopoverProps>;
  dialogProps?: Partial<DialogProps>;
  drawerProps?: Partial<DrawerProps>;
};

export type PopupProps = {
  display?: Display;
  triggerRef?: React.Ref<TriggerAction | undefined>;
  renderContent: (options: RenderOptions) => React.ReactNode;
  slots?: PopupSlots;
  children: React.ReactNode;
  open?: boolean;
  //setOpen: (open: Boolean)
};

export function Popup({
  display = "popover",
  triggerRef,
  renderContent,
  slots,
  children,
  open: openProp,
}: PopupProps) {
  const [open, setOpen] = React.useState<boolean | undefined>(false);
  //const [target, setTarget] = React.useState(null);
  const [present, setPresent] = React.useState(false);

  const [reference, setReference] = React.useState<HTMLElement | null>(null);
  //const mTriggerRef = React.useRef<TriggerAction>(null);

  const mTriggerAction = React.useMemo(() => {
    const result = {
      //ref: setReference,
      open: setOpen,
      toggle: () => setOpen((open) => !open),
    };
    //mTriggerRef.current = result;
    return () => result;
  }, [setReference, setOpen]);

  React.useImperativeHandle(triggerRef, mTriggerAction, [mTriggerAction]);

  const renderPopup = () => {
    const options = { display, close: () => setOpen(false) };
    return renderContent(options);
  };

  if (display === "raw") {
    return renderPopup();
  }

  const trigger = children && (
    <Trigger triggerCp={mTriggerAction} ref={setReference}>
      {children}
    </Trigger>
  );

  if (!present && !open) {
    return trigger;
  }

  if (display === "popover") {
    const { popoverProps } = slots ?? EMPTY_OBJECT;
    return (
      <>
        {trigger}
        <Popover
          open={openProp ?? open}
          onOpenChange={setOpen}
          animate
          placement="bottom-end"
          onPresent={setPresent}
          reference={reference}
          {...popoverProps}
        >
          {renderPopup()}
        </Popover>
      </>
    );
  }

  if (display === "dialog") {
    const { dialogProps } = slots ?? EMPTY_OBJECT;
    return (
      <>
        {trigger}
        <Dialog
          open={openProp ?? open}
          onClose={setOpen as DialogProps["onClose"]}
          reference={reference}
          onPresent={setPresent}
          strategy="fixed"
          {...dialogProps}
        >
          {renderPopup()}
        </Dialog>
      </>
    );
  }

  const { drawerProps } = slots ?? EMPTY_OBJECT;

  return (
    <>
      {trigger}
      <Drawer
        open={openProp ?? open}
        onClose={setOpen as DialogProps["onClose"]}
        direction="bottom"
        reference={reference}
        onPresent={setPresent}
        strategy="fixed"
        {...drawerProps}
      >
        {renderPopup()}
      </Drawer>
    </>
  );
}

type DynamicPopupProps = Omit<PopupProps, "display"> & {
  display: DynamicDisplay;
};

export function DynamicPopup({
  display: { sm, md, display },
  ...popup
}: DynamicPopupProps) {
  const { mdDown, smDown } = useScreenSize();

  const toDisplay = React.useMemo(
    () => (smDown ? (sm ?? md ?? display) : mdDown ? (md ?? display) : display),
    [mdDown, smDown, display],
  );

  return <Popup display={toDisplay} {...popup} />;
}

const Trigger = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithRef<any> & {
    triggerCp: () => TriggerAction;
  }
>(({ children, triggerCp }, forwardedRef) => {
  //const mTriggerRef = React.useRef<TriggerAction>(null);
  //const triggerAction = React.useMemo<TriggerAction>(triggerCp, [triggerCp])
  //React.useImperativeHandle(forwardedRef, triggerCp, [triggerCp]);
  const mergedRef = composeRefs(forwardedRef, getElementRef(children));

  const onMyClick = React.useCallback(
    (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
      if (isItemDisabled(children)) {
        //return;
      }
      //console.log("TriggerTrigger :: toggle:", ref?.toggle)
      triggerCp?.().toggle();
    },
    [triggerCp],
  );

  const onClick = composeEventHandlers(children?.onClick, onMyClick);

  //console.log("MenuHandler: ReferenceProps:", refProps)
  return React.cloneElement(children, {
    ref: mergedRef,
    onClick,
  });
});
