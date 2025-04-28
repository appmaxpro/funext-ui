

import type {ButtonBaseProps} from '../Button/ButtonBaseType';

export interface IconButtonProps extends ButtonBaseProps {
  variant?: variant;
  size?: size;
  color?: color | 'transparent' | 'inherit';
  ripple?: ripple;
  className?: className;
  children: children;
  fullWidth?: boolean;
  rippleClass?: string;
}