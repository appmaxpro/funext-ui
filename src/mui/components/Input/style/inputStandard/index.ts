import inputStandardLabel from "./inputStandardLabel";
import inputStandardColors from "./inputStandardColors";
import inputStandardLabelColors from "./inputStandardLabelColors";
import styles from './st.module.scss';

const inputStandard = {
  base: {
    input: {
      add: styles['std-in'],
      borderY: 'divide-current divide-y'
    },
    native: {
      borderColor: "placeholder-shown:border",
      placeholder: "placeholder:opacity-0 focus:placeholder:opacity-100",
      add: styles['std-native']
    },
    label: {
      className: styles['label'],
    },
  },
  sizes: {
    md: {
      container: {
      },
      input: {
        fontSize: 'text-sm',
      },
      native: {
      },
      label: {
        fontSize: "text-base"
      },
      adornments: {
        py: "py-.5"
      }
    },
    lg: {
      container: {
      },
      input: {
        fontSize: "text-lg",
      },
      native: {
        add2: styles['lg']
      },
      label: {
        fontSize: "text-lg",
      },
      adornments: {
        py: "py-1"
      }
    },
  },
  colors: {
    input: inputStandardColors,
    label: inputStandardLabelColors,
  },
  error: {
    input: {
      borderColor: "border-red-500 placeholder-shown:border-red-500",
      borderColorFocused: "focus:border-red-500",
    },
    label: {
      color: "text-red-500 peer-focus:text-red-500 peer-placeholder-shown:text-red-500",
      after: "after:border-red-500 peer-focus-within:after:border-red-500",
    },
  },
  success: {
    input: {
      borderColor: "border-green-500 placeholder-shown:border-green-500",
      borderColorFocused: "focus:border-green-500",
    },
    label: {
      color: "text-green-500 peer-focus-within:text-green-500",
    },
  },
  shrink: {
    input: {},
    label: {
      add1: styles['floated']
    },
    native:{
      placeholder: "placeholder:opacity-100"
    }
  },
};

export default inputStandard;
