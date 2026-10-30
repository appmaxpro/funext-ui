import {
  createSvgIcon,
  SvgIcon,
  SvgIcons,
  type SvgIconProps,
  type SxComponentProps,
} from "~/ui";
import React from "react";

import AccessAlarm from "@funext/icons/AccessAlarm";
import AccountCircle from "@funext/icons/AccountCircle";
import Add from '@funext/icons/Add';
import Alarm from '@funext/icons/Alarm';
import ArrowBack from "@funext/icons/ArrowBack";
import ArrowDown from "@funext/icons/ArrowDownward";
import ArrowForward from "@funext/icons/ArrowForward";
import ArrowUp from "@funext/icons/ArrowUpward";
import AutoStories from "@funext/icons/AutoStories";
import Chart from "@funext/icons/BarChart";
import CameraAlt from "@funext/icons/CameraAlt";
import Check from "@funext/icons/Check";
import Success from '@funext/icons/CheckCircleOutline';
import Checklist from "@funext/icons/Checklist";
import CloudQueue from "@funext/icons/CloudQueue";
import CropSquare from "@funext/icons/CropSquare";
import Dashboard from "@funext/icons/Dashboard";
import Delete from '@funext/icons/Delete';
import Directions from "@funext/icons/Directions";
import Error from '@funext/icons/ErrorOutline';
import Favorite from "@funext/icons/Favorite";
import Filter from "@funext/icons/Filter";
import GpsFixed from "@funext/icons/GpsFixed";
import Home from "@funext/icons/Home";
import KeyboardDoubleArrowDown from "@funext/icons/KeyboardDoubleArrowDown";
import Lightbulb from "@funext/icons/Lightbulb";
import Info from '@funext/icons/LightbulbOutline';
import LocalShipping from "@funext/icons/LocalShipping";
import Logout from "@funext/icons/Logout";
import Refresh from "@funext/icons/Loop";
import Mail from "@funext/icons/Mail";
import Menu from "@funext/icons/Menu";
import MenuOpen from "@funext/icons/MenuOpen";
import MoreHoriz from '@funext/icons/MoreHoriz';
import MoreVert from '@funext/icons/MoreVert';
import Navigation from "@funext/icons/Navigation";
import Notifications from '@funext/icons/Notifications';
import People from "@funext/icons/People";
import Person from "@funext/icons/Person";
import Place from "@funext/icons/Place";
import Remove from '@funext/icons/Remove';
import Route from "@funext/icons/Route";
import Truck from "@funext/icons/RvHookup";
import Schedule from "@funext/icons/Schedule";
import Security from "@funext/icons/Security";
import Settings from "@funext/icons/Settings";
import ShoppingCart from "@funext/icons/ShoppingCart";
import Sort from "@funext/icons/Sort";
import Star from "@funext/icons/Star";
import Storefront from "@funext/icons/Storefront";
import Sync from '@funext/icons/Sync';
import SyncProblem from '@funext/icons/SyncProblem';
import ThumbUpAlt from "@funext/icons/ThumbUpAlt";
import Tune from "@funext/icons/Tune";
import Copy from "@funext/icons/ContentCopy";
import Fullscreen from "@funext/icons/Fullscreen";
import FullscreenExit from "@funext/icons/FullscreenExit";
import MyLocation from "@funext/icons/MyLocation";
import { isDevelopment, toCamelCase } from "~/utils";

export type IconProps = SvgIconProps;

export type IconComponent = typeof SvgIcon;// React.ComponentType<IconProps>;

//type IconData<C extends IconComponent = IconComponent> = Record<string, C>;

export const Blank = createSvgIcon(<path d="" />, "Empty") as IconComponent;

const Icons = {
  Blank,
  AccessAlarm,
  AccountCircle,
  Person,
  AutoStories,
  CameraAlt,
  CloudQueue,
  Favorite,
  GpsFixed,
  Home,
  Lightbulb,
  Mail,
  People,
  Settings,
  ShoppingCart,
  Star,
  ThumbUpAlt,
  Tune,
  Truck,
  Sort,
  Chart,
  ArrowUp,
  ArrowDown,
  Route,
  Navigation,
  Directions,
  Refresh,
  Place,
  Check,
  Checklist,
  Filter,
  KeyboardDoubleArrowDown,
  CropSquare,
  Schedule,
  Storefront,
  LocalShipping,
  MenuOpen,
  Menu,
  ArrowForward,
  ArrowBack,
  Dashboard,
  MoreVert,
  MoreHoriz,
  Notifications,
  Alarm,
  Error,
  Info,
  Success,
  Add,
  Delete,
  Remove,
  Sync,
  SyncProblem,
  Logout,
  Security,
  Copy,
  Fullscreen,
  FullscreenExit,
  MyLocation,
  ...SvgIcons,
};

type Icons = Record<keyof typeof Icons, IconComponent> ;

//export { Icons };



export function icon<K extends keyof Icons>(name: K): Icons[K] {
  if (name in Icons) return Icons[name];

  if (!name) return Blank;

   if (true) return Blank;

  if (isDevelopment) {
    return load("@funext/icons/", name);
  }
  return load("/icons/", name);
}

export function iconIf<K extends keyof Icons>(name: K|string, fallback?: K) {
  if (name in Icons) return Icons[name as K];
  name = toCamelCase(name) as K;
  if (name in Icons) return Icons[name as K];
  if (isDevelopment) {
    return load("@funext/icons/", name, fallback);
  }
  return load("/icons/", name, fallback);
}

export function iconOr<K extends keyof Icons>(icon: string|IconComponent, fallback?: K) {
    if(typeof icon === 'string') {
      return iconIf(icon as K, fallback)
    }
    if(typeof icon === 'function') {
      return icon;
    }

    if(icon && (icon as any).hasOwnProperty("$$typeof"))
      return icon;

    return fallback ?? Blank
}

function load<K extends keyof Icons>(path: string, name: string, fallback?: K) {
  const Icon = React.lazy(async () => {
    try {
      const { default: Icon } = await import(`${path}${name}.js`);
      Object.assign(Icons, { [name]: Icon });
      return Icon;
    } catch (e) {
      if (isDevelopment) {
        if (fallback) {
          console.error(`Icon with name ${name} not found ..`);
        } else {
          throw e;
        }
      }

      Object.assign(Icons, { [name]: fallback ?? Blank });

      return Blank;
    }
  });

  Object.assign(Icons, { [name]: Icon });
  return Icon as IconComponent;
}

const Icon = ({ name, ...props }: SxComponentProps) =>{
  const Icon = icon(name as any);
  return React.createElement(Icon, props);
};

export { Icons, Icon };

type All = Icons & {Icons: Icons, Icon: typeof Icon, iconIf: typeof iconIf, iconOr: typeof iconOr}
const all:All = {
  ...Icons,
  Icons,
  Icon,
  iconIf,
  iconOr
}
//type All<K keyof all  = 

export default all


