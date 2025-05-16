//console.log("<-----------styled-------------->");
import createStyled, {
  CreateMUIStyled,
  MUIStyledCommonProps,
  MuiStyledOptions,
} from "@mui/system/createStyled";
import defaultTheme from "../theme/defaultTheme";
import { Theme as MuiTheme } from "../theme";
import THEME_ID from "../theme/identifier";
import rootShouldForwardProp from "./rootShouldForwardProp";
import slotShouldForwardProp from "./slotShouldForwardProp";
import { isDevelopment } from "../utils";
import mergeComp from "./mergeComp";


declare type styled = CreateMUIStyled;

const muiStyled: CreateMUIStyled<MuiTheme> = createStyled({
  themeId: THEME_ID,
  defaultTheme,
  rootShouldForwardProp,
  slotShouldForwardProp
});

type Rtt = ReturnType<typeof muiStyled>;

const styled: CreateMUIStyled<MuiTheme> = (
  tag: any,
  options: MuiStyledOptions & any = {},
): Rtt => {
  if (isDevelopment) {
    if (!options.label && !options.slot && options.name) {
      options.label = options.name;
    }
    options.label = undefined;
  }

  if (options?.shouldForwardProp && false) {
    const origShouldForwardProp = options.shouldForwardProp;
    options.shouldForwardProp = (propName: PropertyKey) =>
      !rootShouldForwardProp(propName)
        ? false
        : origShouldForwardProp(propName);
  }

  let Factory = muiStyled(tag, options);

  

  return Factory;
};

export default styled;
