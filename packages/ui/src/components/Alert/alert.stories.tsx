import { MaterialIcon } from "../../../icons/material-icon";
import { Box } from "../../../core/box";
import { Link } from "../Link";
import { Alert } from "./.";
import { useState } from "react";
import React from "react";
import { Button } from "../..";

const config = {
  component: Alert,
  title: "Components/Alert",
};

export const Basic = () => {
  const [open, setOpen] = useState(true);
  return (
    <Box d="flex" flexDirection="column" gap={2}>
      <Alert>This is a simple alert...</Alert>
      <Alert variant="outlined" color="orange" title="Warning!">
        This is a alert with title...
      </Alert>
      <Alert color="red" variant="ghost">
        <Box alignItems="center" d="flex" g={2}>
          <MaterialIcon icon="exclamation" />
          <Box>
            This is an <Link href="/">alert with</Link> icon...
          </Box>
        </Box>
      </Alert>
      <Alert
        color="green"
        variant="filled"
        onClose={() => setOpen(false)}
        animate
        motionProps={{
          transition: { duration: 0.75 },
          initial: "unmount",
          exit: "unmount",
          animate: open ? "mount" : "unmount",
          variants: {
            unmount: {
              height: 0,
              opacity: 0,
            },
            mount: {
              height: "auto",
              opacity: 1,
            },
          },
        }}
        open={open}
      >
        <Box alignItems="center" d="flex" g={2}>
          <Box flex={1}>This is an alert with close icon...</Box>
        </Box>
      </Alert>
      <Alert
        color="orange"
        variant="filled"
        title="Welcome to Funext UI"
        icon={
          <MaterialIcon
            icon="exclamation"
            size={24}
            style={{
              borderRadius: "100%",
              border: "2px solid currentcolor",
              padding: 4,
            }}
          />
        }
      >
        <Box alignItems="center" d="flex" g={2}>
          <Box>
            This is an <Link href="/">alert with</Link> icon...
          </Box>
        </Box>
        <Box justifyContent="end" grow d="flex">
          <Button onClick={() => setOpen(true)} variant="filled" color="inherit">Open</Button>
        </Box>
      </Alert>
    </Box>
  );
};

export default config;
