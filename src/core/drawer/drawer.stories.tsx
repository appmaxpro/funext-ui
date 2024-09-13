import * as React from "react";

import { Box } from "../box";
import { InputLabel } from "../input-label";
import { ClickAwayListener } from "../click-away-listener";
import { Drawer, Input,  Button, Checkbox} from "../../mui";

const config = {
  component: Drawer,
  title: "Components/Drawer",
};

export const Backdrop = () => {
  const [show, setShow] = React.useState<boolean>(false);

  const showDrawer = () => {
    setShow(true);
  };

  const hideDrawer = React.useCallback(() => {
    setShow(false);
  }, []);

  return (
    <div>
      <Button
        size="sm"
        color="primary"
        onClick={() => (show ? hideDrawer() : showDrawer())}
      >
        Show drawer
      </Button>
      <Drawer
        className="bg-white flex"
        placement="left"
        open={show}
        onClose={hideDrawer}
        overlay
      >
        <Box
          d="flex"
          border
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          style={{ width: 320 }}
        >
          I am drawer
        </Box>
      </Drawer>
    </div>
  );
};

export const Basic = () => {
  const [show, setShow] = React.useState<boolean>(false);

  const showDrawer = () => {
    setShow(true);
  };

  const hideDrawer = React.useCallback(() => {
    setShow(false);
  }, []);

  return (
    <div>
      <Button size="sm"  onClick={() => showDrawer()}>
        Show drawer
      </Button>
      <Drawer
        className="bg-white flex"
        placement="left"
        open={show}
        onClose={hideDrawer}
        dismiss={{
          outsidePress: true
        }}
        overlay={false}
      >
          <Box
            d="flex"
            border
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
            style={{ width: 320 }}
          >
            I am drawer
          </Box>
      </Drawer>
    </div>
  );
};

function DrawerDemo({clickAway}:{clickAway?:boolean}) {

  const [show, setShow] = React.useState<boolean>(false);
  const [placement, setPlacement] = React.useState<string>("left");

  const showDrawer = () => {
    setShow(true);
  };

  const hideDrawer = React.useCallback(() => {
      if(clickAway){
        //setShow(false);
      }
  }, []);

  const hidePlacement = React.useCallback((newPlacement:string) => {
    if(show){
      setShow(false);
      setPlacement(newPlacement);
    } else {

      setPlacement(newPlacement);
      if (placement != newPlacement) {
        setTimeout(()=> setShow(true), 1000);
      } else {
        setShow(true)
      }
    }
}, [placement, show]);


  return (
    <Box className="flex flex-col gap-4 relative w-full h-screen">
      <Box className="p-4 bg-header-med inline-flex flex-row gap-3">

        <Button
          size="sm"
          color="primary"
          onClick={() => hidePlacement('left')}
        >
          Left
        </Button>
        <Button
          size="sm"
          color="primary"
          onClick={() => hidePlacement('right')}
        >
          right
        </Button>
        <Button
          size="sm"
          color="primary"
          onClick={() => hidePlacement('top')}
        >
          top
        </Button>
        <Button
          size="sm"
          color="primary"
          onClick={() => hidePlacement('bottom')}
        >
          bottom
        </Button>
      </Box>
      <Box className="grow bg-header-max relative overflow-y-hidden">
        <Drawer
          className="bg-slate-50 flex grow"
          placement={placement}
          open={show}
          onClose={hideDrawer}
          overlay={false}
          dismiss={{
            outsidePress: !!clickAway
          }}
          strategy="absolute"
        >
        <Box
              d="flex"
              border
              flexGrow={1}
              alignItems="center"
              justifyContent="center"
              style={{ width: 320 }}
            >
              I am drawer
            </Box>,
        </Drawer>
      </Box>
    </Box>
  );
}

export const Positions = () => {
  const [clickAway, setClickAway] = React.useState(true);
  return (
    <Box>
      
      <Checkbox 
          color="success"
          checked={clickAway}
          label="Close on click away"
          onChange={() => setClickAway((clickAway) => !clickAway)}/>
      
      <br />
      <DrawerDemo clickAway={clickAway}/>
    </Box>
  );
};

export const Shadow = () => {
  const [show, setShow] = React.useState<boolean>(false);
  const [closeActive, setCloseActive] = React.useState<boolean>(false);
  const showDrawer = () => {
    setCloseActive(false);
    setShow(true);
    setTimeout(()=> setCloseActive(true), 500);
  };

  const hideDrawer = React.useCallback(() => {
    if(closeActive)
        setShow(false);
  }, [show, closeActive]);

  return (
    <div>
      <Button size="sm" onClick={() => showDrawer()}>
        Show drawer
      </Button>
      <Drawer
        className="bg-white flex shadow"
        placement="left"
        open={show}
        onClose={hideDrawer}
      >
          <Box
            d="flex"
            border
            flexGrow={1}
            alignItems="center"
            justifyContent="center"
            style={{ width: 320 }}
          >
            I am drawer
          </Box>
      </Drawer>
    </div>
  );
};

export default config;
