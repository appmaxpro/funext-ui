import React from "react";
import { Container, Icons } from "~/components";
import { GridIcons } from "~/components/shared/grid-icons";
import { Card } from "~/ui";
import { isReactType } from "~/utils";
import { type IconComponent } from "./icon-data";

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
