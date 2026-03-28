import React from "react";
import { Box, Text, Grid, Panel, IconButton, Flex, Card, Button, Stack, type SxProps } from "@funext/ui";
import type { IconComponent, IconProps } from "./icons";
import { iconOr, Icons } from "./icons";
import { i18n } from "~/utils";

type GridIconProps = {
  icon: string | IconComponent;
  title: string;
  to?: any;
  id?: any;
};

interface GridIconsProps
  extends Omit<React.ComponentProps<typeof Grid>, "onClick"> {
  icons: GridIconProps[];
  iconProp?: IconProps;
  titleProps?: React.ComponentProps<typeof Text>;
  buttonProps?: React.ComponentProps<typeof IconButton>;
  trans?: boolean;
  onClick?: (index: number, to: GridIconProps['id']) => void;
  itemProps?: React.ComponentProps<typeof Grid>;
  iconSx?: SxProps; 
}

const iconSx = {
  p: 2,
  borderRadius: "8px",
  //color: "text.primary",
  transition: "transform 0.2s, box-shadow 0.2s, color 0.2s",
  "&:hover": {
    //bgcolor: "primary.light",
    //color: "primary.contrastText",
    transform: "scale(1.1)",
    //boxShadow: 6,
  },
};
export function GridIcons({
  icons,
  iconProp,
  titleProps,
  buttonProps,
  itemProps,
  trans,
  iconSx,
  onClick: onClickProp,
  ...rest
}: GridIconsProps) {

   
  //console.log("GridIcons::First Icon:", icons[0].icon)
  //console.log("GridIcons::Compare Icon:", Icons.AccessAlarm)

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const ds = (e.target as HTMLButtonElement)?.dataset;
      const index = parseInt(ds?.["icon_index"] ?? String(0));
      if (icons[index].to) return;
      if (icons[index] && onClickProp) onClickProp(index, icons[index].id);
    },
    [onClickProp, icons],
  );
  return (
    <Grid
      container
      columns={12}
      spacing={2}
      alignItems="center"
      justifyContent="start"
      {...rest}
    >
      {icons.map(({title, icon, to}, index) => (
        <Grid
          size={4}
          alignItems="center"
          justifyContent="center"
          {...itemProps}
          key={index}
        >
          <Stack gap={2} className="text-center" sx={iconSx}>
            <Button
              data-icon_index={String(index)}
              aria-label={`Icon ${index + 1}`}
              sx={iconSx}
              color="inherit"
              {...buttonProps}
              onClick={onClick}
              {...(typeof to === 'string' ? {to} : to)}
            >
              {/*React.createElement(iconOr(icon), iconProp)*/}
              {React.createElement(iconOr(icon), {size: 'lg'})}
            </Button>
            <Text
              variant="subtitle1"
              color="primary"
              fw="700"
              mt={0.5}
              {...titleProps}
            >
              {trans ? i18n.t(title) : title}
            </Text>
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}
