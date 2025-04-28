//console.log("<-----------styled-------------->");
import createStyled, {CreateMUIStyled, MUIStyledCommonProps, MuiStyledOptions} from '@mui/system/createStyled';
import defaultTheme from '../theme/defaultTheme';
import { Theme as MuiTheme} from '../theme';
import THEME_ID from '../theme/identifier';
import rootShouldForwardProp from './rootShouldForwardProp';
import { isDevelopment } from '../utils';
import mergeComp  from './mergeComp';

declare type styled = CreateMUIStyled;

const muiStyled:CreateMUIStyled<MuiTheme> = createStyled({
  themeId: THEME_ID,
  defaultTheme,
  rootShouldForwardProp,
});

type Rtt = ReturnType<typeof muiStyled>;

const styled:CreateMUIStyled<MuiTheme>  = (tag:any, options:MuiStyledOptions & any = {}): Rtt => {
    if(isDevelopment) {
      if (!options.label && !options.slot && options.name) {
        options.label = options.name;
      }
    }
    const {props, ...other} = options;
    let Factory = muiStyled(tag, other);
    
    if(props) {
      Factory = mergeComp(Factory, props) as typeof Factory;
    }

    return Factory;
}


export default styled;