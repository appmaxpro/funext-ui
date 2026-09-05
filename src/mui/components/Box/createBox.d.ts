import { OverridableComponent } from '../../props';
import { BoxTypeMap } from '@mui/system/Box';
import { Theme as SystemTheme } from '../../theme';

export default function createBox<
  T extends object = SystemTheme,
  AdditionalProps extends Record<string, unknown> = {},
>(options?: {
  themeId?: string;
  defaultTheme: T;
  defaultClassName?: string;
  generateClassName?: (componentName: string) => string;
}): OverridableComponent<BoxTypeMap<AdditionalProps, 'div', T>>;