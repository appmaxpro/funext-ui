// @ts-expect-error TS(7006): Parameter 'target' implicitly has an 'any' type.
const _removeKey = (target, path) =>
    Object.keys(target).reduce((acc, key) => {
        if (key !== path) {
            return Object.assign({}, acc, { [key]: target[key] });
        }

        return acc;
    }, {});

// @ts-expect-error TS(7023): 'deepRemoveKey' implicitly has return type 'any' b... Remove this comment to see the full error message
export const removeKey = (target, path) => {
    const paths = path.split('.');

    if (paths.length === 1) {
        return _removeKey(target, path);
    }

    const deepKey = paths[0];
    if (target[deepKey] === undefined) {
        return target;
    }
    // @ts-expect-error TS(7022): 'deep' implicitly has type 'any' because it does n... Remove this comment to see the full error message
    const deep = deepRemoveKey(target[deepKey], paths.slice(1).join('.'));

    if (Object.keys(deep).length === 0) {
        return _removeKey(target, deepKey);
    }

    return Object.assign({}, target, { [deepKey]: deep });
};
