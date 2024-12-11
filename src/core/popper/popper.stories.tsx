import { useState } from "react";
import * as React from "react";

import { Box } from "../box";
import { ClickAwayListener } from "../click-away-listener";
import { Grow } from "../grow";
import { Panel, Popper as Popper2 } from "../../mui";
import {
  Popover,
  PopoverContent,
  PopoverHandler,
  Popper as Popper3,
  Tooltip,
  PopperHandler,
  Button
} from "../../mui";


import { Input } from "../../mui";
import { InputLabel } from "../input-label";
import { useClassNames } from "../styles";
import { Popper } from "./popper";
import { usePopperTrigger } from "./use-popper-trigger";

import "./test.scss";
// framer-motion
import { AnimatePresence, m, domAnimation, LazyMotion } from "framer-motion";
import { FloatingPortal } from "@floating-ui/react";
// @floating-ui
// @floating-ui
import {
  offset as fuiOffset,
  flip,
  shift,
  autoUpdate,
  useFloating,
  useInteractions,
  useRole,
  useDismiss,
  useId,
  useClick,
} from "@floating-ui/react";

const config = {
  component: Popper,
  title: "Core/Popper",
};

export const Basic = () => {
  const [open, setOpen] = useState(false);
  const [targetEl, setTargetEl] = useState<HTMLButtonElement | null>(null);

  const toggle = () => setOpen((v) => !v);

  return (
    <Box m={5} p={5}>
      <Button variant="primary" ref={setTargetEl} onClick={toggle}>
        Button
      </Button>
      <Popper open={open} target={targetEl} offset={[0, 4]}>
        <Box p={2}>The content of the Popper.</Box>
      </Popper>
    </Box>
  );
};

export const Dropdown = () => {
  const [open, setOpen] = useState(false);
  const [targetEl, setTargetEl] = useState<HTMLButtonElement | null>(null);
  const classNames = useClassNames();
  const toggle = () => setOpen((v) => !v);

  return (
    <Box m={5} p={5}>
      <Button color="primary" ref={setTargetEl} onClick={toggle}>
        Button
      </Button>
      <Popper open={open} target={targetEl} offset={[0, 4]} arrow>
        <ul
          className={classNames(
            "dropdown-menu show border-0 rounded-0 position-static bg-transparent",
          )}
        >
          <li>
            <a href="#" className={classNames("dropdown-item")}>
              Item 1
            </a>
          </li>
          <li>
            <a href="#" className={classNames("dropdown-item")}>
              Item 2
            </a>
          </li>
          <li>
            <a href="#" className={classNames("dropdown-item")}>
              Item 3
            </a>
          </li>
        </ul>
      </Popper>
    </Box>
  );
};

function Example({ event, interactive }: any) {
  const { open, targetEl, setTargetEl, setContentEl, onClickAway } =
    usePopperTrigger({
      trigger: event,
      interactive,
    });

  return (
    <Box ms={1}>
      <Button textTransform="capitalize" color="primary" ref={setTargetEl}>
        {event}
      </Button>
      <ClickAwayListener onClickAway={onClickAway}>
        <Popper open={open} target={targetEl} offset={[0, 4]}>
          <Box p={2} ref={setContentEl} style={{ width: 320 }}>
            <Box as="h4">Personal Information</Box>
            <Input mt={1} placeholder="First Name" />
            <Input mt={1} placeholder="Last Name" />
            <Button mt={1} color="primary">
              Save
            </Button>
          </Box>
        </Popper>
      </ClickAwayListener>
    </Box>
  );
}

export const Hook = () => {
  const [interactive, setInteractive] = useState(false);

  return (
    <Box m={5} p={5}>
      <Box d="flex" alignItems="center" ms={5}>
        <Example event="click" interactive={interactive} />
        <Example event="hover" interactive={interactive} />
        <Example event="focus" interactive={interactive} />
        <InputLabel m={0} ms={2}>
          <Input
            type="checkbox"
            checked={interactive}
            onClick={() => setInteractive((checked) => !checked)}
          />{" "}
          Interactive
        </InputLabel>
      </Box>
    </Box>
  );
};

const MyButton = ({ children, onClick }: any) => {
  const [open, setOpen] = useState(false);

  const handler = React.useCallback((e) => {
    console.log("handler:", children);
    onClick(e);
    setOpen(!open);
  });

  if (true) {
    return (
      <Tooltip content={() => children} placement={children}>
        <Button
          className="m-2"
          variant="primary"
          textTransform="capitalize"
          onClick={handler}
        >
          {children}
        </Button>
      </Tooltip>
    );
  }

};

export const Placement = () => {
  const [open, setOpen] = useState(false);
  const [targetEl, setTargetEl] = useState<HTMLButtonElement | null>(null);
  const [placement, setPlacement] = useState<any>();
  const targetRef = React.useRef<HTMLButtonElement | null>(null);
  const handleOpen = () => setOpen(!open);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const newPlacement = e.currentTarget?.textContent || "bottom";
    //targetRef.current = e.currentTarget;
    setTargetEl(e.currentTarget);
    setPlacement(newPlacement);

    setOpen((prev) => placement !== newPlacement || !prev);
    console.log("placement:", placement);
  };

  return (
    <Box style={{ width: 500 }} m="auto" pt={5}>
      
      <Box d="flex" justifyContent="center">
        <MyButton onClick={handleClick}>top-end</MyButton>
        <MyButton onClick={handleClick}>top</MyButton>
        <MyButton onClick={handleClick}>top-start</MyButton>
      </Box>
      <Box d="flex" justifyContent="center">
        <Box
          d="flex"
          flexDirection="column"
          alignItems="start"
          style={{ width: "50%" }}
        >
          <MyButton onClick={handleClick}>right-top</MyButton>
          <MyButton onClick={handleClick}>right</MyButton>
          <MyButton onClick={handleClick}>right-bottom</MyButton>
        </Box>
        <Box
          d="flex"
          flexDirection="column"
          alignItems="end"
          style={{ width: "50%" }}
        >
          <MyButton onClick={handleClick}>left-top</MyButton>
          <MyButton onClick={handleClick}>left</MyButton>
          <MyButton onClick={handleClick}>left-bottom</MyButton>
        </Box>
      </Box>
      <Box d="flex" justifyContent="center" className="items-end">
        <MyButton onClick={handleClick}>bottom-end</MyButton>
        <MyButton onClick={handleClick}>bottom</MyButton>
        <MyButton onClick={handleClick}>bottom-start</MyButton>
      </Box>


      
    </Box>
  );
};

export const Transition = () => {
  const [open, setOpen] = useState(false);
  const [targetEl, setTargetEl] = useState<HTMLButtonElement | null>(null);

  const toggle = () => setOpen((v) => !v);

  const [internalOpen, setInternalOpen] = React.useState(false);

  // 5. set @floating-ui
  const { x, y, reference, floating, strategy, refs, update, context } =
    useFloating({
      open,
      onOpenChange: setInternalOpen,
      middleware: [fuiOffset(5), flip(), shift()],
      placement: "bottom",
    });

  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;

  const { getReferenceProps, getFloatingProps } = useInteractions([
    useClick(context),
    useRole(context),
    //useDismiss(context, dismiss),
  ]);

  React.useEffect(() => {
    if (refs.reference.current && refs.floating.current && open) {
      return autoUpdate(refs.reference.current, refs.floating.current, update);
    }
  }, [open, update, refs.reference, refs.floating]);
  // 4. set animation
  const animation = {
    unmount: {
      opacity: 0,
      y: -50,
      scale: 0.9,
      transition: {
        duration: 0.3,
      },
    },
    mount: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };
  const backdropAnimation = {
    unmount: {
      opacity: 0,
      transition: {
        delay: 0.2,
      },
    },
    mount: {
      opacity: 1,
    },
  };

  return (
    <Box m={5} p={5}>
      <Button variant="primary" ref={setTargetEl} onClick={toggle}>
        Button
      </Button>

      <FloatingPortal>
        <AnimatePresence>
          <m.div
            className="fixed inset-0 bg-gray-900"
            //initial="unmount"
            exit="unmount"
            animate={open ? "mount" : "unmount"}
            variants={backdropAnimation}
            transition={{ duration: 0.8 }}
            onAnimationEnd={() => console.log("onAnimationEnd")}
          >
            <m.div
              //initial="unmount"
              exit="unmount"
              animate={open ? "mount" : "unmount"}
              variants={animation}
            >
              <Panel sx={{ width: "300px" }}>
                The content of the Popper.
                <div>Div tuucdudfiudf bkj</div>
                <div>Div tuucdudfiudf bkj</div>
                <div>Div tuucdudfiudf bkj</div>
              </Panel>
            </m.div>
          </m.div>
        </AnimatePresence>
      </FloatingPortal>
    </Box>
  );
};

export default config;
