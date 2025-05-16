import { useState } from "react";

import { Box, Button, Checkbox } from "../../..";
import {Fade} from '../fade';
import { Slide } from "./slide";
import React from "react";

const config = {
  component: Slide,
  title: "Animation/Slide",
};

export const Basic = function () {
  const [show, setShow] = useState(false);
  const [direction, setDirection] = useState<any>("start");

  const toggle = function () {
    setShow((prev) => !prev);
  };

  return (
    <Box>
      <Box d="flex" alignItems="center">
        <Button color="primary" onClick={toggle}>
          Toggle
        </Button>
        <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="start"
            label="Start"
            checked={direction === "start"}
            onChange={(e) => setDirection("start")}
          />
        </Box>
        <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="end"
            label="End"
            checked={direction === "end"}
            onChange={(e) => setDirection("end")}
          />
        </Box>
        <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="up"
            label="Up"
            checked={direction === "up"}
            onChange={(e) => setDirection("up")}
          />
        </Box>
        
        <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="down"
            label="Down"
            checked={direction === "down"}
            onChange={(e) => setDirection("down")}
          />
        </Box>
      </Box>
      <Slide in={show} direction={direction}>
        <Box
          mt={2}
          rounded
          bg="secondary"
          style={{ width: 300, height: 100 }}
        ></Box>
      </Slide>
    </Box>
  );
};

export default config;
