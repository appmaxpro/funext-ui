import inputFilledColors from "./colors";
import inputFilledLabelColors from "./labelColors";
import styles from './filled.module.scss';

const inputFilled = {
  styles,
  base: {
    root: {
      add: styles['root'],
      borderColor: "border-inherit",
      peer: 'peer',
      bg: 'bg-h_sm hover:bg-transparent',
      fontSize: "text-base",
    },
    input: {
      peer: 'peer',
      px: "px-1",
      add: styles['input'],
      fontSize: "text-base"
    },
    native:{
      px: "px-1.5",
    },
    label: {
      className: styles['label'],
      fontSize: "text-base",
    },
    notched: {
      className: styles['notched'],
    },
    adornments: {
      props: {
        height: ''
      }
    }
  },
  sizes: {
    md: {
      root: {
        borderRadius: "rounded-[4px]",
      }
    },
    lg: {
      root: {
        borderRadius: "rounded-md",
      },
      label: {
        fontSize: "text-lg",
        add: `${styles['lg']}`
      }
    },
  },
  colors: {
    root: inputFilledColors,
    label: inputFilledLabelColors,
  },
  error: {
    root: {
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
    root: {
      borderColor: "border-green-500 focus-within:border-green-500"
    },
    label: {
      color: "text-green-500 peer-focus-within:text-green-500"
    },
    native:{
      placeholder: "placeholder-shown:border-green-500",
    }
  },
  shrink: {
    root:{
    },
    input: {},
    label: {
      className: `${styles['label']} ${styles['floated']}`
    },
    notched: {
    },
    native:{
      placeholder: "placeholder:opacity-100"
    }
  },
  label: {
    input: {
      className: styles['has-label']
    },
  }
};

export default inputFilled;
