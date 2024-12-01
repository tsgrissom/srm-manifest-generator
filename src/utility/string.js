import chalk from 'chalk';

// MARK: Fn capitalize
// TODO jsdoc
// TODO TEST Unit
export function capitalize(str) {
    if (str.trim() === '') {
        return str;
    }
    const firstLetter = str.substring(0, 1);
    const restOfStr   = str.substring(1, str.length);

    return firstLetter.toUpperCase() + restOfStr;
}

// MARK: Fn getFormattedBoolean
// TODO jsdoc
// TODO TEST Unit
// TODO More flexible abstract fn
export function yesNo(b, withColor = true, withCapitalization = true, trueStr = 'yes', falseStr = 'no') {
    let str = b ? trueStr : falseStr;
    if (withCapitalization) {
        str = capitalize(str);
    }
    return withColor ? (b ? chalk.greenBright(str) : chalk.redBright(str)) : str;
}

export function enabledDisabled(b, withColor = true, withCapitalization = true) {
    return yesNo(b, withColor, withCapitalization, 'enabled', 'disabled');
}

// MARK: Fn countString
// TODO jsdoc
// TODO TEST Unit
export function countString(numberOfThings, singularNoun, pluralNoun = null) {
    if (typeof(numberOfThings) !== 'number') {
        throw new Error(`Non-numeric arg numberOfThings: ${numberOfThings}`);
    }

    pluralNoun = pluralNoun || `${singularNoun}s`; 

    const verbiage = (numberOfThings === 0 || numberOfThings > 1) ? pluralNoun : singularNoun;
    return `${numberOfThings} ${verbiage}`;
};

// MARK: getDelimitedList
// TODO jsdoc
// TODO TEST Unit
export function delimitedList(items, delimiter = ', ') {
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

    for (const [item, index] of items) {
        if (typeof item !== 'string')
            throw new Error(`Element ${index} of given array is a non-string type: ${item}`);

        list += item;

        if (index < size)
            list += delimiter;
    }

    return list;
}

export function stylePath(filePath, valid = false) {
    if (typeof filePath !== 'string')
        throw new Error(`Unable to style non-string filePath argument: ${filePath}`);
    if (typeof valid !== 'boolean')
        throw new Error(`Unable to style with non-boolean "valid" argument: ${valid}`);

    if (!filePath.startsWith('"'))
        filePath = '"' + filePath;

    if (!filePath.endsWith('"'))
        filePath = filePath + '"';

    return valid ? chalk.greenBright(filePath) : chalk.redBright(filePath);
}