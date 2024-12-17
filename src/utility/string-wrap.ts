import { isDebugActive } from './debug';

// MARK: WRAPPING
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
export function isWrapped(s: string, sequence: string): boolean {
	return s.startsWith(sequence) && s.endsWith(sequence);
}

/**
 * Checks if a string starts with but does not end with a sequence
 *  of characters.
 * @param str The string to check.
 * @param sequence The sequence to check for.
 * @returns Whether the {@link str} starts but does not end with
 *  {@link sequence}.
 */
function startsButDoesNotEndWith(str: string, sequence: string): boolean {
	return str.startsWith(sequence) && !str.endsWith(sequence);
}

/**
 * Checks if a string does not start with but does end with a sequence
 *  of characters.
 * @param str The string to check.
 * @param sequence The sequence to check for.
 * @returns Whether the {@link str} ends with but does not start with the
 *  given {@link sequence}.
 */
function endsButDoesNotStartWith(str: string, sequence: string): boolean {
	return !str.startsWith(sequence) && str.endsWith(sequence);
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
function wrap(s: string, sequence: string, force = false, fixPartialWrap = false): string {
	const doWrap = () => sequence + s + sequence;

	if (force) return doWrap();
	else {
		const alreadyStarts = s.startsWith(sequence);
		const alreadyEnds = s.endsWith(sequence);

		if (alreadyStarts && alreadyEnds) return s;

		const warnPartialWrap = (startsOrEnds: string) => {
			if (isDebugActive()) {
				console.warn(
					`wrap() invoked on a string that already ${startsOrEnds} with the given sequence, will be unmodified because arg force was false`
				);
				console.warn(`- string: ${s}`);
				console.warn(`- sequence: ${sequence}`);
			} else {
				console.warn(
					`wrap() invoked on a partially wrapped string: Enable debug mode with --debug command flag for more details`
				);
			}
		};

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
 * @param str The string to remove from the given character {@link sequence}.
 * @param sequence The sequence of characters to remove from the given
 *  string {@link str}
 * @returns
 */
export function unwrap(
	str: string,
	sequence: string,
	removePartialWrap = false
): string {
	if (sequence === '') {
		throw new Error(
			`Arg "sequence" cannot be an empty string: "${sequence}"`
		);
	}

	if (!isWrapped(str, sequence)) {
		if (startsButDoesNotEndWith(str, sequence)) {
			// Partial wrap, leading
			if (removePartialWrap) {
				return str.substring(sequence.length);
			} else {
				return str;
			}
		} else if (endsButDoesNotStartWith(str, sequence)) {
			// Partial wrap, trailing
			if (removePartialWrap) {
				return str.substring(0, str.length - sequence.length);
			} else {
				return str;
			}
		} else {
			// Since is not wrapped, no wrap present
			return str;
		}
	} // Is wrapped in sequence

	// Full wrap removal: Remove leading and trailing sequences
	const seqLen = sequence.length;
	if (seqLen > 0 && str.startsWith(sequence) && str.endsWith(sequence)) {
		str = str.substring(seqLen, str.length - seqLen);
	}

	return str;
}

// MARK: QUOTING

/**
 * Checks if a given string is wrapped in single quotes (the `'` character.)
 * @param s The string which will be searched at its start and end
 *  for the presence of the `'` character.
 * @returns A `boolean` indicating whether or not the `'` character
 *  was found at the start and end of the string {@link s}.
 */
export function isSingleQuoted(s: string): boolean {
	return isWrapped(s, `'`);
}

/**
 * Checks if a given string is wrapped in quotation marks (double quotes.)
 * @param s The string which will be searched at its start and end
 *  for the presence of the `"` character.
 * @returns A `boolean` indicating whether or not the `"` character
 *  was found at the start and end of the string `s`.
 */
export function isDoubleQuoted(s: string): boolean {
	return isWrapped(s, `"`);
}

/**
 * Checks if a given string is quoted, i.e. wrapped in quotation marks.
 * By default, the only accepted quotation marks are double-quote
 * characters `"`.
 * @param str The string which will be checked at its start and end
 *  for the presence of an acceptable quotation mark character.
 * @param acceptSingleQuotes Whether single quote characters (`'`)
 *  should be accepted if present. Otherwise, if left to default,
 *  only double-quote characters will be accepted (`"`).
 * @returns A `boolean` indicating whether or not an acceptable
 *  quotation mark character was found at the start and end of the
 *  string {@link str}.
 */
function isQuoted(
	str: string,
	acceptSingleQuotes = false
) : boolean {
	const isSingle = isSingleQuoted(str);
	return acceptSingleQuotes && isSingle ? isSingle : isDoubleQuoted(str);
}

/**
 * Wraps a given string in single quotation mark character `'`.
 * By default, only wraps if the characters are not already present.
 * @param str The string to wrap.
 * @param force Whether to forcibly wrap the string in single quotes
 *  even if they are already present.
 * @param fixPartialWrap Whether to, if the {@link str} starts but does
 *  not end with the single quote character, or vice versa, "repair" the
 *  wrapping by adding the missing side's quotation mark.
 * @returns The wrapped string.
 */
function singleQuote(
	str: string,
	force = false,
	fixPartialWrap = false
) : string {
	return wrap(str, `'`, force, fixPartialWrap);
}

// TODO When done, find and replace symbol in code: "${
/**
 * Wraps a given string in the double quotation mark character `"`.
 * By default, only wraps if the characters are not already present.
 * @param str The string to wrap.
 * @param force Whether to forcibly wrap the string in double quotes
 *  even if they are already present.
 * @param fixPartialWrap Whether to, if the {@link str} starts but does
 *  not end with the double quote character, or vice versa, "repair" the
 *  wrapping by adding the missing side's quotation mark.
 * @returns The wrapped string.
 */
function doubleQuote(
	str: string,
	force = false,
	fixPartialWrap = false
) : string {
	return wrap(str, `"`, force, fixPartialWrap);
}

export function quote(
	str: string,
	useSingleQuotes = false,
	force = false,
	fixPartialWrap = false
) : string {
	if ((isDoubleQuoted(str) || (isSingleQuoted(str) && useSingleQuotes)) && !force) {
		return str;
	}

	const sequence = useSingleQuotes ? `'` : `"`;
	return wrap(str, sequence, force, fixPartialWrap);
}

function unquote(
	str: string,
	useSingleQuotes = false,
	removePartialWrap = false
): string {
	if (!isQuoted(str, useSingleQuotes) ) {
        const sequence = useSingleQuotes ? `'` : '"';
        if (startsButDoesNotEndWith(str, sequence)) {
		} else if (endsButDoesNotStartWith(str, sequence)) {
		}
		return str;
	} else if (isSingleQuoted(str) && useSingleQuotes) {
		return unwrap(str, `'`, removePartialWrap);
	} else if (isDoubleQuoted(str)) {
		return unwrap(str, `"`, removePartialWrap);
	}
	return str;
}