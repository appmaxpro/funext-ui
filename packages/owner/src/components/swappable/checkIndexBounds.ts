import React from 'react';

const checkIndexBounds = ({index, children}:{index: number, children: React.ReactNode}) => {

  const childrenCount = React.Children.count(children);
  if(!(index >= 0 && index <= childrenCount))
    console.warn(
      `react-swappable-view: the new index: ${index} is out of bounds: [0-${childrenCount}].`,
    );
};

export default checkIndexBounds;