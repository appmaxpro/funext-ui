const spaces = {
  0: '0',
  0.25: '2px',
  0.5: '4px',
  0.75: '6px',
  1: '8px',
  1.5: '12px',
  2: '16px',
  3: '20px',
  4: '30px',
};

export type ValidSize = keyof typeof spaces;

function space<S extends ValidSize>(size: S): (typeof spaces)[S] {
  return spaces[size];
}

export {space};