import {
  Alert,
  Box,
  Button,
  Card,
  Collapse,
  Flex,
  IconButton,
  LinearProgress,
  List,
  Panel,
  Stack,
  type CardHeaderProps,
  type CardProps
} from "~/ui";
import React from "react";
import { EMPTY_ARRAY, i18n } from "~/utils";
import { PercentageProgress } from "./circular-progress";
import { Container } from "./container";
import { GridIcons } from "./grid-icons";
import Icons from "./icons";
import { Loader } from "./loader";
import { Select } from "./select";
import { ErrorBox } from "./error-box";
import { SafeText } from "./safe-text";

type ItemProps = React.ComponentProps<typeof Flex> & {label?: React.ReactNode; title?: React.ReactNode;}
const Item = ({
  label,
  title,
  children,
  justify = "between",
  ...rest
}: ItemProps) => {
  return (
    <Flex justify={justify} items="center" {...rest}>
      {(label ?? title) && <span>{label ?? title}:</span>}
      {children}
    </Flex>
  );
};

const Tr = ({ children }: { children: React.ReactNode }) => {
  return typeof children === "string" ? i18n.get(children) : children;
};

export interface ExpandCardProps extends CardProps {
  header?: CardHeaderProps;
  open?: boolean;
}

const ExpandCard = ({
  open: openProp = true,
  header,
  children,
  ...props
}: ExpandCardProps) => {
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
            <Icons.Icons.ChevronDown size={20}
              className={`${open ? "rotate-180" : ""} transition-transform`}
            />
          </IconButton>
        }
        {...header}
      />
      <Collapse open={open}>{children}</Collapse>
    </Card>
  );
};

const Icon = Icons.Icon;

export const Items = {
  Item,
  Tr,
  Box,
  Flex,
  Stack,
  Container,
  ExpandCard,
  Card,
  Panel,
  Button,
  IconButton,
  Icon,
  List,
  Alert,
  CircularProgress: PercentageProgress,
  Progress: LinearProgress,
  GridIcons,
  Select,
  Loader,
  ErrorBox,
  SafeText
};
