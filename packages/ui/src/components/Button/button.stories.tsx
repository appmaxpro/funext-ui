import React, { useRef, useState } from "react";

import { Box } from "../Box";


import { 
  MenuItem, 
  Divider, 
  Menu ,
  IconButton,
  Tooltip as MuiTooltip, 
  Popover,
  Text as MuiText,
  ButtonProps,
  Checkbox
} 
from "../..";

import {Link} from "../Link";

import Button from ".";
import { MaterialIcon } from "../internal";
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
      <MuiTooltip content={Variants} allowOverContent>
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
        <Button color="primary" size="sm">
            Small
        </Button>
        <Content/>
      </Popover>
      <Button color="primary" size="md">Normal</Button>
      
      <Button color="primary" size="lg">
        Large
      </Button>

      <IconButton ref={popRef} onClick={()=> setOpen(!open)}>
        <MaterialIcon icon="add_location" fontSize={24}/>
      </IconButton>

    </Box>
  );
};

export const Variants = () => {
  
  return (
    <Box display="flex" alignItems="center" g={2} flexDirection="column">
      <Divider>Filled</Divider>
      <Box display="flex" alignItems="center" g={2} my={5} flexWrap={"wrap"}>
        <Button variant="filled" color="primary">Primary</Button>
        <Button variant="filled" color="secondary">Secondary</Button>
        <Button variant="filled" color="success">Success</Button>
        <Button variant="filled" color="error">Error</Button>
        <Button variant="filled" color="warning">Warning</Button>
        <Button variant="filled" color="info">Info</Button>
        <Button variant="filled" color="light">Light</Button>
        <Button variant="filled" color="dark">Dark</Button>
        <Button variant="filled" color="inherit">inherit</Button>
      </Box>
      <Divider>Filled disable elevation</Divider>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="filled" color="primary" disableElevation>Primary</Button>
        <Button variant="filled" color="secondary" disableElevation>Secondary</Button>
        <Button variant="filled" color="success" disableElevation>Success</Button>
        <Button variant="filled" color="error" disableElevation>Error</Button>
        <Button variant="filled" color="warning" disableElevation>Warning</Button>
        <Button variant="filled" color="info" disableElevation>Info</Button>
        <Button variant="filled" color="light" disableElevation>Light</Button>
        <Button variant="filled" color="dark" disableElevation>Dark</Button>
        <Button variant="filled" color="inherit" disableElevation>inherit</Button>
      </Box>
      <Divider>Text</Divider>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="text" color="primary">Primary</Button>
        <Button variant="text" color="secondary">Secondary</Button>
        <Button variant="text" color="success">Success</Button>
        <Button variant="text" color="error">Error</Button>
        <Button variant="text" color="warning">Warning</Button>
        <Button variant="text" color="info">Info</Button>
        <Button variant="text" color="light">Light</Button>
        <Button variant="text" color="dark">Dark</Button>
        <Button variant="text" color="inherit">inherit</Button>

      </Box>
      <Divider>Outlined</Divider>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="outlined" color="primary">Primary</Button>
        <Button variant="outlined" color="secondary">Secondary</Button>
        <Button variant="outlined" color="success">Success</Button>
        <Button variant="outlined" color="error">Error</Button>
        <Button variant="outlined" color="warning">Warning</Button>
        <Button variant="outlined" color="info">Info</Button>
        <Button variant="outlined" color="light">Light</Button>
        <Button variant="outlined" color="dark">Dark</Button>
        <Button variant="outlined" color="inherit">inherit</Button>
      </Box>
      <Divider>Ghost</Divider>
      <Box display="flex" alignItems="center" g={2} my={5}>
        <Button variant="ghost" color="primary">Primary</Button>
        <Button variant="ghost" color="secondary">Secondary</Button>
        <Button variant="ghost" color="success">Success</Button>
        <Button variant="ghost" color="error">Error</Button>
        <Button variant="ghost" color="warning">Warning</Button>
        <Button variant="ghost" color="info">Info</Button>
        <Button variant="ghost" color="light">Light</Button>
        <Button variant="ghost" color="dark">Dark</Button>
        <Button variant="ghost" color="inherit">inherit</Button>
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
      <Button color="error" variant="outlined">
        Error
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
      <Button color="error" variant="text">
          Error
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
      <Button color="error" variant="ghost">
        Error
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

function VariableButton(props:
  {variant:ButtonProps['variant'], 
    hoverVariant:ButtonProps['variant'], 
    button?:boolean
  }& ButtonProps) {
    const {variant, hoverVariant, button = true, ...rest} = props;
    const Comp = button ? Button : IconButton;
    const [hover, setHover] = useState(false);
    

    return (<Comp variant={hover ? hoverVariant : variant} {...rest} />)

  }

export const VariableState = () => {
  const [variant, setVariant] = useState<ButtonProps['variant']>('filled');
  const [hoverVariant, setHoverVariant] = useState<ButtonProps['variant']>('filled');
  const [isButton, setIsButton] = useState(true);

  return (
  <Box display="flex" alignItems="center" g={2} flexDirection="column">
    <Box display="flex" alignItems="center" g={2} my={5} flexWrap="wrap">
      <span>Variants:</span>
      <Menu.Button
        trigger={<Button variant={variant} color="primary">{`${variant![0].toUpperCase()}${variant?.substring(1)}`}</Button>}>
         <Menu.Item selected={variant==='filled'} onClick={()=> setVariant('filled')} >Filled</Menu.Item>
         <Menu.Item selected={variant==='outlined'} onClick={()=> setVariant('outlined')}>Outlined</Menu.Item>
         <Menu.Item selected={variant==='text'} onClick={()=> setVariant('text')}>Text</Menu.Item>
         <Menu.Item selected={variant==='ghost'} onClick={()=> setVariant('ghost')}>Ghost</Menu.Item>
      </Menu.Button>
      <span></span>
      <span>Hover Variants:</span>
      <Menu.Button
        trigger={<Button variant={hoverVariant} color="inherit">{`${hoverVariant![0].toUpperCase()}${hoverVariant?.substring(1)}`}</Button>}>
         <Menu.Item selected={hoverVariant==='filled'} onClick={()=> setHoverVariant('filled')}>Filled</Menu.Item>
         <Menu.Item selected={hoverVariant==='outlined'} onClick={()=> setHoverVariant('outlined')}>Outlined</Menu.Item>
         <Menu.Item selected={hoverVariant==='text'}   onClick={()=> setHoverVariant('text')}>Text</Menu.Item>
         <Menu.Item selected={hoverVariant==='ghost'} onClick={()=> setHoverVariant('ghost')}>Ghost</Menu.Item>
      </Menu.Button>
    </Box>
    <Box display="flex" alignItems="center" g={2} my={5} flexWrap="wrap">
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="primary" className="px-3 py-1.5">Primary</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="secondary" className="px-3 py-1.5">Secondary</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="success" className="px-3 py-1.5">Success</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="error" className="px-3 py-1.5">Error</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="warning" className="px-3 py-1.5">Warning</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="info" className="px-3 py-1.5">Info</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="light" className="px-3 py-1.5">Light</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="dark" className="px-3 py-1.5">Dark</VariableButton>
      <VariableButton button={isButton} variant={variant} hoverVariant={hoverVariant} color="inherit" className="px-3 py-1.5">inherit</VariableButton>
    </Box>
    <Box display="flex" alignItems="center" g={2} my={5} flexWrap="wrap">
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="primary"><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="secondary"><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="success" ><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="error" ><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="warning" ><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="info" ><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="light" ><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="dark" ><MaterialIcon icon="home"/></VariableButton>
      <VariableButton button={false} variant={variant} hoverVariant={hoverVariant} color="inherit" ><MaterialIcon icon="home"/></VariableButton>
    </Box>
  </Box>
  );
}

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
        target={anchorEl}
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
