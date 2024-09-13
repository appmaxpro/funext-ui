import * as React from 'react';
import BiArrowClockwise from "bootstrap-icons/icons/arrow-clockwise.svg?react";
import BiArrowCounterclockwise from "bootstrap-icons/icons/arrow-counterclockwise.svg?react";
import BiClipboardCheck from "bootstrap-icons/icons/clipboard-check.svg?react";
import BiClipboard from "bootstrap-icons/icons/clipboard.svg?react";
import BiScissors from "bootstrap-icons/icons/scissors.svg?react";

import { Menu as AxMenu,  MenuItem, MenuButton, MenuHandler, MenuList, Button} from "../../mui";
import { MenuDivider } from "../menu/menu-divider";
//import { MenuItem } from "../menu/menu-item";
import { Menubar } from "./menubar";

const config = {
  component: Menubar,
  title: "Components/Menubar",
};

const Menu: any = AxMenu;

export const Basic = () => {
  return (
    <Menubar> 
      <MenuButton content={<Button variant='text' color='default'>File</Button> }>
          <MenuItem text="Share" />
          <MenuDivider />
          <MenuItem text="New" menu>
              <MenuItem text="Document"/>
              <MenuItem text="Spreadsheet" />
              <MenuItem text="Images" menu>
                <MenuItem text="JPG" />
                <MenuItem text="JPG" />
                <MenuItem text="PNG" />
              </MenuItem>
          </MenuItem>
          <MenuItem text="Open" disabled />
          <MenuDivider />
          <MenuItem text="Print" label="Ctrl+P" />
      </MenuButton>
      <MenuButton content={<Button variant='text' color='default'>Edit</Button> }>
        <MenuItem
          text="Undo"
          startIcon={BiArrowCounterclockwise}
          label="Ctrl+Z"
        />
        <MenuItem text="Redo" startIcon={BiArrowClockwise} label="Ctrl+Y" />
        <MenuDivider />
        <MenuItem text="Cut" startIcon={BiScissors} label="Ctrl+X" />
        <MenuItem text="Copy" startIcon={BiClipboard} label="Ctrl+C" />
        <MenuItem text="Paste" startIcon={BiClipboardCheck} label="Ctrl+P" />
      </MenuButton>
      <MenuButton  content={<Button variant='text' color='default'>View</Button> }>
        <MenuItem text="Print Layout" />
        <MenuDivider />
        <MenuItem text="Mode" menu>
          <MenuItem text="Presentation" />
          <MenuItem text="Edit" />
          <MenuItem text="Modifiable" />
          <MenuItem text="Context" menu>
            <MenuItem text="New" />
            <MenuItem text="Exisiting" />
            <MenuItem text="Shape" menu>
              <MenuItem text="Shape" />
              <MenuItem text="Circle" />
              <MenuItem text="Square" />
              <MenuItem text="Rectangle" />
              <MenuItem text="Triangle" />
            </MenuItem>
          </MenuItem>
        </MenuItem>
      </MenuButton>
      <MenuButton content={<Button variant='text' color='default'>Format</Button> }>
        <MenuItem label="Ctrl+B" text="Bold" />
        <MenuItem label="Ctrl+I" text="Italic" />
        <MenuItem label="Ctrl+U" text="Underline" />
      </MenuButton>
    </Menubar>
  );
};

export default config;
