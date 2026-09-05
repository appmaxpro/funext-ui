import { useState } from "react";

import { Box } from "../box";
import { Collapse, Button, Text } from "../../mui";

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
    <Box className="flex flex-col items-start justify-start">
      <Button onClick={toggle}>
        Toggle
      </Button>
      <Collapse open={show}>
        <Box
          mt={2}
          rounded
          bg="primary"
          style={{ width: 300 }}
        >
          <Text>
              A live, editable example of the Framer Motion API. Explore this online Framer Motion: Accordion sandbox and experiment with it yourself.
          </Text>
        </Box>
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
    <Box className="flex items-start">
      <Button  onClick={toggle}>
        Toggle
      </Button>
      <Collapse open={show} horizontal>
        <Box
          mt={2}
          rounded
          bg="gray-300"
          style={{ height: 100, width: 300 }}
        >
          <Text>
              A live, editable example of the Framer Motion API. Explore this online Framer Motion: Accordion sandbox and experiment with it yourself.
          </Text>

        </Box>
      </Collapse>
    </Box>
  );
};

export default config;
