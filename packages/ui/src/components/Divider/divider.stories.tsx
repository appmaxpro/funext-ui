import { Box } from "../../../core/box";
import Divider from ".";
import { Chip } from "../..";

const config = {
  component: Divider,
  title: "Components/Divider",
};

export const Basic = () => {
  return (
    <Box p={5}>
      <Box p={4} bgColor="body-tertiary" />
      <Divider />
      <Box p={4} bgColor="body-tertiary" />
      <Divider>
        <Chip label="Chip" size="sm" />
      </Divider>
    </Box>
  );
};

export const Vertical = () => {
  return (
    <div>
      <Box d={"flex"} p={5} style={{ height: 200 }}>
        <Box border p={4} bgColor="body-tertiary" />
        <Divider orientation="vertical"/>
        <Box border p={4} bgColor="body-tertiary" />
      </Box>
    </div>
  );
};

export default config;
