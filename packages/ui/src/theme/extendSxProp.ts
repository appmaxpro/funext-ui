import { isPlainObject } from '@mui/utils/deepmerge';
import defaultSxConfig from './extendedSxConfig';

const splitProps = (props:any) => {
  const systemProps:any =  {};
  const otherProps:any = {};

  const config = props?.theme?.unstable_sxConfig ?? defaultSxConfig;

  Object.keys(props).forEach((prop) => {
    let val = props[prop];
    if (config[prop]) {
      systemProps[prop] = val;
    } else {
      //console.log("prop:", prop, ", not found")
      otherProps[prop] = val;
    }
  });

  return {systemProps, otherProps};
};

export default function extendSxProp(props:any) {
  const { sx: inSx, ...other } = props;
  const { systemProps, otherProps } = splitProps(other);

  let finalSx;
  if (Array.isArray(inSx)) {
    finalSx = [systemProps, ...inSx];
  } else if (typeof inSx === 'function') {
    finalSx = (...args:Array<any>) => {
      const result = inSx(...args);
      if (!isPlainObject(result)) {
        return systemProps;
      }
      return { ...systemProps, ...result };
    };
  } else {
    finalSx = { ...systemProps, ...inSx };
  }

  return {
    ...otherProps,
    sx: finalSx,
  };
}