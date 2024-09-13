import {forwardRef} from 'react';
import { Icon, IconProps } from "@mui/material";
import { MaterialSymbol } from "@material-symbols/font-400";

export interface MaterialIconProps extends IconProps {
  icon: MaterialSymbol
}

export const MaterialIcon = forwardRef<HTMLSpanElement, MaterialIconProps>(
  (props, ref) => {
    const {
      icon,
      ...rest
    } = props;
    return (
      <Icon {...rest}>
        {icon}
      </Icon>
    );
  },
);
