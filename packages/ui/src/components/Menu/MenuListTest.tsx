import React, { useEffect, useState } from "react";
import {ListProps} from "../List";

export interface MenuListTestProps extends ListProps {
  dismissible?: boolean;
  panelClassName?: string;
  nav?: boolean;
}

const MenuListTest = React.forwardRef<HTMLElement, MenuListTestProps>(
  function(props, ref){

    const [component, setComponent] = React.useState<any>();

    useEffect(()=> {
      const importComponent = async () => {
        try{
        const module = await import('./MenuList');
        const ListComponent = module.default;
        setComponent(ListComponent);
        } catch(e){
          console.error(e);
        }
      };
      importComponent();
    }, []);


    const Component = component;

    return (Component 
          ? <Component {...props} ref={ref as any}/>
          : <ul ref={ref as any}></ul>);
  },
);
export {MenuListTest};

export default MenuListTest;