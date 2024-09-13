import * as React from 'react';
import { ButtonGroup, Button, Divider } from "../../mui";

const config = {
  component: ButtonGroup,
  title: "Components/ButtonGroup",
};

export const Basic = () => {

  return (
    <div className="flex w-max flex-col gap-4">
      <ButtonGroup>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      
      <ButtonGroup variant="outlined">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <ButtonGroup variant="text">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </div>
  );
};
export const Text = () => {

  return (
    <div className="flex w-max flex-col gap-4">
      <Divider>primary</Divider>
      <ButtonGroup variant="text">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>secondary</Divider>
      <ButtonGroup variant="text" color="secondary">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>info</Divider>
      <ButtonGroup variant="text" color="info">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>success</Divider>
      <ButtonGroup variant="text" color="success">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Error</Divider>
      <ButtonGroup variant="text" color="error">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Dark</Divider>
      <ButtonGroup variant="text" color="dark">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Light</Divider>
      <ButtonGroup variant="text" color="light">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </div>
  );
};

export const Outlined = () => {

  return (
    <div className="flex w-max flex-col gap-4">
      <Divider>primary</Divider>
      <ButtonGroup variant="outlined">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color='inherit'>inherit</Divider>
      <ButtonGroup variant="outlined" color='inherit'>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color="secondary">secondary</Divider>
      <ButtonGroup variant="outlined" color="secondary">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color="info">info</Divider>
      <ButtonGroup variant="outlined" color="info">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>success</Divider>
      <ButtonGroup variant="outlined" color="success">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Error</Divider>
      <ButtonGroup variant="outlined" color="error">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Dark</Divider>
      <ButtonGroup variant="outlined" color="dark">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Light</Divider>
      <ButtonGroup variant="outlined" color="light">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </div>
  );
};

export const Filled = () => {

  return (
    <div className="flex w-max flex-col gap-4">
      <Divider>primary</Divider>
      <ButtonGroup variant="filled">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color='inherit'>inherit</Divider>
      <ButtonGroup variant="filled" color='inherit'>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color="secondary">secondary</Divider>
      <ButtonGroup variant="filled" color="secondary">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color="info">info</Divider>
      <ButtonGroup variant="filled" color="info">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>success</Divider>
      <ButtonGroup variant="filled" color="success">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Error</Divider>
      <ButtonGroup variant="filled" color="error">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Dark</Divider>
      <ButtonGroup variant="filled" color="dark">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Light</Divider>
      <ButtonGroup variant="filled" color="light">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </div>
  );
};

export const Ghost = () => {

  return (
    <div className="flex w-max flex-col gap-4">
      <Divider>primary</Divider>
      <ButtonGroup variant="ghost">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color='inherit'>inherit</Divider>
      <ButtonGroup variant="ghost" color='inherit'>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color="secondary">secondary</Divider>
      <ButtonGroup variant="ghost" color="secondary">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider color="info">info</Divider>
      <ButtonGroup variant="ghost" color="info">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>success</Divider>
      <ButtonGroup variant="ghost" color="success">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Error</Divider>
      <ButtonGroup variant="ghost" color="error">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Dark</Divider>
      <ButtonGroup variant="ghost" color="dark">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <Divider>Light</Divider>
      <ButtonGroup variant="ghost" color="light">
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </div>
  );
};


export const Vertical = () => {
  return (
    <div className="flex w-max gap-4">
      <ButtonGroup vertical>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <ButtonGroup variant="filled" vertical>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
      <ButtonGroup variant="ghost" vertical>
        <Button>One</Button>
        <Button>Two</Button>
        <Button>Three</Button>
      </ButtonGroup>
    </div>
  );
};

export default config;
