import * as React from "react";
import { useCallback, useRef, useState } from "react";

import { Box } from "../Box";
import {
  ButtonGroup,
  Button,
  Menu,
  MenuProps,
  MenuItem,
  Divider,
  MenuDivider,
  MenuHeader,
  List,
} from "../..";
import { ChevronDown } from "../internal/svg-icons/chevron";

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
        color="success"
        className="relative"
      >
        Menu
      </Button>
      <Menu
        //target={target}
        placement="bottom-start"
        open={show}
        arrow
        reference={target}
        onOpenChange={(open) => (open ? showMenu() : hideMenu())}
      >
        <MenuItem>Option 1</MenuItem>
        <MenuItem>Option 2</MenuItem>
        <MenuItem>Option 3</MenuItem>
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
        <Menu.DropDown>
          <Button
            ref={setTarget}
            onClick={showMenu}
            className="min-w-0 px-2 py-2"
          >
            <ChevronDown />
          </Button>
          <Menu>
            <MenuItem >Option 1</MenuItem>
            <MenuItem >Option 2</MenuItem>
            <MenuItem >Option 3</MenuItem>
          </Menu>
        </Menu.DropDown>

      </ButtonGroup>
      
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
      <Button ref={setTarget} onClick={showMenu} color="primary">
        Menu
      </Button>
      <Menu navigation reference={target} open={show} onOpenChange={hideMenu}>
        <span className="p-3">Options</span>
        <MenuItem  text="Option 1 C" label="Ctr C" />
        <MenuItem >Option 2</MenuItem>
        <MenuItem >Option 3</MenuItem>
      </Menu>
    </Box>
  );
};

const MyButton = React.forwardRef(
  ({ m = 2, color = "blue", ...rest }: any, ref) => (
    <Button color={color} {...rest} className="m-2" ref={ref} />
  ),
);

export const Positions = () => {
  const [open, setOpen] = useState(false);

  const [menuProps, setMenuProps] = useState<Partial<MenuProps>>({
    dismiss: {
      itemPress: true,
    },
  });

  const refs = useRef<{
    timer?: number;
    clicked: boolean;
  }>({
    clicked: false,
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const placement = e.currentTarget?.textContent || "bottom-start";
    setMenuProps((m) => ({
      ...m,
      placement: placement as MenuProps["placement"],
      reference: e.target
    }));
    console.log("placement:", placement);

    clearTimeout(refs.current.timer);
    refs.current.clicked = true;
    refs.current.timer = window.setTimeout(() => {
      setOpen(true);
      refs.current.clicked = false;
    }, 10);
  };

  const hide = useCallback(() => {
    //if (!refs.current.clicked) {
      setOpen(false);
      /*
      setMenuProps((m)=>({
        ...m,
        placement: menuProps?.placement,
        reference: null
      }));*/
    //}
  }, []);

  return (
    <Box style={{ width: 500 }} m="auto">
      <List.Provider
        value={{
          hover: true,
          active: true,
          focus: true,
          global: true,
          item: {
            disabled: "",
            className:
              "px-3 py-2 bg-secondary/25 rounded-0 hover:bg-header-min active:bg-slate-200 dark:active:bg-slate-700 focus:bg-slate-200 dark:focus:bg-slate-700",
          },
        }}
      >
        <Menu
          {...menuProps}
          open={open}
          onOpenChange={(open) => !open && hide()}
        >
          <MenuItem>Option 1</MenuItem>
          <MenuItem>Option 2</MenuItem>
          <MenuItem>Option 3</MenuItem>
          <MenuDivider />
          <MenuHeader>Header One</MenuHeader>
          <MenuItem>Option 4</MenuItem>
          <MenuItem>Option 5</MenuItem>
        </Menu>
      </List.Provider>
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
              <Button>top</Button>
              <MenuItem>Menu Item 1</MenuItem>
              <MenuItem>Menu Item 2</MenuItem>
              <MenuItem>Menu Item 3</MenuItem>
            </Menu>
            <Menu placement="top-start">
              <Button>top-start</Button>
              <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
            <Menu placement="top-end">
                <Button>top-end</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
          </div>
          <div className="mb-3 flex gap-3">
            <Menu placement="right">
                <Button>right</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
            <Menu placement="right-start">
                <Button>right-start</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
            <Menu placement="right-end">
                <Button>right-end</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
          </div>
          <div className="mb-3 flex gap-3">
            <Menu placement="bottom">
                <Button>bottom</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
            <Menu placement="bottom-start">
                <Button>bottom-start</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
            <Menu placement="bottom-end">
                <Button>bottom-end</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
          </div>
          <div className="flex gap-3">
            <Menu placement="left">
                <Button>left</Button>
             
              
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
              
            </Menu>
            <Menu placement="left-start">
              
                <Button>left-start</Button>
              
              
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
              
            </Menu>
            <Menu placement="left-end">
                <Button>left-end</Button>
                <MenuItem>Menu Item 1</MenuItem>
                <MenuItem>Menu Item 2</MenuItem>
                <MenuItem>Menu Item 3</MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </>
  );
}

export function NestedMenu() {
  const [openMenu, setOpenMenu] = React.useState(false);
  const innerRef = React.useRef();
  return (
    <Box display="flex" justifyContent="center">
      <Menu trigger={<Button color="inherit"> Menu</Button>}>
        <MenuItem>Menu Item 1</MenuItem>
        <MenuItem>Menu Item 2</MenuItem>
        <Menu>
          <MenuItem>Nested Menu1</MenuItem>
          <MenuItem>Nested Item 1</MenuItem>
          <MenuItem>Nested Item 2</MenuItem>
          <MenuItem>Nested Item 3</MenuItem>
        </Menu>
        <MenuItem>Menu Item 3</MenuItem>
        <Menu.Sub>
          <MenuItem>Nested Menu2</MenuItem>
          <Menu>
            <MenuItem>Nested Item 2 1</MenuItem>
            <MenuItem>Nested Item 2 2</MenuItem>
            <MenuItem>Nested Item 2 3</MenuItem>
            <Menu.Sub>
              <MenuItem>Nested Menu2 Menu1</MenuItem>
              <Menu>
                <MenuItem>Nested Item 4 1</MenuItem>
                <MenuItem>Nested Item 4 2</MenuItem>
                <MenuItem>Nested Item 4 3</MenuItem>
              </Menu>
            </Menu.Sub>
          </Menu>
        </Menu.Sub>
      </Menu>
    </Box>
  );
}

export default config;
