import React from "react";
import { Box, Text, Grid, Panel, IconButton, Flex, Card } from "@funext/ui";
import { type IconComponent, allIcons } from "./icon-data";
import { GridIcons } from "~/components/shared/grid-icons";
import { Container, Icons } from "~/components";
import { isReactType } from "~/utils";

interface IconDisplayProps {
  icons: IconComponent[];
}

const scopeGridProps = {
  icons: [
    {
      icon: Icons.LocalShipping,
      title: "Fleet",
      to: "/res/fleet",
    },
    {
      icon: Icons.ShoppingCart,
      title: "Sales",
      to: "/states",
    },
  ],
  
  iconSx: {
    maxWidth: 72
  }
};
const icons = [];

export default function Home() {
 
  return (
    <Container className="p-4">
      <Card>
        <Card.Body>
          <div>Home is isValidElement: {`${React.isValidElement(Home)}`} </div>
          <div>typeof Icon: {typeof Icons.AccessAlarm}</div>
          <div>
            Icons is isValidElement:{" "}
            {`${React.isValidElement(Icons.AccessAlarm)}`}
          </div>
          <div>Icons div isReactComponent : {`${isReactType("div")}`}</div>
          <div>
            Icons createElement: {`${React.createElement(Icons.AccessAlarm)}`}
          </div>
        </Card.Body>
      </Card>
      <Card>
        <Card.Body className="px-8">
          <GridIcons {...scopeGridProps} />
        </Card.Body>
      </Card>
    </Container>
  );
}

const iconSx = {
  p: 2,
  borderRadius: "8px",
  color: "text.primary",
  transition: "transform 0.2s, box-shadow 0.2s, color 0.2s",
  "&:hover": {
    bgcolor: "primary.light",
    color: "primary.contrastText",
    transform: "scale(1.1)",
    boxShadow: 6,
  },
};
function IconDisplay({ icons }: IconDisplayProps) {
  return (
    <Grid
      container
      columns={12}
      spacing={2}
      alignItems="center"
      justifyContent="center"
    >
      {icons.map((Icon, index) => (
        <Grid
          item
          size={4}
          alignItems="center"
          justifyContent="center"
          key={index}
        >
          <Flex direction="column" gap={1}>
            <IconButton aria-label={`Icon ${index + 1}`} sx={iconSx}>
              <Icon size={32} />
            </IconButton>
            <Text
              variant="caption"
              color="text.secondary"
              sx={{ mt: 0.5, fontWeight: "bold" }}
            >
              Icon #{index + 1}
            </Text>
          </Flex>
        </Grid>
      ))}
    </Grid>
  );
}
