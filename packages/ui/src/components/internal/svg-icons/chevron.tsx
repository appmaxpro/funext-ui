'use client';
import * as React from 'react';
import {createRoundedSvgIcon} from '../../SvgIcon';


export const ChevronLeft = createRoundedSvgIcon(
  <path d="m15 18-6-6 6-6" />,
  'ChevronLeft',
);

export const ChevronRight = createRoundedSvgIcon(
  <path  d="m9 18 6-6-6-6"/>,
  'ChevronRight',
);

export const ChevronUp = createRoundedSvgIcon(
  <path d="m18 15-6-6-6 6" />,
  'ChevronUp',
);

export const ChevronDown = createRoundedSvgIcon(
  <path d="m6 9 6 6 6-6"/>,
  'ChevronDown',
);
