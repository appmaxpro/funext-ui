// @ts-expect-error TS(7006): Parameter 'obj' implicitly has an 'any' type.
const isObject = obj =>
    obj && Object.prototype.toString.call(obj) === '[object Object]';

// @ts-expect-error TS(7006): Parameter 'obj' implicitly has an 'any' type.
const isEmpty = obj =>
    obj instanceof Date
        ? false
        : obj === '' ||
          obj == null ||
          (Array.isArray(obj) && obj.length === 0) ||
          (isObject(obj) && Object.keys(obj).length === 0);

// @ts-expect-error TS(7006): Parameter 'object' implicitly has an 'any' type.
export const removeEmpty = (object, recursive = false) =>
    Object.keys(object).reduce((acc, key) => {
        let child = object[key];

        if (recursive && isObject(object[key])) {
            child = removeEmpty(object[key], recursive);
        }

        return isEmpty(child) ? acc : { ...acc, [key]: child };
    }, {});

export const removeIfEmpty = (object:any, ...keys:string[]) => {
  return keys.reduce((acc, key) => {
     let child = object[key];
     return isEmpty(child) ? acc : { ...acc, [key]: child };
  }, {});
}