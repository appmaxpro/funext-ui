import React from "react";
import {
  isDevelopment,
  Icons as allIcons,
  createSvgIcon,
  type SvgIconProps,
} from "@funext/ui";

import AccessAlarm from "@funext/icons/AccessAlarm";
import AccountCircle from "@funext/icons/AccountCircle";
import Person from "@funext/icons/Person";
import AutoStories from "@funext/icons/AutoStories";
import CameraAlt from "@funext/icons/CameraAlt";
import CloudQueue from "@funext/icons/CloudQueue";
import Favorite from "@funext/icons/Favorite";
import GpsFixed from "@funext/icons/GpsFixed";
import Home from "@funext/icons/Home";
import Lightbulb from "@funext/icons/Lightbulb";
import Mail from "@funext/icons/Mail";
import People from "@funext/icons/People";
import Settings from "@funext/icons/Settings";
import ShoppingCart from "@funext/icons/ShoppingCart";
import Star from "@funext/icons/Star";
import ThumbUpAlt from "@funext/icons/ThumbUpAlt";
import Tune from "@funext/icons/Tune";
import Truck from "@funext/icons/RvHookup";
import Sort from "@funext/icons/Sort";
import Chart from "@funext/icons/BarChart";
import ArrowUp from "@funext/icons/ArrowUpward";
import ArrowDown from "@funext/icons/ArrowDownward";
import Route from "@funext/icons/Route";
import Navigation from "@funext/icons/Navigation";
import Directions from "@funext/icons/Directions";
import Refresh from "@funext/icons/Loop";
import Place from "@funext/icons/Place";
import Check from "@funext/icons/Check";
import Checklist from "@funext/icons/Checklist";
import Filter from "@funext/icons/Filter";
import KeyboardDoubleArrowDown from "@funext/icons/KeyboardDoubleArrowDown";
import CropSquare from "@funext/icons/CropSquare";

import { toCamelCase } from "~/utils";

export type IconComponent = React.ComponentType<SvgIconProps>;

type IconData<C extends IconComponent = IconComponent> = Record<string, C>;

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
  ...allIcons,
} as IconData;

type Icons = typeof Icons;

//export { Icons };



export function icon<K extends keyof Icons>(name: K): Icons[K] {
  if (name in Icons) return Icons[name];

  if (!name) return Blank;

  if (isDevelopment) {
    return load("@funext/icons/", name);
  }
  return load("/icons/", name);
}

export function iconIf<K extends keyof Icons>(name: string, fallback?: K) {
  if (name in Icons) return Icons[name];
  name = toCamelCase(name);
  if (name in Icons) return Icons[name];
  if (isDevelopment) {
    return load("@funext/icons/", name, fallback);
  }
  return load("/icons/", name, fallback);
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
export {Icons}

export default {
  ...Icons,
  Icons,
  icon,
  iconIf,
}
