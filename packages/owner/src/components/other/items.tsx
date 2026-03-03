import { Box, Button, Card, Collapse, Flex, IconButton, List, Panel, type CardHeaderProps, type CardProps, type SxComponentProps } from "@funext/ui";
import { EMPTY_ARRAY, i18n, type BlockProps } from "~/utils";
import Icons from "./icons";
import React from "react";


const Item = ({
  label,
  title,
  children,
  justify = "between",
  ...rest
}: BlockProps) => {
  return (
    <Flex justify={justify} items="center" {...rest}>
      {(label ?? title) && <span>{label ?? title}:</span>}
      {children}
    </Flex>
  );
};

const Tr = ({children}: {children: React.ReactNode}) => {
   return (typeof children === 'string' ? i18n.get(children) : children)
}

export interface ExpandCardProps extends CardProps {
  header?: CardHeaderProps;
  expandable?: boolean;
  open?: boolean;
}

const ExpandCard = ({
  open: openProp = true,
  header,
  children,
  ...props
}: Omit<ExpandCardProps, "expandable">) => {
  const [open, setOpen] = React.useState(openProp);

  return (
    <Card {...props}>
      <Card.Header
        action={
          <IconButton
            onClick={React.useCallback(
              () => setOpen((open) => !open),
              EMPTY_ARRAY,
            )}
          >
            <Icons.Icons.ChevronDown
              className={`${open ? "rotate-180" : ""} h-5 w-5 transition-transform`}
            />
          </IconButton>
        }
        {...header}
      />
      <Collapse open={open}>{children}</Collapse>
    </Card>
  );
};


function Icon({name, ...props}: SxComponentProps) {
  const Icon = Icons.icon(name as any)
  return <Icon {...props}/>
}

export declare namespace Items {
  export {Item}
  export {Tr}
  export {Box}
  export {Flex}
  export {ExpandCard}
  export {Card}
  export {Panel}
  export {Button}
  export {Icon}
  export {List}
}
