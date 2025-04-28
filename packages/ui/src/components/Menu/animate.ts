import {
  keyframes,
  css
} from "../../styles";

const menuScaleIn = keyframes`
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
`;

const menuScaleOut = keyframes`
  from {
      transform: scale(1);
    }
    to {
      transform: scale(0);
    }
`;

const menuFadeIn = keyframes`
  from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`;

const menuFadeOut = keyframes`
  from {
      opacity: 1;
    }
    to {
      opacity: 0;
    }
`;



const scaleFadeCss = css`
  transformOrigin: var(--menu-content-transform-origin),
  &[data-sate="open"]: {
    animation: ${menuFadeIn} 400ms ease-out, ${menuScaleIn} 240ms cubic-bezier(0.4, 0, 0.2, 1)
  }

  &[data-sate="close"]: {
    animation: ${menuFadeOut} 400ms ease-out, ${menuScaleOut} 240ms cubic-bezier(0.4, 0, 0.2, 1)
  }
`;


const scaleFadeMenu = (props: any) => {
  if (props.animate) {
    return scaleFadeCss;
  }

  return '';
};

export  {
  scaleFadeMenu
}