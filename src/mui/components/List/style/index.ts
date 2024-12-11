// types
import type { ItemInteractive } from "../../../types/components/list";



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
      itemPrefix?: object;
      itemSuffix?: object;
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
      list: {
        display: "flex",
        flexDirection: "flex-col",
        //gap: "gap-1",
        minWidth: "min-w-[160px]",
        //padding: "py-2",
      },
      navList: {
        display: "flex",
        flexDirection: "flex-col",
        flex: 'flex-1'
      },
      item: {
        initial: {
          display: "flex",
          alignItems: "items-center",
          width: "w-full",
          textAlign: "text-start",
          transition: "transition-all",
          outline: "outline-none",
        },
        interactive:{
          active: {
            bg: '',
            opacity: '',
            color: ''
          },
          selected: {
            bg: 'slate-50/50',
            color: 'slate-700'
          },
          disabled: {
            opacity: '50',
          }
        },
        disabled: {
          opacity: "opacity-50",
          cursor: "cursor-not-allowed",
          pointerEvents: "pointer-events-none",
          userSelect: "select-none",
          colorClass: "text-tertiary-disabled",
        },
        gutters: 'px-4',
        dense: 'py-1',
        divider: 'border-b'
      },
      itemPrefix: {
        display: "flex",
        placeItems: "items-center justify-center",
        marginRight: "me-4",
      },
      itemSuffix: {
        display: "flex",
        placeItems: "items-center justify-center",
        marginRight: "ms-auto",
      },
    },
  },
};

export default list;
