import { Box } from "../Box";
import Link from "../Link";
import { useState } from "react";
import React from "react";
import { Button } from "../..";
import Alert from "./Alert";
import {MaterialIcon} from "../internal";

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
