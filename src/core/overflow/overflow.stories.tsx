import * as React from 'react';

import type { Meta } from "@storybook/react";

import { useState } from "react";
import { Box } from "../box";
import { Button } from "../../mui";
import { useRefs } from "../hooks";
import { Menu, MenuItem, MenuHandler, MenuList } from "../../mui";

import { useIsOverflowItemVisible, useOverflowMenu } from "./hooks";
import { Overflow } from "./overflow";
import { OverflowItem, OverflowItemProps } from "./overflow-item";

const meta = {
  title: "Components/Overflow",
  component: Overflow,
} satisfies Meta<typeof Overflow>;

export default meta;

const itemIds = new Array(12).fill(0).map((_, i) => i.toString());

export const Basic = () => {
  return (
    <Overflow>
      <Box
        p={2}
        d="flex"
        flex={1}
        flexWrap="nowrap"
        border
        overflow="hidden"
        flexDirection="row"
        style={{ minWidth: 0, width: 400, height: 60, maxHeight: 60, resize: "horizontal" }}
      >
        {itemIds.map((i) => (
          <OverflowItem key={i} id={i}>
            <Button className='text-nowrap'>
                Item {i}
              </Button>
          </OverflowItem>
        ))}
        <Box px={1}>
          <OverflowMenu itemIds={itemIds} />
        </Box>
      </Box>
    </Overflow>
  );
};

const OverflowMenuItem: React.FC<Pick<OverflowItemProps, "id">> = React.forwardRef ((props, ref) => {
  const { id } = props;
  const isVisible = useIsOverflowItemVisible(id);

  if (isVisible) {
    return null;
  }

  // As an union between button props and div props may be conflicting, casting is required
  return <MenuItem ref={ref}>Item {id}</MenuItem>;
});

const OverflowMenu: React.FC<{ itemIds: string[] }> = ({ itemIds }) => {
  const { ref, overflowCount, isOverflowing } =
    useOverflowMenu<HTMLButtonElement>();

  const [show, setShow] = useState(false);
  const [target, setTarget] = useState<HTMLButtonElement | null>(null);

  const buttonRef = useRefs(ref, (el: HTMLButtonElement | null) => {
    setTarget(el);
  });

  function showMenu() {
    setShow(true);
  }

  function hideMenu() {
    setShow(false);
  }

  if (!isOverflowing) {
    return null;
  }

  return (
    <Box>
      <Menu target={target} open={show} handler={setShow}>
        <MenuHandler ref={buttonRef}>
          <Button onClick={showMenu}>
            +{overflowCount} items
          </Button>
        </MenuHandler>
        <MenuList>
          {itemIds.map((i) => {
            return <OverflowMenuItem key={i} id={i} role="menuitem"/>;
          })}
        </MenuList>
      </Menu>
    </Box>
  );
};
