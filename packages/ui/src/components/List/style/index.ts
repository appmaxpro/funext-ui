// types
import type { ItemInteractive } from "../List";



export interface ListStylesType {
  defaultProps?: {
    ripple?: boolean;
    className?: string;
    role?: string;
  };
  styles?: {
    base?: {
      list?: any;
      navList?: object;
      divider?: string;
      item?: {
        initial?: any;
        selected?: object;
        disabled?: object;        
        interactive?: {
          hover?: ItemInteractive;
          focus?: ItemInteractive;
          active?: ItemInteractive;
          selected?: ItemInteractive;
          selectedHover?: ItemInteractive;
          disabled?: ItemInteractive;
        }
        gutters?: string;
        dense?: string;
        divider?: string;
      };
      itemPrefix?: string;
      itemSuffix?: string;
    };
  };
}

export const list: ListStylesType = {
  defaultProps: {
    ripple: true,
    className: "",
    role: "list",
  },
  styles: {
    base: {
      list: undefined,
      divider: 'divider-y',
      navList: {
        flex: 'flex-1'
      },
      item: {
        initial: {
        },
        interactive:{
          active: {
          },
          selected: {
            bg: 'blue-500/10',
            color: 'slate-700'
          },
          disabled: {
            opacity: '50',
          }
        },
        disabled: {
          opacity: "opacity-50",
          //cursor: "cursor-not-allowed",
          pointerEvents: "pointer-events-none",
          userSelect: "select-none",
          colorClass: "text-tertiary-disabled",
        },
        gutters: 'px-4',
        dense: 'py-1',
        divider: 'border-b'
      },
      
    },
  },
};

export default list;
