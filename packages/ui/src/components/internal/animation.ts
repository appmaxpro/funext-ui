import { keyframes, css } from "../../styles";

const scaleIn = keyframes`
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
`;

const scaleOut = keyframes`
  from {
      transform: scale(1);
    }
    to {
      transform: scale(0);
    }
`;

const fadeIn = keyframes`
  from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
`;

const fadeOut = keyframes`
  from {
      opacity: 1;
    }
    to {
    opacity: 1;
      opacity: 0;
    }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
		transform: translateY(2px);
	}
	to {
    opacity: 1;
		transform: translateY(0);
	}
`;

const slideDown = keyframes`
  from {
    opacity: 0;
		transform: translateY(-2px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
`;

const slideLeft = keyframes`
  from {
    : 0;
		transform: translateX(2px);
	}
	to {
    opacity: 1;
		transform: translateX(0);
	}
`;

const slideRight = keyframes`
  from {
    opacity: 0;
		transform: translateX(-2px);
	}
	to {
    opacity: 1;
		transform: translateX(0);
	}
`;

const scaleFadeCss = css`
  transformOrigin: var(--popper-transform-origin),
  &[data-sate="open"]: {
    animation: ${fadeIn} 400ms ease-out, ${scaleIn} 240ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-sate="close"]: {
    animation: ${fadeOut} 400ms ease-out, ${scaleOut} 240ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const fadeCss = css`
  &[data-sate="open"]: {
    animation: ${fadeIn} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-sate="close"]: {
    animation: ${fadeOut} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const slideFadeCss = css`
  &[data-sate="open"][data-side="left"]: {
    animation: ${slideLeft} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-sate="open"][data-side="right"]: {
    animation: ${slideRight} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-sate="open"][data-side="up"]: {
    animation: ${slideUp} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-sate="open"][data-side="down"]: {
    animation: ${slideDown} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

const scaleInHafFadeCss = keyframes`
  from {
      opacity: 0;
      transform: scale(.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
`;

const scaleOutHafFadeCss = keyframes`
  from {
      opacity: 0;
      transform: scale(.5);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
`;


const scaleFadeStyle = (props: any) => {
  if (props.animate) {
    return scaleFadeCss;
  }
  return "";
};

const fadeStyle = (props: any) => {
  if (props.animate) {
    return fadeCss;
  }
  return "";
};

const slideFadeStyle = (props: any) => {
  if (props.animate) {
    return slideFadeCss;
  }
  return "";
};


const slideFadeStyleStyle = css`
  &[data-sate="open"]: {
    animation: ${scaleInHafFadeCss} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  &[data-sate="close"]: {
    animation: ${scaleOutHafFadeCss} 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }
`;

export { 
  scaleFadeStyle, 
  fadeStyle, 
  slideFadeStyle ,
  slideFadeStyleStyle
};
