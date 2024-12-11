//console.log("<-----------styled-------------->");
import createStyled, {CreateMUIStyled, MUIStyledCommonProps, MuiStyledOptions} from '@mui/system/createStyled';
import defaultTheme from '../theme/defaultTheme';
import { Theme as MuiTheme} from '../theme';
import THEME_ID from '../theme/identifier';
import rootShouldForwardProp from './rootShouldForwardProp';
import { isDevelopment } from '../utils';

declare type styled = CreateMUIStyled;

const muiStyled:CreateMUIStyled<MuiTheme> = createStyled({
  themeId: THEME_ID,
  defaultTheme,
  rootShouldForwardProp,
});

type Rtt = ReturnType<typeof muiStyled>;

const styled:CreateMUIStyled<MuiTheme>  = (props:any, options:MuiStyledOptions & any = {}): Rtt => {
    if(isDevelopment) {
      if (!options.label && !options.slot && options.name) {
        options.label = options.name;
      }
    }
    const Comp = muiStyled(props, options);
    return Comp;
}


export default styled;