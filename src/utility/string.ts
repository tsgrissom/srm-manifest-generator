// MARK: Fn capitalize
// TODO jsdoc
// TODO TEST Unit
export function capitalize(str: string) {
    if (str.trim() === '') {
        return str;
    }
    const firstLetter = str.substring(0, 1);
    const restOfStr   = str.substring(1, str.length);

    return firstLetter.toUpperCase() + restOfStr;
}

// MARK: Fn countString
// TODO jsdoc
// TODO TEST Unit
export function countString(numberOfThings: number, singularNoun: string, pluralNoun: string = '') {
    if (typeof(numberOfThings) !== 'number')
        throw new TypeError(`Arg numberOfThings must be a number: ${numberOfThings}`);
    // TODO Recode to account for typescript

    pluralNoun = pluralNoun || `${singularNoun}s`; 

    const verbiage = (numberOfThings === 0 || numberOfThings > 1) ? pluralNoun : singularNoun;
    return `${numberOfThings} ${verbiage}`;
};

// MARK: getDelimitedList
// TODO jsdoc
// TODO TEST Unit
export function delimitedList(items: string[], delimiter: string = ', ') {
    if (!items)
        throw new Error(`Cannot create delimited list from given items: ${items}`);
    if (!delimiter)
        throw new Error(`Cannot create delimited list using given delimiter: ${delimiter}`);

    if (!Array.isArray(items)) {
        if (typeof items === 'string') {
            return items;
        } else {
            throw new Error(`Cannot create comma-delimited list from input which is neither an array nor a string: ${items}`);
        }
    }

    if (items.length === 0)
        return '';

    let list = '';
    const size = items.length;

    for (const [index, entry] of items.entries()) {
        if (typeof entry !== 'string')
            throw new Error(`Element ${index} of given array is a non-string type: ${entry}`);

        list += entry;

        if (index < size)
            list += delimiter;
    }

    return list;
}