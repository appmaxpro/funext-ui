import { Box } from "../box";
import { LinearProgress } from "../../mui";

const config = {
  component: LinearProgress,
  title: "Components/LinearProgress",
};

export const Animated = () => {
  return (
    <Box className="bg-slate-100 min-h-screen p-8">
      <LinearProgress value={20} variant="determinate" label="animited"/>
    </Box>
  );
};

export const Basic = () => {
  return (
    <Box className="bg-slate-200 min-h-screen p-8">
      <LinearProgress value={20} variant="determinate"/>
    </Box>
  );
};

export const Indeterminate = () => {
  return (
    <Box className="bg-slate-300 min-h-screen p-8">
      <LinearProgress variant="indeterminate" size="lg" />
    </Box>
  );
};

export const Buffer = () => {
  return (
    <Box className="bg-slate-200 min-h-screen p-8">
      <LinearProgress value={20} color="success" size="sm" variant="buffer"/>
    </Box>
  );
};

export const Striped = () => {
  return (
    <Box className="bg-slate-200 min-h-screen p-8">
      <LinearProgress value={70} color="success" className="h-[20px]" variant="striped"/>
    </Box>
  );
};

export const Thickness = () => {
  return (
    <Box className="bg-slate-300 min-h-screen p-8">
      <LinearProgress value={60} color="red" className="h-[30px]" variant="query"/>
    </Box>
  );
};

export default config;
