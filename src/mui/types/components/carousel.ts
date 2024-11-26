import { AnimationProps } from "../generic";
/**
 * This file contains the types and prop-types for Carousel component.
 */

// typescript types
export type children = React.ReactNode | React.ReactNode[];
export type prevArrow = (args: {
  loop: boolean;
  handlePrev: () => void;
  activeIndex: number;
  firstIndex: boolean;
}) => React.ReactNode | void;
export type nextArrow = (args: {
  loop: boolean;
  handleNext: () => void;
  activeIndex: number;
  lastIndex: boolean;
}) => React.ReactNode | void;
export type navigation = (args: {
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
  activeIndex: number;
  length: number;
}) => React.ReactNode | void;
export type autoplay = boolean;
export type autoplayDelay = number;
export type transition = AnimationProps;
export type loop = boolean;
export type className = string;
export type slideRef = React.Ref<HTMLDivElement>;

