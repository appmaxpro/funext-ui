console.log("<-----------styled-------------->");
import createStyled, {CreateMUIStyled} from '@mui/system/createStyled';
import defaultTheme from '../theme/defaultTheme';
import { Theme as MuiTheme} from '../theme';
import THEME_ID from '../theme/identifier';
import rootShouldForwardProp from './rootShouldForwardProp';


declare type styled = CreateMUIStyled;


//export type CreateStyledComponent = ReturnType<typeof createStyled>;

const styled:CreateMUIStyled<MuiTheme> = createStyled({
  themeId: THEME_ID,
  defaultTheme,
  rootShouldForwardProp,
});


export default styled;