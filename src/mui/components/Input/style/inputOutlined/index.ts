import inputOutlinedLabel from "./inputOutlinedLabel";
import inputOutlinedColors from "./inputOutlinedColors";
import inputOutlinedLabelColors from "./inputOutlinedLabelColors";
import styles from './outline.module.scss';

console.log("outline-module.css:", styles);

const inputColor:any = Object.keys(inputOutlinedColors)
        .map(k => ({[k]: {color: inputOutlinedColors[k].color}}))
        .reduce((input:any, prev:any) => ({...input, ...prev}), {})


const notchedColor:any = Object.keys(inputOutlinedColors)
        .map(k => ({[k]: {
          borderColor: inputOutlinedColors[k].borderColor,
          borderColorFocused: inputOutlinedColors[k].borderColorFocused,
        }}))
        .reduce((input:any, prev:any) => ({...input, ...prev}), {})

const notchedFocusColor:any = Object.keys(inputOutlinedColors)
        .map(k => ({[k]: {
          borderColor: inputOutlinedColors[k].borderColorFocused?.substring("peer-focus:".length),
        }}))
        .reduce((input:any, prev:any) => ({...input, ...prev}), {})


const inputOutlined = {
  styles,
  base: {
    container: {
      add: styles['in-outline']
    },
    input: {
      peer: 'peer',
      borderColor: "border-inherit",
    },
    native:{
      placeholder: "placeholder:opacity-0 focus:placeholder:opacity-100 group-[.is-shrink]:placeholder:opacity-100",
      
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
        fontSize: "text-base",
        borderRadius: "rounded-[4px]",
      },
      label: {
        fontSize: "text-base"
      },
      notched: {
        fontSize: "text-base",
      },
      native: {
        px: "px-2",
      },
    },
    lg: {
      input: {
        fontSize: "text-base",
        borderRadius: "rounded-md",
        border: "border-0"
      },
      label: {
        fontSize: "text-lg",
        add: `${styles['lg']}`
      },
      native: {
        px: "px-2",
      },
      notched: {
        add: `${styles['lg']}`,
        fontSize: "text-lg",
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
      placeholder: "placeholder:opacity-0 focus:placeholder:opacity-100",
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
      placeholder: "placeholder:opacity-100"
    }
  },
};

export default inputOutlined;
