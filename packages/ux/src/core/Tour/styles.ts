import { useCallback } from "react"

export type StylesKeys =
  | 'badge'
  | 'content'
  | 'controls'
  | 'navigation'
  | 'button'
  | 'arrow'
  | 'dot'
  | 'close'
  | 'svg'

export type StylesObj = {
  [key in StylesKeys]?: StyleFn
}

export type StyleFn = (
  props: { [key: string]: any },
  state?: { [key: string]: any }
) => React.CSSProperties

export type Styles = {
  badge: StyleFn
  content: StyleFn
  controls: StyleFn
  navigation: StyleFn
  button: StyleFn
  arrow: StyleFn
  dot: StyleFn
  close: StyleFn
  svg: StyleFn
}

export type StyleKey = keyof Styles

export const defaultStyles: Styles = {
  badge: ({ rtl }) => ({
    top: 0,
    [rtl ? 'right': 'left']: rtl ? -16 : 0,
    [rtl ? 'left': 'right']: 'unset',
  }),
  content: () => ({
    padding: '24px 30px',
  }),
  controls: () => ({
    display: 'flex',
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
  }),
  navigation: () => ({
    counterReset: 'dot',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  }),
  button: ({ disabled }) => ({

  }),
  arrow: ({ disabled }) => ({
    width: 16,
    height: 16,
    flex: '0 0 16px',
  }),
  dot: ({ current, disabled, showNumber }) => ({
    counterIncrement: 'dot',
    width: 8,
    height: 8,
    border: current ? '0' : '1px solid #caccce',
    borderRadius: '100%',
    padding: 0,
    display: 'block',
    margin: 4,
    transition: 'opacity 0.3s, transform 0.3s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transform: `scale(${current ? 1.25 : 1})`,
    color: current ? 'var(--reactour-accent, #007aff)' : '#caccce',
    background: current ? 'var(--reactour-accent, #007aff)' : 'none',
    // '&:before': {
    //   content: 'counter(dot)',
    //   position: 'absolute',
    //   bottom: 'calc(100% + 0.25em)',
    //   left: '50%',
    //   opacity: 0,
    //   transform: 'translate(-50%, 1em)',
    //   transition: '0.3s',
    //   display: showNumber ? 'block' : 'none',
    // },
    // '&:hover': {
    //   backgroundColor: 'currentColor',
    //   '&:before': {
    //     opacity: 0.5,
    //     transform: 'translate(-50%, -2px)',
    //   },
    // },
  }),
  close: ({ rtl }) => ({
    position: 'absolute',
    top: -10,
    [rtl ? 'left': 'right']: -10,
  }),
  svg: () => ({
    display: 'block',
  }),
}

export type getStylesType = (key: StylesKeys, extra?: any) => {}

export function stylesMatcher(styles: StylesObj) {
  return (key: StyleKey, state: {}): {} => {
    const base = defaultStyles[key](state)
    const custom = styles[key]
    return custom ? custom(base, state) : base
  }
}

export const useStylesMatcher = () => useCallback(stylesMatcher, [])