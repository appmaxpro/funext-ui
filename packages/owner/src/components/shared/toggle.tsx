
import { Button as TogglePrimitive, cn, cva, type VariantProps } from "@funext/ui";

import type React from "react";

type Props = {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, checked: boolean) => void;
}

export function Toggle(props: React.ComponentProps<typeof TogglePrimitive> & Props) {
  const { onClick, onChange, defaultChecked=false, checked=defaultChecked, ...rest } = props;

  const handleChange = (event:React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onClick) {
      //@ts-ignore
      onClick(event, checked);
 
      if (event.defaultPrevented) {
        return;
      }
    }

    if (onChange) {
      onChange(event, checked);
    }
  };
  return (
    <TogglePrimitive
      data-ui="Toggle"
      onClick={handleChange}
      color="inherit"
      variant={checked ? "ghost" : "filled"}
      {...props}
    />
  );
}

export { TogglePrimitive };