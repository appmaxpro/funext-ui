import { useState } from "react";

import { Box } from "../box";
import { Collapse, Button } from "../../mui";

const config = {
  component: Collapse,
  title: "Animation/Collapse",
};

export const Basic = function () {
  const [show, setShow] = useState(false);
  const toggle = function () {
    setShow((prev) => !prev);
  };

  return (
    <Box>
      <Button onClick={toggle}>
        Toggle
      </Button>
      <Collapse open={show}>
        <Box
          mt={2}
          rounded
          bg="primary"
          style={{ width: 300, height: 100 }}
        ></Box>
      </Collapse>
    </Box>
  );
};

export const Horizontal = function () {
  const [show, setShow] = useState(false);
  const toggle = function () {
    setShow((prev) => !prev);
  };

  return (
    <Box>
      <Button  onClick={toggle}>
        Toggle
      </Button>
      <Collapse open={show} horizontal>
        <Box
          mt={2}
          rounded
          bg="gray-300"
          style={{ width: 300, height: 100 }}
        ></Box>
      </Collapse>
    </Box>
  );
};

export default config;
