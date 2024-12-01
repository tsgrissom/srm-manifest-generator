
export const setOfFalsy = [false, '', null, undefined, NaN];
export const setOfNonArrays = [{}, 'string', 7, 3.14, null, undefined, NaN];
export const setOfBooleans = [[], {}, 'string', 7, 3.14, null, undefined, NaN];
export const setOfNonStrings = [[], {}, 7, 3.14, null, undefined, NaN];
export const unionOfNonArraysAndNonStrings = Array.from(new Set([...setOfNonArrays, ...setOfNonStrings]));

export const setOfEmptyAndWhitespaceStrings = ['', '   ', ' '];