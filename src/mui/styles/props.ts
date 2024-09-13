import React from 'react';

import {DividerProps} from '../types/components/divider'


export type ComponentsProps = {
  [Name in keyof ComponentsPropsList]?: Partial<ComponentsPropsList[Name]>;
};

export interface ComponentsPropsList {
   MuxDivider: DividerProps;
}
