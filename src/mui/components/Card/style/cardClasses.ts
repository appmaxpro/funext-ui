import generateUtilityClasses from '@mui/utils/generateUtilityClasses';
import generateUtilityClass from '@mui/utils/generateUtilityClass';

export interface CardClasses {
  /** Styles applied to the root element. */
  root: string;
}

export type CardClassKey = keyof CardClasses;

export function getCardUtilityClass(slot: string): string {
  return generateUtilityClass('MuxCard', slot);
}

const cardClasses: CardClasses = generateUtilityClasses('MuxCard', ['root']);

export default cardClasses;