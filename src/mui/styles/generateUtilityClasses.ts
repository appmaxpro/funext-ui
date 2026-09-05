
import generateUtilityClass from './generateUtilityClass';

export default function generateUtilityClasses<T extends string>(
  componentName: string,
  slots: T[],
  globalStatePrefix = 'Mux',
): Record<T, string> {
  const result: Record<string, string> = {};

  slots.forEach((slot) => {
    result[slot] = generateUtilityClass(componentName, slot, globalStatePrefix);
  });

  return result;
}