import accordion from "../components/Accordion/style";
import alert from "../components/Alert/style";
import avatar from "../components/Avatar/style";
import button from "../components/Button/style";
import card from "../components/Card/style";
import cardBody from "../components/Card/style/cardBody";
import cardFooter from "../components/Card/style/cardFooter";
import cardHeader from "../components/Card/style/cardHeader";
import chip from "../components/Chip/style";
import iconButton from "../components/IconButton/style";
import input from "../components/Input/style";
import menu from "../components/Menu/style";
import panel from "../components/Panel/style";
import progress from "../components/Progress/style";
import tooltip from "../components/Tooltip/style";
import text from "../components/Text/style";
import collapse from "../components/Collapse/style";
import list from "../components/List/style";
import spinner from "../components/Spinner/style";
import {
  timeline,
  timelineItem,
  timelineIcon,
  timelineConnector,
  timelineHeader,
  timelineBody,
} from "../components/Timeline/style";
import { step, stepper } from "../components/Stepper/style";
import { speedDial, speedDialContent, speedDialAction } from "../components/SpeedDial/style";

const tailwindTheme: any = {
  accordion,
  alert,
  avatar,
  button,
  card,
  cardBody,
  cardFooter,
  cardHeader,
  chip,
  iconButton,
  input,
  menu,
  panel,
  progress,
  tooltip,
  text,
  collapse,
  list,
  spinner,
  timeline,
  timelineItem,
  timelineIcon,
  timelineHeader,
  timelineBody,
  timelineConnector,
  step,
  stepper,
  speedDial,
  speedDialContent,
  speedDialAction
};


/*
export * from "../components/Accordion/style";
export * from "../components/Alert/style";
export * from "../components/Avatar/style";
export * from "../components/Button/style";
export * from "../components/Card/style";
export * from "../components/Card/style/cardBody";
export * from "../components/Card/style/cardFooter";
export * from "../components/Card/style/cardHeader";
export * from "../components/Checkbox/style";
export * from "../components/Chip/style";
export * from "../components/Dialog/style";
export * from "../components/Dialog/style/dialogBody";
export * from "../components/Dialog/style/dialogFooter";
export * from "../components/Dialog/style/dialogHeader";
export * from "../components/IconButton/style";
export * from "../components/Input/style";
export * from "../components/Menu/style";
export * from "../components/Popover/style";
export * from "../components/Progress/style";
export * from "../components/Radio/style";
export * from "../components/Select/style";
export * from "../components/Switch/style";
export * from "../components/Tooltip/style";
export * from "../components/Text/style";
export * from "../components/Collapse/style";
export * from "../components/List/style";
export * from "../components/ButtonGroup/style";
export * from "../components/Drawer/style";
export * from "../components/Badge/style";
export * from "../components/Slider/style";
export * from "../components/Spinner/style";
export * from "../components/Timeline/style";
export * from "../components/Stepper/style";
export * from "../components/SpeedDial/style";
*/
export default tailwindTheme;

declare type TailwindTheme  = typeof tailwindTheme;

export type{TailwindTheme as TailwindTheme};