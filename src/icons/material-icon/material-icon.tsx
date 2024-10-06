import { MaterialSymbol , type PolymorphicMaterialSymbolProps } from "react-material-symbols";
import 'react-material-symbols/rounded';

//import { TForeground } from "../../core";
//import { clsx, Box } from "../../mui";

///import styles from "./material-icon.module.scss";

export type MaterialIconProps = PolymorphicMaterialSymbolProps<any>;
export {
  MaterialSymbol as MaterialIcon
}
/*
const styleNames = ["fill", "fontSize", "scale"] as const;

const hasStyles = (props: Partial<MaterialIconProps>) => {
  return styleNames.some((name) => props[name] !== void 0);
};

const getStyles = ({ fill, fontSize, scale }: Partial<MaterialIconProps>) => {
  const fontVariationSettings = fill
    ? `"FILL" 1, "GRAD" 0, "wght" 400, "opsz" 48`
    : undefined;

  return {
    fontVariationSettings,
    fontSize,
    scale
  };
};

export const  MaterialIcon = forwardRef<HTMLSpanElement, MaterialIconProps>(
  (props, ref) => {
    const {
      className,
      icon,
      variant = "outlined",
      fill,
      fontSize,
      color,
      onClick,
      scale
    } = props;

    const cls = `material-symbols-${variant}`;
    const clsName = clsx(className, styles.icon, styles[cls], 'mt-icon');
    const style = useMemo(() => {
      const props = { fill, fontSize, scale };
      return hasStyles(props) ? getStyles(props) : undefined;
    }, [fill, fontSize, scale]);

    return (
      <Box
        as="span"
        className={clsName}
        color={color}
        onClick={onClick}
        style={style}
        ref={ref}
      >
        {icon}
      </Box>
    );
  },
);
*/
