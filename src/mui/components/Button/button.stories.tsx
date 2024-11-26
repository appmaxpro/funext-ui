import React, { useRef, useState } from "react";

import { Box } from "../../../core/box";


import { 
  MenuItem, 
  Divider, 
  Menu ,
  Button,
  IconButton,
  Tooltip as MuiTooltip, 
  Popover,
  Text as MuiText
} 
from "../..";

import {Link} from "../Link";

import { MaterialIcon } from "../../../icons/material-icon";

const config = {
  component: Button,
  title: "Components/Button",
};

export const Basic = () => {
  const [text, setText] = useState("Click me...");
  const [open, setOpen] = useState(false);
  const onClick = () => {
    setText("Clicked!!!");
    setOpen(!open);
  };
  return (
    <Box display="flex" alignItems="center" g={2}>
      <MuiTooltip content={text} open={open}>
        <Button variant="filled" onClick={onClick}>
          {text}
        </Button>
      </MuiTooltip> 
      <MuiTooltip content={Variants}>
        <Button variant="filled">
          Disabled
        </Button>
      </MuiTooltip>
    </Box>
  );
};

export const Sizes = () => {


  const popRef = useRef(null);
  const [open, setOpen] = useState(false);

  const Content = () => (
    <>
      Hello Nabil Hello Nabil, Hello Nabil, Hello Nabil
    </>
  );

  return (
    <Box display="flex" alignItems="center" g={2}>
      <Popover arrow>
        <Popover.Handler>
          <Button color="primary" size="sm">
            Small
          </Button>
        </Popover.Handler>
        <Popover.Content header={<MuiText variant="h6">MuiText Header</MuiText>}>
          <Content/>
        </Popover.Content>
      </Popover>
      <Button color="primary" size="md">Normal</Button>
      
      <Button color="primary" size="lg">
        Large
      </Button>

      <IconButton ref={popRef} onClick={()=> setOpen(!open)}>
        <MaterialIcon icon="add_location" fontSize={24}/>
      </IconButton>

      <Popover target={popRef} open={open} handler={setOpen} arrow>
        <Popover.Content header={<MuiText variant="subtitle1" fw={500} gutterBottom>MuiText Header2</MuiText>}>
          <Content/>
        </Popover.Content>
      </Popover>
    </Box>
  );
};

export const Variants = () => {
  return (
    <Box display="flex" alignItems="center" g={2} flexDirection="column">
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="filled" color="primary">Primary</Button>
        <Button variant="filled" color="secondary">Secondary</Button>
        <Button variant="filled" color="success">Success</Button>
        <Button variant="filled" color="info">Danger</Button>
        <Button variant="filled" color="warning">Warning</Button>
        <Button variant="filled" color="info">Info</Button>
        <Button variant="filled" color="light">Light</Button>
        <Button variant="filled" color="dark">Dark</Button>
        <Button variant="filled"
            as={Link}
            LinkComponent={Link} href="#">
            Link
        </Button>
        
      </Box>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="text" color="primary">Primary</Button>
        <Button variant="text" color="secondary">Secondary</Button>
        <Button variant="text" color="success">Success</Button>
        <Button variant="text" color="info">Danger</Button>
        <Button variant="text" color="warning">Warning</Button>
        <Button variant="text" color="info">Info</Button>
        <Button variant="text" color="light">Light</Button>
        <Button variant="text" color="dark">Dark</Button>
        
      </Box>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="outlined" color="primary">Primary</Button>
        <Button variant="outlined" color="secondary">Secondary</Button>
        <Button variant="outlined" color="success">Success</Button>
        <Button variant="outlined" color="info">Danger</Button>
        <Button variant="outlined" color="warning">Warning</Button>
        <Button variant="outlined" color="info">Info</Button>
        <Button variant="outlined" color="light">Light</Button>
        <Button variant="outlined" color="dark">Dark</Button>
      </Box>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="ghost" color="primary">Primary</Button>
        <Button variant="ghost" color="secondary">Secondary</Button>
        <Button variant="ghost" color="success">Success</Button>
        <Button variant="ghost" color="info">Danger</Button>
        <Button variant="ghost" color="warning">Warning</Button>
        <Button variant="ghost" color="info">Info</Button>
        <Button variant="ghost" color="light">Light</Button>
        <Button variant="ghost" color="dark">Dark</Button>
      </Box>
    </Box>
    
  );
};

export const Outline = () => {
  return (
    <Box display="flex" alignItems="center" g={2}>
      <Button color="primary" variant="outlined">
        Primary
      </Button>
      <Button color="secondary" variant="outlined">
        Secondary
      </Button>
      <Button color="success" variant="outlined">
        Success
      </Button>
      <Button color="red" variant="outlined">
        Danger
      </Button>
      <Button color="warning" variant="outlined">
        Warning
      </Button>
      <Button color="info" variant="outlined">
        Info
      </Button>
    </Box>
  );
};

export const Text = () => {
  return (
    <Box display="flex" alignItems="center" g={2}>
      <Button color="primary" variant="text">
        Primary
      </Button>
      <Button color="secondary" variant="text">
        Secondary
      </Button>
      <Button color="success" variant="text">
        Success
      </Button>
      <Button color="red" variant="text">
        Danger
      </Button>
      <Button color="warning" variant="text">
        Warning
      </Button>
      <Button color="info" variant="text">
        Info
      </Button>
    </Box>
  );
};

export const Ghost = () => {
  return (
    <Box display="flex" alignItems="center" g={2}>
      <Button color="primary" variant="ghost">
        Primary
      </Button>
      <Button color="secondary" variant="ghost">
        Secondary
      </Button>
      <Button color="success" variant="ghost">
        Success
      </Button>
      <Button color="red" variant="ghost">
        Danger
      </Button>
      <Button color="warning" variant="ghost">
        Warning
      </Button>
      <Button color="info" variant="ghost">
        Info
      </Button>
    </Box>
  );
};

export function CustomizedMenus() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button
        id="demo-customized-button"
        aria-controls={open ? 'demo-customized-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        variant="filled"
        disableElevation
        onClick={handleClick}
        endIcon={<MaterialIcon icon="keyboard_arrow_down" />}
      >
        Options
      </Button>
      <Menu
        id="demo-customized-menu"
        MenuListProps={{
          'aria-labelledby': 'demo-customized-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={handleClose}>
          <MaterialIcon className="menu-icon" fill variant="rounded" icon="edit" />
          Edit
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <MaterialIcon className="menu-icon" fill variant="rounded" icon="delete" />
          Duplicate
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem  onClick={handleClose}>
          <MaterialIcon className="menu-icon" fill icon="archive" />
          Archive
        </MenuItem>
        <MenuItem onClick={handleClose} >
          <MaterialIcon className="menu-icon" fill icon="more_horiz" />
          More
        </MenuItem>
      </Menu>
    </div>
  );
}

export default config;
