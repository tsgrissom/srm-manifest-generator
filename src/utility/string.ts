import clr from 'chalk';
import { isDebugActive } from './debug';

export const SYMB_CHECKMARK_SM = '\u2713';
export const SYMB_CHECKMARK_LG = '\u2714';
export const SYMB_XMARK_SM     = '\u2715';
export const SYMB_XMARK_LG     = '\u2716';

export const SYMB_OK_SM  = clr.greenBright(SYMB_CHECKMARK_SM);
export const SYMB_OK_LG  = clr.greenBright(SYMB_CHECKMARK_LG);
export const SYMB_ERR_SM = clr.redBright(SYMB_XMARK_SM);
export const SYMB_ERR_LG = clr.redBright(SYMB_XMARK_LG);

// console.log(`ok sm: ${SYMB_OK_SM}`)
// console.log(`ok lg: ${SYMB_OK_LG}`)
// console.log(`err sm: ${SYMB_ERR_SM}`)
// console.log(`err lg: ${SYMB_ERR_LG}`)

// MARK: capitalize

// TODO jsdoc
// TODO TEST Unit
export function capitalize(str: string) {
    if (str.trim() === '') return str;
    
    const firstLetter = str.substring(0, 1);
    const restOfStr   = str.substring(1, str.length);

    return firstLetter.toUpperCase() + restOfStr;
}

function isCapitalized() {
    // TODO
}

// MARK: describeQuantity

// TODO TEST Unit
/**
 * Creates a phrase which counts the quantity of some things.
 * If the {@link plural} form is not given, attempts to apply a
 * few logical rules of English grammar in creating a plural form,
 * but the solution is not perfect. For accuracy, provide a matching
 * pair of singular and plural nouns.
 * 
 * Examples:
 * input(n=0, singular='dog', plural='') -> output='0 dogs'
 * input(n=1, singular='cat', plural='') -> output='1 cat'
 * 
 * @param n The number of things to use as basis for determining
 *  how the quantity might be phrased.
 * @param singular The singular form of the desired noun.
 * @param plural The plural form of the desired noun. Will attempt
 *  to be inferred if absent or empty.
 * @returns A `string` containing the created quantity description.
 */
export function describeQuantity(n: number, singular: string, plural?: string) {
    if (typeof(n) !== 'number')
        throw new TypeError(`Arg n must be a number: ${n}`);

    if (singular.trim() === '')
        throw new Error(`Arg singular must be a non-empty string: ${singular}`);
    if (plural === undefined || plural.trim() === '')
        plural = '';

    if (!plural) {
        if (!singular.endsWith('s') && !singular.endsWith("'")) {
            plural = singular + 's';
        } else if (singular.endsWith('s')) {
            if (singular.length <= 5 || singular.endsWith('ss')) {
                plural = singular + 'es';
            }
        }
    }

    let form: string;
    if (n === 1 || n === -1) form = singular;
    else form = plural;

    if (form.startsWith(' ') || form.endsWith(' '))
        form = form.trim();

    return `${n} ${form}`;
};

// MARK: delimitedList
// TODO jsdoc
// TODO TEST Unit
export function delimitedList(items: string[], delimiter: string = ', ') : string {
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

function multilineList() {
    // TODO
}

// MARK: Wrapping

// TODO TEST Whole section

/**
 * Checks if a string is wrapped by a character sequence, i.e.
 * if the sequence is at both the start and the end of the string.
 * @param s The string which will be searched at its start and end
 *  for the presence of the given {@link sequence}.
 * @param sequence The sequence of characters to search for at the
 *  start and end of string {@link s}. 
 * @returns A `boolean` representing whether or not the {@link sequence}
 *  was found at the start and end of the string {@link s}.
 */
function isWrapped(s: string, sequence: string) : boolean {
    return s.startsWith(sequence) && s.endsWith(sequence);
}

/**
 * Checks if a given string is wrapped in single quotes (the `'` character.)
 * @param s The string which will be searched at its start and end
 *  for the presence of the `'` character.
 * @returns A `boolean` indicating whether or not the `'` character
 *  was found at the start and end of the string {@link s}.
 */
function isSingleQuoted(s: string) : boolean {
    return isWrapped(s, `'`);
}

/**
 * Checks if a given string is wrapped in quotation marks (double quotes.)
 * @param s The string which will be searched at its start and end
 *  for the presence of the `"` character.
 * @returns A `boolean` indicating whether or not the `"` character
 *  was found at the start and end of the string `s`.
 */
function isDoubleQuoted(s: string) : boolean {
    return isWrapped(s, `"`);
}

/**
 * Checks if a given string is quoted, i.e. wrapped in quotation marks.
 * By default, the only accepted quotation marks are double-quote
 * characters `"`.
 * @param s The string which will be checked at its start and end
 *  for the presence of an acceptable quotation mark character.
 * @param acceptSingleQuotes Whether single quote characters (`'`)
 *  should be accepted if present. Otherwise, if left to default,
 *  only double-quote characters will be accepted (`"`).
 * @returns A `boolean` indicating whether or not an acceptable
 *  quotation mark character was found at the start and end of the
 *  string {@link s}.
 */
function isQuoted(s: string, acceptSingleQuotes = false) : boolean {
    const isSingle = isSingleQuoted(s);
    return (acceptSingleQuotes && isSingle) ? isSingle : isDoubleQuoted(s);
}

/**
 * Wraps a string with a sequence of characters, prepending and appending the
 * sequence to the string if it is not already present. If it is already present,
 * the string will not be modified unless {@link force} is set to `true`.
 * @param s The string to wrap in the character {@link sequence}.
 * @param sequence The characters to wrap the string {@link s} in.
 * @param force Whether the sequence should be forcibly applied to the start and
 *  end of the string without consideration for if it is already present.
 * @param fixPartialWrap Whether a given string which starts with the sequence but
 *  does not end with it, or vice-versa, should have the sequence added to the
 *  missing side.
 * @returns The resulting `string`, which will be wrapped in the sequence if it
 *  was not already present.
 */
function wrap(s: string, sequence: string, force = false, fixPartialWrap = false) : string {
    const doWrap = () => sequence + s + sequence;

    if (force)
        return doWrap();
    else {
        const alreadyStarts = s.startsWith(sequence);
        const alreadyEnds   = s.endsWith(sequence);

        if (alreadyStarts && alreadyEnds)
            return s;

        const warnPartialWrap = (startsOrEnds: string) => {
            if (isDebugActive()) {
                console.warn(`wrap() invoked on a string that already ${startsOrEnds} with the given sequence, will be unmodified because arg force was false`);
                console.warn(`- string: ${s}`);
                console.warn(`- sequence: ${sequence}`);
            } else {
                console.warn(`wrap() invoked on a partially wrapped string: Enable debug mode with --debug command flag for more details`);
            }
        }

        if (alreadyStarts && !alreadyEnds) {
            if (fixPartialWrap) {
                return s + sequence;
            } else {
                warnPartialWrap('starts');
                return s;
            }
        } else if (!alreadyStarts && alreadyEnds) {
            if (fixPartialWrap) {
                return sequence + s;
            } else {
                warnPartialWrap('ends');
                return s;
            }
        }

        return doWrap();
    }
}

/**
 * Unwraps a string by checking if a sequence of characters is present at both
 * the start and the end of the given string and removing them if present.
 * The resulting string is returned. If the sequence is not present, the
 * string will not be modified.
 * @param s The string to remove from the given character {@link sequence}.
 * @param sequence The sequence of characters to remove from the given
 *  string {@link s}
 * @returns
 */
function unwrap(s: string, sequence: string, removePartialWrap = false) : string {
    if (!isWrapped(s, sequence)) return s;
    
    // TODO

    return s;
}

function singleQuote(s: string, force = false) : string {
    // TODO
    return s;
}

// TODO When done, find and replace symbol in code: "${
function doubleQuote(s: string, force = false) : string {
    // TODO
    return s;
}

function quote(s: string, useSingleQuotes = false, force = false) : string {
    if ((isDoubleQuoted(s) || (isSingleQuoted(s) && useSingleQuotes)) && !force)
        return s;
    return wrap(s, useSingleQuotes ? `'` : `"`, force);
}

function unquote(s: string, useSingleQuotes = false) : string {
    if (!isQuoted(s, useSingleQuotes)) return s;
    else if (isSingleQuoted(s) && useSingleQuotes) return unwrap(s, `'`);
    else if (isDoubleQuoted(s)) return unwrap(s, `"`);
    return s;
}