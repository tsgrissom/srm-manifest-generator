// TODO Consider rename file to `string-grammer.ts`

// TODO jsdoc
// TODO trimStart option
// TODO Unit test
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

/**
 * Checks if given string {@link s} begins with a
 * vowel letter from the Latin alphabet, based on
 * vowel set "aeiou".
 *
 * @param s The string to check for presence of a
 *  Latin vowel character.
 * @returns Whether a vowel character is present
 *  at the beginning of the given string.
 */
// TODO trim start
export const startsWithVowel = (s: string): boolean => {
	const firstLetter = s.substring(0, 1); // TODO firstLetter fn w/ support for trim start
	return ['a', 'e', 'i', 'o', 'u'].includes(firstLetter.toLowerCase());
};

/**
 * Attempts to infer the correct English language indefinite
 * article for a noun based on the first character of the
 * given {@link noun}.
 *
 * * If the first character of the given {@link noun} is a
 *   vowel letter from the Latin alphabet, returns string
 *   literal `"an"`. Otherwise, returns `"a"`.
 * * Simplistic model of the appropriate indefinite article
 *   for a given noun, based on vowel set "aeiou".
 * * If given noun is an edge case where its first letter
 *   has an unexpected sound (e.g. consonant with a vowel
 *   sound), attempt to manually handle instead.
 *
 * @param noun The noun to attempt inference of the
 *  correct English article from.
 * @returns One of either string literal: `"a"` or `"an"`.
 */
// TODO Unit test
// TODO Trim start option
export function indefiniteArticleFor(
	noun: string,
	articleIfConsonant = 'a',
	articleIfVowel = 'an',
): string {
	if (noun.trim() === '') {
		return '';
	}

	return startsWithVowel(noun) ? articleIfVowel : articleIfConsonant;
}

/**
 * Attemps to infer the grammatical number of a given number of
 * things {@link n} based on a simplified model of English
 * grammar.
 *
 * * Infers if `n` is singular or plural, given the assumption
 *   that it refers to a number of things.
 * * If `n` is 1 or `n` is -1, the `n` is singular. Otherwise `n`
 *   is plural.
 *
 * @param n The number of things to attempt inference of
 * @returns Whether `n` is plural or not (singular.)
 */
// TODO Unit test
export function isNumberPlural(n: number): boolean {
	return n !== 1 && n !== -1;
}

/**
 * Attempts to infer the correct English language possessive
 * pronoun for a given number of things {@link n}.
 *
 * * If the is number is plural ({@link isNumberPlural}), returns
 *   string literal `"their"`, otherwise returning `"its"`.
 * * Simplistic model of possessive pronoun grammar for simple
 *   cases only. Manually handle more complex cases.
 *
 * @param n The number of things for which to infer a possessive
 *  pronoun.
 * @param pluralForm The plural form of a possessive pronoun.
 * @param singularForm The singular form of a possessive pronoun.
 * @returns The inferred possessive pronoun based on the given
 *  parameters.
 */
// TODO Unit test
export function possessivePronounFor(
	n: number,
	pluralForm = 'their',
	singularForm = 'its',
): string {
	return isNumberPlural(n) ? pluralForm : singularForm;
}

// TODO Unit test
// TODO jsdoc
export function countNoun(n: number, singular: string, plural?: string): string {
	if (singular.trim() === '') {
		throw new Error(`Arg "singular" must be a non-empty string: "${singular}"`);
	}

	if (plural === undefined || (typeof plural === 'string' && plural.trim() === '')) {
		plural = '';
	}

	if (!plural) {
		if (!singular.endsWith('s') && !singular.endsWith("'")) {
			plural = singular + 's';
		} else if (singular.endsWith('s')) {
			if (singular.length <= 5 || singular.endsWith('ss')) {
				// TODO Check if <= 5 is a statistically sound guess
				plural = singular + 'es';
			}
		}
	}

	let form: string;
	if (n === 1 || n === -1) form = singular;
	else form = plural;

	// if (form.startsWith(' ') || form.endsWith(' ')) form = form.trim();
	if (form.trim() !== form) {
		form = form.trim();
	}

	return form;
}

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
 * @example
 * describeQuantity(0, 'dog'); // -> "0 dogs"
 * describeQuantity(1, 'cat'); // -> "1 cat"
 * describeQuantity(2, 'dog'); // -> "2 dogs"
 * describeQuantity(2, 'dog', 'doggies); // -> "2 doggies"
 */
// TODO Rewrite unit tests
// TODO Rewrite jsdoc (except example)
export function describeQuantity(n: number, singular: string, plural?: string): string {
	const form = countNoun(n, singular, plural);
	return `${n} ${form}`;
}

// TODO jsdoc
// TODO Unit test
// FIXME Trailing delimiter
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
// TODO Custom color for true/false? A lighter green/red to distinguish from ansi green/red
// TODO Move to `type.ts`?
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getTypeDisplayName = (value?: any): string =>
	Array.isArray(value) ? 'array' : `${typeof value}`;
