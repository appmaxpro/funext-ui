import { MaterialIcon } from "../../icons/material-icon";
import { Box } from "../box";
import { AlertLink } from "./alert";
import { Alert } from "../../mui";

const config = {
  component: Alert,
  title: "Components/Alert",
};

export const Basic = () => {
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
            This is an <AlertLink href="/">alert with</AlertLink> icon...
          </Box>
        </Box>
      </Alert>
      <Alert color="green" variant="filled" onClose={()=> {}}>
        <Box alignItems="center" d="flex" g={2}>
          <Box flex={1}>This is an alert with close icon...</Box>
          <MaterialIcon icon="close" />
        </Box>
      </Alert>
    </Box>
  );
};

export default config;
