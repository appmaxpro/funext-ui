import { useState } from "react";

import { Box, Button } from "../../..";
import { Grow } from "./grow";

const config = {
  component: Grow,
  title: "Animation/Grow",
};

export const Basic = function () {
  const [show, setShow] = useState(false);
  const toggle = function () {
    setShow((prev) => !prev);
  };

  return (
    <Box>
      <Button color="primary" onClick={toggle}>
        Toggle
      </Button>
      <Grow in={show}>
        <Box
          mt={2}
          shadow
          rounded
          bg="secondary"
          style={{ width: 300, height: 100 }}
        ></Box>
      </Grow>
    </Box>
  );
};

export default config;
