import accordion from "./Accordion/style";
import alert from "./Alert/style";
import avatar from "./Avatar/style";
import button from "./Button/style";
import card from "./Card/style";
import cardBody from "./Card/style/cardBody";
import cardFooter from "./Card/style/cardFooter";
import cardHeader from "./Card/style/cardHeader";
import chip from "./Chip/style";
import iconButton from "./IconButton/style";
import input from "./Input/style";
import menu from "./Menu/style";
import panel from "./Panel/style";
import progress from "./Progress/style";
import tooltip from "./Tooltip/style";
import text from "./Text/style";
import collapse from "./Collapse/style";
import list from "./List/style";
import buttonGroup from "./ButtonGroup/style";
import spinner from "./Spinner/style";
import {
  timeline,
  timelineItem,
  timelineIcon,
  timelineConnector,
  timelineHeader,
  timelineBody,
} from "./Timeline/style";
import { step, stepper } from "./Stepper/style";
import { speedDial, speedDialContent, speedDialAction } from "./SpeedDial/style";

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
  buttonGroup,
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
export * from "./Accordion/style";
export * from "./Alert/style";
export * from "./Avatar/style";
export * from "./Button/style";
export * from "./Card/style";
export * from "./Card/style/cardBody";
export * from "./Card/style/cardFooter";
export * from "./Card/style/cardHeader";
export * from "./Checkbox/style";
export * from "./Chip/style";
export * from "./Dialog/style";
export * from "./Dialog/style/dialogBody";
export * from "./Dialog/style/dialogFooter";
export * from "./Dialog/style/dialogHeader";
export * from "./IconButton/style";
export * from "./Input/style";
export * from "./Menu/style";
export * from "./Popover/style";
export * from "./Progress/style";
export * from "./Radio/style";
export * from "./Select/style";
export * from "./Switch/style";
export * from "./Tooltip/style";
export * from "./Text/style";
export * from "./Collapse/style";
export * from "./List/style";
export * from "./ButtonGroup/style";
export * from "./Drawer/style";
export * from "./Badge/style";
export * from "./Slider/style";
export * from "./Spinner/style";
export * from "./Timeline/style";
export * from "./Stepper/style";
export * from "./SpeedDial/style";
*/
export default tailwindTheme;

declare type TailwindTheme  = typeof tailwindTheme;

export type{TailwindTheme as TailwindTheme};