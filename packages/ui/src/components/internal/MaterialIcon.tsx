import React from 'react';
import { SvgIconProps } from '../SvgIcon';
import CheckCircle from './svg-icons/CheckCircle'


export const MaterialIcon = React.forwardRef<HTMLElement, SvgIconProps & 
{icon:string, fill?: boolean}>(
  ({icon, fill, ...rest}, ref) => <CheckCircle {...rest} ref={ref as any}/>)

export default MaterialIcon