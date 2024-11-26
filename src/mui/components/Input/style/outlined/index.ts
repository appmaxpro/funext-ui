import inputOutlinedLabel from "./label";
import inputOutlinedColors from "./colors";
import inputOutlinedLabelColors from "./labelColors";
import styles from './outline.module.scss';


const notchedColor:any = Object.keys(inputOutlinedColors)
        .map(k => ({[k]: {
          borderColor: inputOutlinedColors[k].borderColor,
          borderColorFocused: inputOutlinedColors[k].borderColorFocused,
        }}))
        .reduce((input:any, prev:any) => ({...input, ...prev}), {})

const inputOutlined = {
  styles,
  base: {
    root: {
      add: styles['in-outline']
    },
    input: {
      fontSize: "text-base",
      peer: 'peer',
      borderColor: "border-inherit",
      input: styles['input']
    },
    native:{
      //placeholder: "placeholder:opacity-0 focus:placeholder:opacity-100 group-[.is-shrink]:placeholder:opacity-100",
      
    },
    label: {
      className: styles['label'],
    },
    notched: {
      className: styles['notched'],
    }
  },
  sizes: {
    md: {
      input: {
        
        borderRadius: "rounded",
      },
      native: {
        px: "px-2",
      },
    },
    lg: {
      input: {
        borderRadius: "rounded-md",
      },
      label: {
        add: `${styles['lg']}`
      },
      native: {
        px: "px-2",
      },
      notched: {
        add: `${styles['lg']}`,
      },
      adornments: {
        //py: "py-1"
      }

    },
  },
  colors: {
    input: inputOutlinedColors,
    label: inputOutlinedLabelColors,
    notched: notchedColor 
  },
  error: {

    input: {
      borderColor: "border-red-500 focus-within:border-red-500",
    },
    label: {
      color: "text-red-500 peer-focus-within:text-red-500"
    },
    native:{
      //placeholder: "placeholder:opacity-0 focus:placeholder:opacity-100",
    }
  },
  success: {
    input: {
      borderColor: "border-green-500 focus-within:text-green-500"
    },
    label: {
      color: "text-green-500 peer-focus-within:text-green-500"
    },
    native:{
      placeholder: "placeholder-shown:border-green-500",
    }
  },
  shrink: {
    input: {},
    label: {
      className: `${styles['label']} ${styles['floated']}`
    },
    notched: {
      min: 'flx',
      add: styles['flt']
    },
    native:{
      //placeholder: "placeholder:opacity-100"
    }
  },
};

export default inputOutlined;
