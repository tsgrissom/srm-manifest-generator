import chalk from 'chalk';
import { PathLike } from 'node:fs';

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

// MARK: Fn getFormattedBoolean
// TODO jsdoc
// TODO TEST Unit
// TODO More flexible abstract fn
export function yesNo(
    b: boolean, 
    color: boolean = true, 
    capitalized: boolean = true, 
    trueStr: string = 'yes', 
    falseStr: string = 'no'
) {
    let str = b ? trueStr : falseStr;
    if (capitalized) {
        str = capitalize(str);
    }
    return color ? (b ? chalk.greenBright(str) : chalk.redBright(str)) : str;
}

export function enabledDisabled(b: boolean, withColor: boolean = true, withCapitalization: boolean = true) {
    return yesNo(b, withColor, withCapitalization, 'enabled', 'disabled');
}

// MARK: Fn countString
// TODO jsdoc
// TODO TEST Unit
export function countString(numberOfThings: number, singularNoun: string, pluralNoun: string = '') {
    if (typeof(numberOfThings) !== 'number')
        throw new Error(`Non-numeric arg numberOfThings: ${numberOfThings}`);
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

export function stylePath(filePath: PathLike, valid: boolean = false) {
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