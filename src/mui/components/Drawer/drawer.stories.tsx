import * as React from "react";

import { Box } from "../Box";
import { Button } from "../Button";
import { Input } from "../Input";
import { Drawer, DrawerProps } from "./Drawer";
import { ClickAwayListener } from "../../../core";
import Panel from "../Panel";
import Checkbox from "../Checkbox";
import {DashboardLayout} from "./demo/DashboardLayout";
import { ScreenSizeProvider } from "../Screen";

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
        direction="start"
        open={show}
        onClose={hideDrawer}
        backdrop={{
          className: "inset-0 bg-slate-800/[.3] dark:bg-slate-300/[.3]",
        }}
        dismiss={{}}
        className="h-full"
        panelProps={{
          style: {
            width: 320,
          },
        }}
        style={() => ({
          width: 320,
        })}
      >
        <Box
          d="flex"
          border
          flexGrow={1}
          alignItems="center"
          justifyContent="center"
          style={{ height: "100%" }}
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
      <Button size="sm" color="primary" onClick={() => showDrawer()}>
        Show drawer
      </Button>
      <Drawer
        direction="start"
        open={show}
        onClose={hideDrawer}
        style={{ width: 320 }}
      >
        <ClickAwayListener onClickAway={hideDrawer}>
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
        </ClickAwayListener>
      </Drawer>
    </div>
  );
};

function DrawerDemo({
  placement,
  clickAway,
  variant,
}: {
  placement: "start" | "top" | "end" | "bottom";
  clickAway?: boolean;
  variant: DrawerProps['variant'];
}) {
  const [show, setShow] = React.useState<boolean>(false);

  const showDrawer = () => {
    setShow(true);
  };

  const hideDrawer = React.useCallback(() => {
    setShow(false);
  }, []);

  return (
    <Box d="flex" mx={2}>
      <Button
        size="sm"
        color="primary"
        onClick={() => (show ? hideDrawer() : showDrawer())}
      >
        Open
      </Button>

      <Box
        d="flex"
        flexDirection={["start", "end"].includes(placement) ? "row" : "column"}
      >
        {(variant !== 'temporary') && <Box> Drawer before</Box>}
        <Drawer
          variant={variant}
          direction={placement}
          open={show}
          onClose={hideDrawer}
          panelProps={{
            style: {
              width: ["start", "end"].includes(placement) ? 320 : undefined,
              height: ["top", "bottom"].includes(placement) ? 320 : undefined,
            },
          }}
          style={{
            width: ["start", "end"].includes(placement) ? 320 : "100%",
            height: ["top", "bottom"].includes(placement) ? 320 : "100%",
          }}
          popperProps={{
            dismiss:{},
            backdrop:{
              className: "inset-0 bg-slate-800/[.3] dark:bg-slate-300/[.3]",
            }
          }}
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
        {(variant !== 'temporary') && <Box> Drawer after</Box>}
      </Box>
    </Box>
  );
}

export const Positions = () => {
  const [clickAway, setClickAway] = React.useState(true);
  const [variant, setVariant] = React.useState<DrawerProps['variant']>("permanent");
  const [show, setShow] = React.useState<boolean>(false);
  const [pos, setPos] = React.useState<string>("start");
  return (
    <Box>
      <Checkbox
        checked={clickAway}
        onChange={() => setClickAway((clickAway) => !clickAway)}
        label={"Close on click away"}
      />

      <br />
      <Box d="flex">
        <Checkbox
          label="Permanent"
          checked={variant === "permanent"}
          onChange={() => setVariant("permanent")}
        />
        <Checkbox
          label="Persistent"
          checked={variant === "persistent"}
          onChange={() => setVariant("persistent")}
        />
        <Checkbox
          label="Temporary"
          checked={variant === "temporary"}
          onChange={() => setVariant("temporary")}
        />
      </Box>
      <Box d="flex" gap={4}>
        <Checkbox
          label="Start"
          checked={pos === "start"}
          onChange={() => setPos("start")}
        />
        <Checkbox
          label="End"
          checked={pos === "end"}
          onChange={() => setPos("end")}
        />
        <Checkbox
          label="Top"
          checked={pos === "top"}
          onChange={() => setPos("top")}
        />
        <Checkbox
          label="Bottom"
          checked={pos === "bottom"}
          onChange={() => setPos("bottom")}
        />
      </Box>
      <br />
      {pos === "start" && (
        <DrawerDemo variant={variant} placement="start" clickAway={clickAway} />
      )}
      {pos === "top" && (
        <DrawerDemo variant={variant} placement="top" clickAway={clickAway} />
      )}
      {pos === "end" && (
        <DrawerDemo variant={variant} placement="end" clickAway={clickAway} />
      )}
      {pos === "bottom" && (
        <DrawerDemo
          variant={variant}
          placement="bottom"
          clickAway={clickAway}
        />
      )}
    </Box>
  );
};

export const Shadow = () => {
  const [show, setShow] = React.useState<boolean>(false);

  const showDrawer = () => {
    setShow(true);
  };

  const hideDrawer = React.useCallback(() => {
    setShow(false);
  }, []);

  return (
    <div>
      <Button size="sm" color="primary" onClick={() => showDrawer()}>
        Show drawer
      </Button>
      <Drawer direction="start" open={show} onClose={hideDrawer} elevation={3}>
        <Panel>
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
        </Panel>
      </Drawer>
    </div>
  );
};


export const Dashboard = ()=> 
  <ScreenSizeProvider>
    <DashboardLayout>
      <span>Childs</span>
    </DashboardLayout>
  </ScreenSizeProvider> ;

export default config;
