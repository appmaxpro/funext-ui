import { Box } from "../Box";
import { Badge } from ".";
import React from "react";
import Button from "../Button";


const config = {
  component: Badge,
  title: "Components/Badge",
};

export const Basic = () => {
  return (
    <Box>
      <h1>
        Example heading <Badge content={22}>New</Badge>
      </h1>
      <h2>
        Example heading <Badge content={22}>New</Badge>
      </h2>
      <h3>
        Example heading <Badge content={22}>New</Badge>
      </h3>
      <h4>
        Example heading <Badge content={22}>New</Badge>
      </h4>
      <h5>
        Example heading <Badge content={22}>New</Badge>
      </h5>
      <h6>
        Example heading <Badge>New</Badge>
      </h6>
    </Box>
  );
};

export const Colors = () => {
  return (
    <Box>
      <Badge content={22} color="primary">
        Primary
      </Badge>

      <Badge content={22} color="secondary">
        Secondary
      </Badge>

      <Badge content={22} color="success">
        Success
      </Badge>

      <Badge content={22} color="error">
        Danger
      </Badge>

      <Badge content={22} color="warning">
        Warning
      </Badge>

      <Box />

      <Badge content={22} color="primary" shape="circle">
        Primary
      </Badge>

      <Badge content={22} color="secondary" shape="circle">
        Secondary
      </Badge>

      <Badge content={22} color="success" shape="circle">
        Success
      </Badge>

      <Badge content={22} color="error" shape="circle">
        Danger
      </Badge>

      <Badge content={22} color="warning" shape="circle">
        Warning
      </Badge>

      <Badge content={22} color="info" shape="circle">
        Info
      </Badge>


    </Box>
  );
};

export const Composition = () => {
  return (
    <Box d="inline-flex" gap={4}>
      <Badge content={22} color="primary">
        <Button> Notifications 10</Button>
      </Badge>

      <Badge content={22} color="secondary">
        <Button > Notifications 10</Button>
      </Badge>

      <Badge content={22} color="success">
        <Button> Notifications 10</Button>
      </Badge>

      <Badge content={22} color="error">
        <Button> Notifications 10</Button>
      </Badge>

      <Badge content={22} color="warning">
        <Button> Notifications 10</Button>
      </Badge>

      <Badge content={22} color="info">
        <Button> Notifications 10</Button>
      </Badge>


    </Box>
  );
};

export const Variant = () => {
  return (
    <Box>
      <Badge>Default</Badge> <Badge shape="square">Pill</Badge>
    </Box>
  );
};

export default config;
