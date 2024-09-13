import {clsx} from '../styles'
import {useThemeColor} from './useMapColor';

const defaultColors = ['body', 'secondary', 'dark', 'light'];

export function useColorClass(color?:string, className?: string | null | undefined, 
    def?:string, asOf:string='bg')

  : {color?: string, className?: string | null | undefined}
  {
    if (color && defaultColors.includes(color)) {
      return {
        className: clsx(className, `${asOf}-${color}`)
      };
    }

    if (def) {
      return {
        className: clsx(className, `${asOf}-${def}`)
      };
    }
    return {
      color: useThemeColor(color),
      className,
    };
}