import * as React from "react";
import { useCallback, useRef, useState } from "react";

import { BootstrapIcon } from "../../../icons/bootstrap-icon";
import { Box } from "../Box";
import { 
  ButtonGroup, 
  Button,
  Menu, 
  MenuProps,
  MenuList,
  MenuItem,
  MenuHandler,
  Divider,
  MenuDivider,
  MenuHeader
} from "../..";
import { MaterialIcon } from "../../../icons/material-icon";


const config = {
  component: Menu,
  title: "Components/Menu",
};

export const Basic = () => {
  const [show, setShow] = React.useState(false);
  const [target, setTarget] = React.useState<HTMLElement | null>(null);

  function showMenu() {
    setShow(true);
  }

  function hideMenu() {
    setShow(false);
  }

  return (
    <Box>
      <Button
        ref={setTarget}
        onClick={showMenu}
        variant="outlined"
        color="green"
        className="relative"
        >
        Menu
      </Button>
      <Menu 
        //target={target} 
        placement="bottom-start"
        open={show} 
        arrow 
        target={target}
        handler={(open) => open ? showMenu() : hideMenu()}>

        <MenuList>
          <MenuItem >Option 1</MenuItem>
          <MenuItem >Option 2</MenuItem>
          <MenuItem >Option 3</MenuItem>

        </MenuList>
      </Menu>
    </Box> 
  );
};

export const SplitButton = () => {
  const [show, setShow] = React.useState(false);
  const [target, setTarget] = React.useState<HTMLElement | null>(null);

  function showMenu() {
    setShow(true);
  }

  function hideMenu() {
    setShow(false);
  }

  return (
    <Box>
      <ButtonGroup>
        <Button>Action</Button>
        <Button
          ref={setTarget}
          onClick={showMenu}
          className="min-w-0 px-2 py-2"
        >
          <BootstrapIcon icon="caret-down-fill" />
        </Button>
      </ButtonGroup>
      <Menu navigation target={target} show={show} onHide={hideMenu}>
        <MenuItem onClick={hideMenu}>Option 1</MenuItem>
        <MenuItem onClick={hideMenu}>Option 2</MenuItem>
        <MenuItem onClick={hideMenu}>Option 3</MenuItem>
      </Menu>
    </Box>
  );
};

export const Header = () => {
  const [show, setShow] = React.useState(false);
  const [target, setTarget] = React.useState<HTMLElement | null>(null);

  function showMenu() {
    setShow(true);
  }

  function hideMenu() {
    setShow(false);
  }

  return (
    <Box>
      <Button
        ref={setTarget}
        onClick={showMenu}
        bgColor="primary"
      >
        Menu
      </Button>
      <Menu navigation target={target} show={show} onHide={hideMenu}>
        <MenuHeader>Options</MenuHeader>
        <MenuItem onClick={hideMenu} text="Option 1 C" label="Ctr C"/>
        <MenuItem onClick={hideMenu}>Option 2</MenuItem>
        <MenuItem onClick={hideMenu}>Option 3</MenuItem>
      </Menu>
    </Box>
  );
};

const MyButton = React.forwardRef(({ m = 2, color = "blue", ...rest }:any, ref) => 
  (<Button color={color} {...rest} className="m-2" ref={ref}/>));

export const Positions = () => {
  const [open, setOpen] = useState(false);

  const [menuProps, setMenuProps] = useState<Partial<MenuProps>>({});

  const refs = useRef<{
    timer?: number;
    clicked: boolean;
  }>({
    clicked: false,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const placement = e.currentTarget?.textContent || "bottom-start";
    setMenuProps({
      target: e.currentTarget,
      placement: placement as MenuProps["placement"],
    });
    console.log("placement:", placement);
    
    clearTimeout(refs.current.timer);
    refs.current.clicked = true;
    refs.current.timer = window.setTimeout(() => {
      setOpen(true);
      refs.current.clicked = false;
    }, 10);
  };

  const hide = useCallback(() => {
    if (!refs.current.clicked) {
      setOpen(false);
      setMenuProps({
        placement: menuProps?.placement,
      });
    }
  }, []);

  return (
    <Box style={{ width: 500 }} m="auto">
      <Menu
        {...menuProps}
        open={open}
        handler={(open) => !open && hide()}
      >
        <MenuList>
          <MenuItem>Option 1</MenuItem>
          <MenuItem>Option 2</MenuItem>
          <MenuItem>Option 3</MenuItem>
          <MenuDivider/>
          <MenuHeader>Header One</MenuHeader>
          <MenuItem>Option 4</MenuItem>
          <MenuItem>Option 5</MenuItem>
        </MenuList>
      </Menu>
      <Box display="flex" justifyContent="center">
        <MyButton onClick={handleClick}>top-start</MyButton>
        <MyButton onClick={handleClick}>top</MyButton>
        <MyButton onClick={handleClick}>top-end</MyButton>
      </Box>
      <Box display="flex" justifyContent="center">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="start"
          style={{ width: "50%" }}
        >
          <MyButton onClick={handleClick}>left-start</MyButton>
          <MyButton onClick={handleClick}>left</MyButton>
          <MyButton onClick={handleClick}>left-end</MyButton>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="end"
          style={{ width: "50%" }}
        >
          <MyButton onClick={handleClick}>right-start</MyButton>
          <MyButton onClick={handleClick}>right</MyButton>
          <MyButton onClick={handleClick}>right-end</MyButton>
        </Box>
      </Box>
      <Box display="flex" justifyContent="center">
        <MyButton onClick={handleClick}>bottom-start</MyButton>
        <MyButton onClick={handleClick}>bottom</MyButton>
        <MyButton onClick={handleClick}>bottom-end</MyButton>
      </Box>
    </Box>
  );
};

export function AllPlacement() {
  return (
    <>
    <div className="full-w flex items-center justify-center h-screen w-screen">
      <div className="w-[500px]">
      <div className="mb-3 flex gap-3">
        <Menu placement="top">
          <MenuHandler>
            <Button>top</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="top-start">
          <MenuHandler>
            <Button>top-start</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="top-end">
          <MenuHandler>
            <Button>top-end</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
      </div>
      <div className="mb-3 flex gap-3">
        <Menu placement="right">
          <MenuHandler>
            <Button>right</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="right-start">
          <MenuHandler>
            <Button>right-start</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="right-end">
          <MenuHandler>
            <Button>right-end</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
      </div>
      <div className="mb-3 flex gap-3">
        <Menu placement="bottom">
          <MenuHandler>
            <Button>bottom</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="bottom-start">
          <MenuHandler>
            <Button>bottom-start</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="bottom-end">
          <MenuHandler>
            <Button>bottom-end</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
      </div>
      <div className="flex gap-3">
        <Menu placement="left">
          <MenuHandler>
            <Button>left</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="left-start">
          <MenuHandler>
            <Button>left-start</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
        <Menu placement="left-end">
          <MenuHandler>
            <Button>left-end</Button>
          </MenuHandler>
          <MenuList>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <MenuItem>Menu Item 3</MenuItem>
          </MenuList>
        </Menu>
      </div></div></div>
    </>
  );
}


export function NestedMenu() {
  const [openMenu, setOpenMenu] = React.useState(false);
  const innerRef = React.useRef()
  return (
    <Box display="flex" justifyContent="center">
      <Menu.Button content={<Button color="slate"> Menu</Button>} listProps={{nav: false}}>
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
        <MenuItem text="Nested Item1" menuProps={{offset: 15}} listProps={{nav: false}}>
          <MenuItem>Nested Item 1</MenuItem>
          <MenuItem>Nested Item 2</MenuItem>
          <MenuItem>Nested Item 3</MenuItem>
        </MenuItem>
        <MenuItem>Menu Item 3</MenuItem>
        <MenuItem text=" Nested Item 2" menuProps={{offset: 15}} listProps={{nav: false}}>
          <MenuItem>Nested Item 2 1</MenuItem>
          <MenuItem>Nested Item 2 2</MenuItem>
          <MenuItem>Nested Item 2 3</MenuItem>
          <MenuItem text=" Nested Item 2 4" menuProps={{offset: 15}} listProps={{nav: false}}>
            <MenuItem>Nested Item 4 1</MenuItem>
            <MenuItem>Nested Item 4 2</MenuItem>
            <MenuItem>Nested Item 4 3</MenuItem>
          </MenuItem>
        </MenuItem>
      </Menu.Button>
    </Box>
  );
}

export default config;
