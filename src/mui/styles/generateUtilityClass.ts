import {default as generateMuiUtilityClass} from '@mui/utils/generateUtilityClass';



export default function generateUtilityClass(
  componentName: string,
  slot: string,
  globalStatePrefix = 'Mux',
): string {
  return generateMuiUtilityClass(componentName, slot, globalStatePrefix);
}