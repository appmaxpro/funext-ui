import {generateUtilityClass, generateUtilityClasses} 
from '../../styles';

export interface ButtonBaseClasses {
  /** Styles applied to the root element. */
  root: string;
  /** State class applied to the root element if `disabled={true}`. */
  disabled: string;
  /** State class applied to the root element if keyboard focused. */
  focusVisible: string;
}

export type ButtonBaseClassKey = keyof ButtonBaseClasses;

export function getButtonBaseUtilityClass(slot: string): string {
  return generateUtilityClass('MuxButtonBase', slot);
}

const buttonBaseClasses: ButtonBaseClasses = generateUtilityClasses('MuxButtonBase', [
  'root',
  'disabled',
  'focusVisible',
]);

export default buttonBaseClasses;

