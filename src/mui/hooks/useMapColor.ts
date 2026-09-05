
import {Colors} from '../types/generic';

const defaultColors:Map<string, Colors> = new Map(
  Object.entries(
    {
      success: 'green',
      danger: 'red', 
      error: 'red', 
      warning: 'orange',
      info: 'sky',
      light: 'white' as Colors,
      dark: 'slate'
    }
  )
);

export function mapThemeColorProps<Props extends Record<string, any>>(props:Props) : Props {
  const {color} = props;
  if (color) {
    const colorValue = defaultColors.get(color);
    if (colorValue) {
      return {
        ...props,
        color: colorValue,
      }
    }
    
  }
  
  return props;
}

export function mapThemeColor(color?:string, def?:string) : Colors | undefined {
  return (color ? (defaultColors.get(color) ?? color) : (color ?? def)) as Colors;
}