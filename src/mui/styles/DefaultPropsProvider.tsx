import * as React from 'react';
import SystemDefaultPropsProvider, {
  useDefaultProps as useSystemDefaultProps,
} from '@mui/system/DefaultPropsProvider';
import type { ComponentsPropsList } from './props';
import { useTailwindTheme } from '../theme';
import {type TailwindTheme} from "../components/index";

function DefaultPropsProvider(
  props: React.PropsWithChildren<{
    value: { [P in keyof ComponentsPropsList]?: Partial<ComponentsPropsList[P]> };
  }>,
) {
  return <SystemDefaultPropsProvider {...props} />;
}

export default DefaultPropsProvider;

export function useDefaultProps<Props extends Record<string, any>>({props:inProps, name, resolve}: {
  props: Props;
  name: string;
  resolve: (props: Props, theme:TailwindTheme) => Record<string,any> | null | undefined;
}) {
  const theme = useTailwindTheme();
  const props = (resolve(inProps, theme) || {}) as Props;

  return useSystemDefaultProps({props, name});
}

export function useMuiDefaultProps<Props extends Record<string, any>>(params: {
  props: Props;
  name: string;
}) {
  return useSystemDefaultProps(params) as Props;
}