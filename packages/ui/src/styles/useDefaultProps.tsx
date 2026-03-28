import  {
  useDefaultProps as useSystemDefaultProps,
} from '@mui/system/DefaultPropsProvider';
import { useTailwindTheme } from '../theme/TailwindThemeContext';
import type{ TailwindTheme } from '../mui';

export function useDefaultProps<Props extends Record<string, any>>({props:inProps, name, resolve}: {
  props: Props;
  name: string;
  resolve: (props: Props, theme:TailwindTheme) => Record<string,any> | null | undefined;
}) {
  const theme = useTailwindTheme();
  const props = (resolve(inProps, theme) || {}) as Props;

  return useSystemDefaultProps({props, name});
}

export function useMuxDefaultProps<Props extends Record<string, any>>(params: {
  props: Props;
  name: string;
}) {
  return useSystemDefaultProps(params) as Props;
}