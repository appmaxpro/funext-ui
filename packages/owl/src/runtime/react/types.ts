
export interface INode {
   remove: ()=> void;
   parent?:  IElement;
}

export interface IElement<C extends INode=any> {
  appendChild: (child:C) => void;
  insertBefore: (node: C, beforeNode?: C|null)=> void;
  removeChild: (child: C) => void;
  children: Array<C|undefined>;
}

export interface IText extends INode{

}