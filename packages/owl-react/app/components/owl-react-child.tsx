
import * as React from "react";


const style = { display: "contents" };

type Props = {
  el: Node | undefined;
};



const Child: React.FC<Props> = ({ el }) => 
  !el || (el.nodeType === Node.TEXT_NODE || el.nodeType === Node.COMMENT_NODE)
  ? el?.textContent?.trim()
  : <ChildEl el={el as HTMLElement}/>

const ChildEl: React.FC<{el: HTMLElement}> = ({ el }) => {
  const ref = React.useRef<HTMLElement|undefined>(undefined);
  React.useEffect(() => {
    if (!ref.current) {
      return;
    }
    
    ref.current.appendChild(el);
  }, [ref, el]);

  return React.createElement(
    `owl-child`,
    {
      ref,
      style,
    },
  );
};
export default Child;