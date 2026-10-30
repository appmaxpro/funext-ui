import { Box, clsx, cn } from "~/ui";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Input, Button, type InputProps, Link } from "~/ui";
import styles from "./string.module.scss";
import repeat from "lodash/repeat";
import { useAfterActions } from "../hooks";
import { noop } from "lodash";

function DottedViewerInput({ value: val, ...inputProps }: InputProps) {
  const [value, setVal] = useState(val);

  const setValue = useAfterActions(
    useCallback(async (value?: string) => {
      setVal(value);
    }, []),
  );

  useEffect(() => {
    setValue(val ? String(val) : '')
  }, [setValue, val]);

  return <Input value={value} {...(inputProps as any)} />;
}

export function ViewerInput({
  name,
  value,
  nativeClassName,
  type,
  ...rest
}: InputProps) {
  const InputComponent: React.FC<InputProps> = (
    name?.includes?.(".") ? DottedViewerInput : Input
  ) as any;

  if (type === "password") {
    value =
      value && `${value}`.length
        ? repeat(value as string, (value as string).length)
        : value;
  }

  return (
    <InputComponent
      className="flex items-center min-h-[30px]"
      {...rest}
      as="div"
      value={value ?? ""}
      readOnly
      onChange={noop}
      variant="standard"
      disableBorder
      nativeClassName={clsx("p-0", nativeClassName)}
      type={type}
    />
  );
}

const linkSx = {
  px: 0,
  textAlign: "start",
  justifyContent: "start",
  overflow: "hidden",
  whiteSpace: "nowrap",
  minHeight: "32px",
  maxWidth: "min-content",
};

export function ViewerLink({
  children,
  onClick,
  title,
  link,
  disabled,
}: {
  children: React.ReactNode;
  onClick: React.MouseEventHandler<HTMLElement>;
  title?: string;
  link?: boolean;
  disabled?: boolean;
}) {
  if (link) {
    return (
      <Link
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!disabled) onClick(event);
        }}
        tabIndex={-1}
        className={cn(
          styles.viewer,
          "py-1 text-start justify-start overflow-hidden whitespace-nowrap min-h[32px] max-h-content",
        )}
        title={title}
        href="#"
        fw={500}
        disabled={disabled}
      >
        {children}
      </Link>
    );
  }
  return (
    <Button
      sx={{
        px: 0,
        textAlign: "start",
        justifyContent: "start",
        overflow: "hidden",
        whiteSpace: "nowrap",
      }}
      variant="text"
      onClick={onClick}
      tabIndex={-1}
      className={cn(
        styles.viewer,
        "py-1 text-start justify-start overflow-hidden whitespace-nowrap",
      )}
      title={title}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
