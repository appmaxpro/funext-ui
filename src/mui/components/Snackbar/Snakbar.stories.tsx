import { useState } from "react";

import { Box } from "../Box";
import { Button } from "../Button";
import { Grid, Grow, Slide, SxBox } from "../../..";
import { Snackbar, SnackbarCloseReason, SnackbarOrigin } from "./Snackbar";
import { Checkbox } from "../Checkbox";
import React from "react";

const config = {
  component: Snackbar,
  title: "Components/Snackbar",
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


interface State extends SnackbarOrigin {
  open: boolean;
}

export function PositionedSnackbar() {

  const [direction, setDirection] = useState<any>("start");
  const [slide, setSlide] = useState<boolean>(true);

  const [state, setState] = React.useState<State>({
    open: false,
    vertical: 'top',
    horizontal: 'center',
  });

  const { vertical, horizontal, open } = state;

  const handleClick = (newState: SnackbarOrigin) => () => {
    setState({ ...newState, open: true });
  };

  const handleClose = (event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,) => {
      if (reason === 'clickaway') {
        return;
      }
    setState({ ...state, open: false });
  };

  const buttons = (
    <React.Fragment>
      <SxBox sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button onClick={handleClick({ vertical: 'top', horizontal: 'center' })}>
          Top-Center
        </Button>
      </SxBox>
      <Grid container sx={{ justifyContent: 'center' }}>
        <Grid item xs={6}>
          <Button onClick={handleClick({ vertical: 'top', horizontal: 'start' })}>
            Top-Left
          </Button>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Button onClick={handleClick({ vertical: 'top', horizontal: 'end' })}>
            Top-Right
          </Button>
        </Grid>
        <Grid item xs={6}>
          <Button onClick={handleClick({ vertical: 'bottom', horizontal: 'start' })}>
            Bottom-Left
          </Button>
        </Grid>
        <Grid item xs={6} sx={{ textAlign: 'right' }}>
          <Button onClick={handleClick({ vertical: 'bottom', horizontal: 'end' })}>
            Bottom-Right
          </Button>
        </Grid>
      </Grid>
      <SxBox sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button onClick={handleClick({ vertical: 'bottom', horizontal: 'center' })}>
          Bottom-Center
        </Button>
      </SxBox>
    </React.Fragment>
  );
  
  return (
    <SxBox sx={{ width: 500 }}>
      <Box d="flex" alignItems="center">
      <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="slide"
            label="Slide"
            checked={slide}
            onChange={(e) => setSlide(!slide)}
          />
        </Box>
        <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="v"
            label="Vertical"
            checked={direction === "v"}
            onChange={(e) => setDirection('v')}
          />
        </Box>
        <Box m={0} ms={2}>
          <Checkbox
            className="me-1"
            value="h"
            label="Horizontal"
            checked={direction === "h"}
            onChange={(e) => setDirection('h')}
          />
        </Box>
      </Box>
      {buttons}
      <Snackbar
        anchorOrigin={{ vertical, horizontal }}
        open={open}
        onClose={handleClose}
        message="I love snacks"
        key={vertical + horizontal}
        side={direction}
        slide={slide}
        autoHideDuration={3000}
        //direction={direction === 'grow' ? undefined : direction}
      />
    </SxBox>
  );
}

export default config;
