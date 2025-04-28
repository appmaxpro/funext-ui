'use client';
import * as React from 'react';
import {createSvgIcon} from '../../SvgIcon';

function getPath(direction:  'up' | 'right' | 'down' | 'left') {
  // Base values for a downward chevron
  const base = [
    [3.5, 5.5],
    [7, 9],
    [10.5, 5.5],
  ];

  switch (direction) {
    case 'right':
      // Switch X and Y axis (so `base[0][1]` goes before `base[0][1]`)
      return `M${base[0][1]} ${base[0][0]}L${base[1][1]} ${base[1][0]}L${base[2][1]} ${base[2][0]}`;
    case 'left':
      // Switch X and Y axis, then flip X axis (so 14 - …)
      return `M${14 - base[0][1]} ${base[0][0]}L${14 - base[1][1]} ${base[1][0]}L${14 - base[2][1]} ${base[2][0]}`;
    case 'up':
      // Flip Y axis (so 14 - …)
      return `M${base[0][0]} ${14 - base[0][1]}L${base[1][0]} ${14 - base[1][1]}L${base[2][0]} ${14 - base[2][1]}`;
    case 'down':
    default:
      return `M${base[0][0]} ${base[0][1]}L${base[1][0]} ${base[1][1]}L${base[2][0]} ${base[2][1]}`;
  }
}

export const ChevronLeft = createSvgIcon(
  <path d={getPath('left')} />,
  'ChevronLeft',
);

export const ChevronRight = createSvgIcon(
  <path d={getPath('right')} />,
  'ChevronRight',
);

export const ChevronUp = createSvgIcon(
  <path d={getPath('up')} />,
  'ChevronUp',
);

export const ChevronDown = createSvgIcon(
  <path d={getPath('down')} />,
  'ChevronDown',
);
