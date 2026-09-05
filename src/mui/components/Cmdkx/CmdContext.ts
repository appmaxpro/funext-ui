import { RenderLink } from "./types";
import { createContext, Dispatch, MutableRefObject, Ref, SetStateAction, useContext, useRef } from "react";

export interface CmdkContextProps<Value=any>{
  search: string;
  onSearch: (search: string) => void;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  targetType?: 'all' | 'content'
  focusInput?: ()=> void;
  setSearchPath?: Dispatch<SetStateAction<string[] | undefined>>;
  searchPath?: string[];
  page?: string;
  isSelected: (value:Value) => boolean;
  setSelected: (value:Value) => void;
  getItemStyle?: (
    option:{active?: boolean, selected?: boolean, disabled?:boolean}
  ) => string | null | undefined;
  renderLink?: RenderLink;
}

export const CmdkContext = createContext<CmdkContextProps>({
  search: '',
  onSearch: (search: string) => undefined,
  open: false,
  setOpen: (v) => undefined,
  targetType: 'all',
  isSelected: (value) => false,
  setSelected: (value) => undefined,
});

export const useCmdkContext = ()=> useContext(CmdkContext);


export interface UseCmdkContextProps {
  inputRef: MutableRefObject<HTMLElement | null>;
  contentRef: MutableRefObject<HTMLElement | null>;
  context: CmdkContextProps;
}



export function useCmdk() :UseCmdkContextProps{
  const context = useCmdkContext();
  const inputRef = useRef<HTMLInputElement|null>(null);
  const contentRef = useRef<HTMLElement|null>(null);

  return {
    context,
    inputRef,
    contentRef
  };
};

export const ActiveIndexContext = createContext<{ activeIndex: number }>({
  activeIndex: 0,
});

export const useActiveIndex= ()=> useContext(ActiveIndexContext);