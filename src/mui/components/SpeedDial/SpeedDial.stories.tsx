import * as React from "react";
import { useState } from "react";
import {
  Input,
  Button,
  IconButton,
  Checkbox,
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  Timeline,
  TimelineItem,
  TimelineConnector,
  TimelineHeader,
  TimelineIcon,
  TimelineBody,
  SpeedDial,
  SpeedDialHandler,
  SpeedDialContent,
  SpeedDialAction
  //DialogTitle,
} from "../..";
import { MaterialIcon } from "../../../icons/material-icon";

const config = {
  component: SpeedDial,
  title: "Components/SpeedDial",
};
const addIcon = <MaterialIcon icon="add" size={32} className="transition-transform group-hover:rotate-45" />;
const homeIcon = <MaterialIcon icon="home" />;
const settingsIcon = <MaterialIcon icon="settings" />;
const imageIcon = <MaterialIcon icon="image" />;

export function DefaultSpeedDial() {
  return (
    <div className="relative h-80 w-full">
      <div className="absolute bottom-0 right-0">
        <SpeedDial>
          <SpeedDialHandler>
            <IconButton size="lg" className="fill-button-shadow" color="primary" variant="filled">
            {addIcon}
            </IconButton>
          </SpeedDialHandler>
          <SpeedDialContent>
            <SpeedDialAction size="lg" className="fill-button-shadow">
              {homeIcon}
            </SpeedDialAction>
            <SpeedDialAction size="lg" className="fill-button-shadow">
              {settingsIcon}
            </SpeedDialAction>
            <SpeedDialAction size="lg" className="fill-button-shadow">
              {imageIcon}
            </SpeedDialAction>
          </SpeedDialContent>
        </SpeedDial>
      </div>
    </div>
  );
}


export function SpeedDialWithTextOutside() {
  const labelProps = {
    variant: "small",
    color: "slate",
    className:
      "absolute top-2/4 -left-2/4 -translate-y-2/4 -translate-x-3/4 font-normal",
  };
 
  return (
    <div className="relative h-80 w-full">
      <div className="absolute bottom-0 right-0">
        <SpeedDial>
          <SpeedDialHandler>
            <IconButton size="lg" className="fill-button-shadow">
              {addIcon}
            </IconButton>
          </SpeedDialHandler>
          <SpeedDialContent>
            <SpeedDialAction className="relative">
              {homeIcon}
              <Text {...labelProps}>Home</Text>
            </SpeedDialAction>
            <SpeedDialAction className="relative">
              {settingsIcon}
              <Text {...labelProps}>Settings</Text>
            </SpeedDialAction>
            <SpeedDialAction className="relative">
              {imageIcon}
              <Text {...labelProps}>Pages</Text>
            </SpeedDialAction>
          </SpeedDialContent>
        </SpeedDial>
      </div>
    </div>
  );
}


export function CustomSpeedDial() {
  return (
    <div className="relative h-80 w-full">
      <div className="absolute bottom-0 right-0">
        <SpeedDial>
          <SpeedDialHandler>
            <IconButton color="white" variant="filled" size="lg" className="fill-button-shadow">
              {addIcon} 
            </IconButton>
          </SpeedDialHandler>
          <SpeedDialContent className="rounded-full border border-slate-50 bg-white shadow-xl shadow-black/10">
            <SpeedDialAction className="bg-slate-50">
              {homeIcon}
            </SpeedDialAction>
            <SpeedDialAction className="bg-slate-50">
              {settingsIcon}
            </SpeedDialAction>
            <SpeedDialAction className="bg-slate-50">
              {imageIcon}
            </SpeedDialAction>
          </SpeedDialContent>
        </SpeedDial>
      </div>
    </div>
  );
}



export function SpeedDialWithTextInside() {
  return (
    <div className="relative h-screen w-full">
      <div className="absolute bottom-10 end-0 me-4">
        <SpeedDial>
          <SpeedDialHandler>
            <IconButton size="lg" className="fill-button-shadow" onClick={()=>{}}>
              {addIcon}
            </IconButton>
          </SpeedDialHandler>
          <SpeedDialContent>
            <SpeedDialAction className="h-16 w-16 fill-button-shadow">
              {homeIcon}
              <Text color="slate" className="text-xs font-normal">
                Home
              </Text>
            </SpeedDialAction>
            <SpeedDialAction className="h-16 w-16 fill-button-shadow">
              {settingsIcon}
              <Text color="slate" className="text-xs font-normal">
                Settings
              </Text>
            </SpeedDialAction>
            <SpeedDialAction className="h-16 w-16 fill-button-shadow">
              {imageIcon}
              <Text color="slate" className="text-xs font-normal">
                Pages
              </Text>
            </SpeedDialAction>
          </SpeedDialContent>
        </SpeedDial>
      </div>
    </div>
  );
}

export default config;
