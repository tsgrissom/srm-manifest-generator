// MARK: GRAMMATICAL

// TODO jsdoc
// TODO trimStart option
// TEST Unit
export const capitalize = (s: string): string => {
	if (s.trim() === '' || s.length < 1) return s;

	const firstChar = s.substring(0, 1);

	if (s.length === 1) {
		return firstChar.toUpperCase();
	} else {
		const theRest = s.substring(1, s.length);
		return firstChar.toUpperCase() + theRest;
	}
};

// TODO jsdoc
// TODO Consider edge cases: Unicode, escape chars, non-alphabetic characters
export const isCapitalized = (s: string, trimStart = false): boolean => {
	if (s.trim() === '') {
		return false;
	} else {
		if (trimStart) {
			s = s.trimStart();
		}
	}

	const firstChar = s.substring(0, 1);
	return firstChar.toLowerCase() !== firstChar;
};

// TODO trim start
/**
 * Checks if given string {@link s} begins with a
 * Latin alphabet vowel character.
 * @param s The string to check for presence of a
 *  Latin vowel character.
 * @returns Whether a vowel character is present
 *  at the beginning of the given string.
 */
export const startsWithVowel = (s: string): boolean => {
	const firstLetter = s.substring(0, 1); // TODO firstLetter fn w/ support for trim start
	return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter.toLowerCase());
};

/**
 * Attempts to infer an English indefinite article for a
 * given noun based on the first letter of the given
 * argument: Either "a" or "an".
 *
 * If your noun is an edge case where its first letter is
 * a consonant but has a vowel sound, don't use this method
 * and try to hardcode a solution.
 *
 * @param noun The noun to attempt inference of the
 *  correct English article from.
 * @returns One of either string literal: `"a"` or `"an"`.
 */
// TEST Unit
export const indefiniteArticleFor = (noun: string): string => {
	noun = `${noun}`;
	if (noun.trim() === '') return '';
	return startsWithVowel(noun) ? 'an' : 'a';
};

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
export function describeQuantity(n: number, singular: string, plural?: string): string {
	if (singular.trim() === '') {
		throw new Error(`Arg singular must be a non-empty string: ${singular}`);
	}
	if (plural === undefined || (typeof plural === 'string' && plural.trim() === '')) {
		plural = '';
	}

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

	if (form.startsWith(' ') || form.endsWith(' ')) form = form.trim();

	return `${n} ${form}`;
}

// TODO jsdoc
// TODO TEST Unit
export function delimitedList(items: string | Array<string>, delimiter = ', '): string {
	if (typeof items === 'string') {
		return items;
	}

	if (!delimiter) {
		throw new Error(`Arg "delimiter" must be a non-empty string: ${delimiter}`);
	}

	let list = '';
	const size = items.length;

	if (Array.isArray(items) && items.length > 0) {
		for (const [index, entry] of items.entries()) {
			list += entry;

			if (index < size) list += delimiter;
		}
	}

	return list;
}

// function multilineList() {
// 	// TODO
// }

/**
 * Checks the type of the given value and returns a display name
 * which differentiates between objects and arrays, the latter
 * of which are described as type `object` by `typeof`.
 *
 * * Essentially, returns the output of typeof with the addition
 *   of an `array` type name.
 *
 * @param value The value to type check for an array-inclusive
 *  type display name `string`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTypeDisplayName = (value?: any): string =>
	Array.isArray(value) ? 'array' : `${typeof value}`;
