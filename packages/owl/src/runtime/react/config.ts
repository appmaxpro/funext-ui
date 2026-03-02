import type {ComponentType, ComponentClass, Component, ReactNode} from './types';

export function filterOutModifiersFromData(dataList: any[]): { modifiers: string[]; data: any[] } {
  dataList = dataList.slice();
  const modifiers = [];
  let elm;
  while ((elm = dataList[0]) && typeof elm === "string") {
    modifiers.push(dataList.shift());
  }
  return { modifiers, data: dataList };
}


type Config = {
  shouldNormalizeDom: boolean;
  mainEventHandler: (data: any, ev: Event, currentTarget?: EventTarget | null) => boolean;
  ReactComp: ComponentClass;
  c: (type: any, props: any, children?: ReactNode) => ReactNode;
  render: (c: Component) => ReactNode;
  wrap: (block: any) => ReactNode;
  //readonly comps
}


class ComponentCC implements Component<any, any> {
   state:any = {};
   props:any;
   context: unknown;
   constructor(props: any) {
      this.props = props;
   }
  setState<K extends never>(state: {} | ((prevState: Readonly<{}>, props: Readonly<{}>) => {} | Pick<{}, K> | null) | Pick<{}, K> | null, callback?: () => void): void {
    throw new Error('Method not implemented.');
  }

 
  shouldComponentUpdate?(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean {
    throw new Error('Method not implemented.');
  }
  componentWillUnmount?(): void {
    throw new Error('Method not implemented.');
  }
  componentDidCatch?(error: Error, errorInfo: any): void {
    throw new Error('Method not implemented.');
  }
  getSnapshotBeforeUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>) {
    throw new Error('Method not implemented.');
  }
  componentDidUpdate?(prevProps: Readonly<{}>, prevState: Readonly<{}>, snapshot?: any): void {
    throw new Error('Method not implemented.');
  }

  componentDidMount?(): void {
    throw new Error('Method not implemented.');
   };

   render () {
    throw new Error('Method not implemented.');
    return ''
   }
     
}


export const config:Config = {
  // whether or not blockdom should normalize DOM whenever a block is created.
  // Normalizing dom mean removing empty text nodes (or containing only spaces)
  shouldNormalizeDom: true,

  // this is the main event handler. Every event handler registered with blockdom
  // will go through this function, giving it the data registered in the block
  // and the event
  mainEventHandler: (data: any, ev: Event, currentTarget?: EventTarget | null): boolean => {
    if (typeof data === "function") {
      data(ev);
    } else if (Array.isArray(data)) {
      data = filterOutModifiersFromData(data).data;
      data[0](data[1], ev);
    }
    return false;
  },
  
  ReactComp:  ComponentCC,

  c: (type: any, props: any, children?: ReactNode) => '',

  render: (c: Component) => {
    
    return ''
  },
  
  wrap: (block: any) => block


};
