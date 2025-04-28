import { 
  styled ,
  memoTheme,
  useMuxDefaultProps,
  clsx,
  composeClasses,
  alpha,
  lighten,
  useTailwindTheme,
  Theme
} from '../../styles';

export const itemStyle = memoTheme(({ theme }:{theme:Theme}) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "start",
  width: "100%",
  textAlign: "justify",
  padding: 2,
  '&[data-gutters]': {
    paddingLeft: 4,
    paddingRight: 4
  },
  '&[data-dense]': {
    paddingTop: 1,
    paddingBottom: 1
  },
  '&[data-divider]': {
    borderBottomWidth: 1,
    borderColor: 'currentcolor'
  }

}));

export const iconStyle = memoTheme(({ theme }:{theme:Theme}) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));