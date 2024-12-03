import clr from 'chalk';

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

function isWrapped() {
    
}

function isSingleQuoted() {

}

function isDoubleQuoted() {

}

function isQuoted() {

}