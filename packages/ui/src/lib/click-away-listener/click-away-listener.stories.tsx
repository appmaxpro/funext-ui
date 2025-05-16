import { useState } from "react";

import { ClickAwayListener } from "./click-away-listener";
import { Box, Button } from "../..";
import React from "react";
import Popper from "../../components/Popper";

const config = {
  component: ClickAwayListener,
  title: "Core/ClickAwayListener",
};

export const Basic = () => {
  const [open, setOpen] = useState(false);
  const [targetEl, setTargetEl] = useState<HTMLButtonElement | null>(null);

  const toggle = () => setOpen((v) => !v);

  return (
    <div>
      <Button color="primary" ref={setTargetEl} onClick={toggle}>
        Show popper
      </Button>
      <Popper open={!!open} target={targetEl} offset={[0, 4]}>
        <ClickAwayListener onClickAway={toggle}>
          <Box p={2} bg="secondary" color="light" border rounded shadow>
            <p>Sample Buttons</p>
            <p>Click outside to close the popper</p>
            <Button mx={2} color="light">
              Button 1
            </Button>
            <Button mx={2} color="light">
              Button 2
            </Button>
          </Box>
        </ClickAwayListener>
      </Popper>
    </div>
  );
};

export default config;
