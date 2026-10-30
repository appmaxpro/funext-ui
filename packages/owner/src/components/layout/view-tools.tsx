import { IconButton, styled, Tooltip, type IconButtonProps } from "~/ui";
import React from "react";
import { Toolbar, type ToolbarProps } from "~/components";
import { TIP_HOVER_PROPS } from "~/utils";

const LargeToolbar = styled(Toolbar)(({ theme }) => ({
  alignItems: "flex-start",
  paddingTop: theme.spacing(1),
  paddingBottom: theme.spacing(2),
  // Override media queries injected by theme.mixins.toolbar
  "@media all": {
    minHeight: 128,
  },
}));

type Props = ToolbarProps & {
  large?: boolean;
};

function ListToolbar({ large, ...props }: Props) {
  return React.createElement(large ? LargeToolbar : Toolbar, props);
}

const Button = (props: IconButtonProps) => (
  <IconButton
    color="inherit"
    {...props}
  />
);

const LTooltip = ({
  content,
  children,
}: {
  content: string;
  children: React.ReactNode;
}) => (
  <Tooltip content={content} hoverProps={TIP_HOVER_PROPS}>
    {children}
  </Tooltip>
);


export {
  LTooltip as Tooltip,
  Button,
  ListToolbar as Toolbar
}