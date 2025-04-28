import deepmerge from '@mui/utils/deepmerge';
import createTheme from './createTheme';

export default function createMuiStrictModeTheme(options:any, ...args:Array<any>) {
  return createTheme(
    deepmerge(
      {
        unstable_strictMode: true,
      },
      options,
    ),
    ...args,
  );
}