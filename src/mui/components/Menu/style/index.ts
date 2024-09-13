// types
import type {
  Placement,
  OffsetProps,
  MenuDismissProps,
  AnimationProps,
  Arrow
} from "../../../types/components/menu";

export interface MenuStylesType {
  defaultProps?: {
    placement?: Placement;
    offset?: OffsetProps;
    dismiss?: MenuDismissProps;
    animate?: AnimationProps;
    lockScroll?: boolean;
    padding?: number | null,
    arrow?: Arrow;
    className?: string
  };
  styles?: {
    base?: {
      menu?: object;
      panel?: object;
      item?: {
        initial?: object;
        disabled?: object;
      };
      defaultArrow?: Arrow
    };
  };
}

export const menu: MenuStylesType = {
  defaultProps: {
    placement: "bottom",
    offset: 5,
    padding: 0,
    dismiss: {
      itemPress: true
    },
    animate: {
      unmount: {},
      mount: {},
    },
    lockScroll: false,
  },
  styles: {
    base: {
      menu: {        
        //color: "text-slate-500",
        overflow: "overflow-auto",
        outline: "focus:outline-none",
      },
      panel: {
        minWidth: "min-w-[180px]",
        fontFamily: "font-sans",
        fontSize: "text-sm",
        fontWeight: "font-normal",
        bg: 'bg-body',
        text:"text-body"
      },
      defaultArrow: {
        props: {
          //maybe enough to set "fill-slate-50 stroke-slate-300 stroke-0" 
          //className: "fill-slate-900 stroke-slate-300 stroke-0",
          strokeWidth: .25,
          
          className: `fill-white 
                      [&>path:first-of-type]:stroke-slate-300 
                      [&>path:last-of-type]:fill-white`,
          tipRadius: 2,
          style:{ transform: 'translateY(-1px)' }
        }
      },
      item: {
        initial: {
          py: 'py-2.5',
          px: 'px-2',
        },
        disabled: {
          opacity: "opacity-60",
          cursor: "cursor-not-allowed",
          pointerEvents: "pointer-events-none",
        },
      },
    },
  },
};

export default menu;
