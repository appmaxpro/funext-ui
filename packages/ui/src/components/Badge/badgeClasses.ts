import { generateUtilityClass, generateUtilityClasses } from "../../styles";

export interface BadgeClasses {
  /** Styles applied to the root element. */
  root: string;
  /** Styles applied to the badge `span` element. */
  badge: string;
  /** Styles applied to the badge `span` element if `variant="dot"`. */
  dot: string;
  /** Styles applied to the badge `span` element if `variant="standard"`. */
  standard: string;
  /** Styles applied to the badge `span` element if `placement={{ 'top', 'right' }}`. */
  placementTopRight: string;
  /** Styles applied to the badge `span` element if `placement={{ 'bottom', 'right' }}`. */
  placementBottomRight: string;
  /** Styles applied to the badge `span` element if `placement={{ 'top', 'left' }}`. */
  placementTopLeft: string;
  /** Styles applied to the badge `span` element if `placement={{ 'bottom', 'left' }}`. */
  placementBottomLeft: string;
  /** State class applied to the badge `span` element if `invisible={true}`. */
  invisible: string;
  /** Styles applied to the badge `span` element if `color="primary"`. */
  colorPrimary: string;
  /** Styles applied to the badge `span` element if `color="secondary"`. */
  colorSecondary: string;
  /** Styles applied to the badge `span` element if `color="error"`. */
  colorError: string;
  /** Styles applied to the badge `span` element if `color="info"`. */
  colorInfo: string;
  /** Styles applied to the badge `span` element if `color="success"`. */
  colorSuccess: string;
  /** Styles applied to the badge `span` element if `color="warning"`. */
  colorWarning: string;
  /** Styles applied to the badge `span` element if `shape="rectangular"`. */
  shapeSquare: string;
  /** Styles applied to the badge `span` element if `shape="circular"`. */
  shapeCircle: string;
}

export type BadgeClassKey = keyof BadgeClasses;

export function getBadgeUtilityClass(slot: string): string {
  return generateUtilityClass('MuxBadge', slot);
}

const badgeClasses: BadgeClasses = generateUtilityClasses('MuxBadge', [
  'root',
  'badge',
  'dot',
  'standard',
  'placementTopRight',
  'placementBottomRight',
  'placementTopLeft',
  'placementBottomLeft',
  'invisible',
  'colorError',
  'colorInfo',
  'colorPrimary',
  'colorSecondary',
  'colorSuccess',
  'colorWarning',
  'shapeSquare',
  'shapeCircle',
]);

export default badgeClasses;