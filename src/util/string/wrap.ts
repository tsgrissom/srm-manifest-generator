// TODO Update all jsdocs to reflect new WrapOperationParams

// TODO jsdoc
export interface WrapOperationParams {
	/** The string which will have wrap operations applied to it */
	str: string;
	/** The sequence of characters to apply to wrap operations */
	seq: string;
}

// TODO jsdocs
export interface QuoteOperationOptions {
	singleQuotes: boolean;
	force: boolean;
	partialWrap: boolean;
}

// MARK: startsButDoesNotEndWith
/**
 * Checks if a string starts with but does not end with a sequence
 *  of characters.
 * @param str The string to check.
 * @param sequence The sequence to check for.
 * @returns Whether the {@link str} starts but does not end with
 *  {@link sequence}.
 */
export function startsButDoesNotEndWith(str: string, sequence: string): boolean {
	return str.startsWith(sequence) && !str.endsWith(sequence);
}

// MARK: endsButDoesNotStartWith
/**
 * Checks if a string does not start with but does end with a sequence
 *  of characters.
 * @param str The string to check.
 * @param sequence The sequence to check for.
 * @returns Whether the {@link str} ends with but does not start with the
 *  given {@link sequence}.
 */
export function endsButDoesNotStartWith(str: string, sequence: string): boolean {
	return !str.startsWith(sequence) && str.endsWith(sequence);
}

// MARK: isWrapped
/**
 * Checks if a string is wrapped by a character sequence, i.e.
 * if the sequence is at both the start and the end of the string.
 * @param str The string which will be searched at its start and end
 *  for the presence of the given {@link sequence}.
 * @param sequence The sequence of characters to search for at the
 *  start and end of string {@link str}.
 * @returns A `boolean` representing whether or not the {@link sequence}
 *  was found at the start and end of the string {@link str}.
 */
export function isWrapped(params: WrapOperationParams): boolean {
	const { str, seq } = params;
	return str.startsWith(seq) && str.endsWith(seq);
}

// MARK:  wrap
/**
 * Wraps a string with a sequence of characters, prepending and appending the
 * sequence to the string if it is not already present. If it is already present,
 * the string will not be modified unless {@link force} is set to `true`.
 * @param str The string to wrap in the character {@link seq}.
 * @param sequence The characters to wrap the string {@link str} in. // TODO Update jsdoc
 * @param force Whether the sequence should be forcibly applied to the start and
 *  end of the string without consideration for if it is already present.
 * @param fixPartialWrap Whether a given string which starts with the sequence but
 *  does not end with it, or vice-versa, should have the sequence added to the
 *  missing side.
 * @returns The resulting `string`, which will be wrapped in the sequence if it
 *  was not already present.
 */
export function wrap(
	params: WrapOperationParams,
	force = false,
	fixPartialWrap = false,
): string {
	const { str, seq } = params;

	if (seq === '') {
		throw new Error(`Arg "params.seq" cannot be an empty string: "${seq}"`);
	}

	const doWrap = (): string => seq + str + seq;
	const alreadyStarts = str.startsWith(seq);
	const alreadyEnds = str.endsWith(seq);

	if (force || (!alreadyStarts && !alreadyEnds)) {
		return doWrap();
	}

	if (alreadyStarts && alreadyEnds) {
		return str;
	}

	if (startsButDoesNotEndWith(str, seq)) {
		if (fixPartialWrap) {
			return str + seq;
		} else {
			return str;
		}
	}

	if (endsButDoesNotStartWith(str, seq)) {
		if (fixPartialWrap) {
			return seq + str;
		} else {
			return str;
		}
	}

	return doWrap();
}

// MARK: unwrap
/**
 * Unwraps a string by checking if a sequence of characters is present at both
 * the start and the end of the given string and removing them if present.
 * The resulting string is returned. If the sequence is not present, the
 * string will not be modified.
 * @param str The string to remove from the given character {@link seq}.
 * @param sequence The sequence of characters to remove from the given
 *  string {@link str}
 * @returns
 */
export function unwrap(params: WrapOperationParams, removePartialWrap = false): string {
	const { str, seq } = params;

	if (seq === '') {
		throw new Error(`Arg "params.seq" cannot be an empty string: "${seq}"`);
	}

	if (!isWrapped(params)) {
		if (startsButDoesNotEndWith(str, seq)) {
			// Partial wrap, leading
			if (removePartialWrap) {
				return str.substring(seq.length);
			} else {
				return str;
			}
		} else if (endsButDoesNotStartWith(str, seq)) {
			// Partial wrap, trailing
			if (removePartialWrap) {
				return str.substring(0, str.length - seq.length);
			} else {
				return str;
			}
		} else {
			// Since is not wrapped, no wrap present
			return str;
		}
	} // Is wrapped in sequence

	// Full wrap removal: Remove leading and trailing sequences
	const seqLen = seq.length;
	if (seqLen > 0 && str.startsWith(seq) && str.endsWith(seq)) {
		return str.substring(seqLen, str.length - seqLen);
	}

	return str;
}

// MARK: isSingleQuoted
/**
 * Checks if a given string is wrapped in single quotes (the `'` character.)
 * @param str The string which will be searched at its start and end
 *  for the presence of the `'` character.
 * @returns A `boolean` indicating whether or not the `'` character
 *  was found at the start and end of the string {@link str}.
 */
export function isSingleQuoted(str: string): boolean {
	return isWrapped({ str: str, seq: `'` });
}

// MARK: isDoubleQuoted
/**
 * Checks if a given string is wrapped in quotation marks (double quotes.)
 * @param s The string which will be searched at its start and end
 *  for the presence of the `"` character.
 * @returns A `boolean` indicating whether or not the `"` character
 *  was found at the start and end of the string `s`.
 */
export function isDoubleQuoted(str: string): boolean {
	return isWrapped({ str: str, seq: `"` });
}

// MARK: isQuoted
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
export function isQuoted(str: string, acceptSingleQuotes = false): boolean {
	const isSingle = isSingleQuoted(str);
	return acceptSingleQuotes && isSingle ? isSingle : isDoubleQuoted(str);
}

// MARK: singleQuote
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
export function singleQuote(str: string, force = false, fixPartialWrap = false): string {
	return wrap({ str: str, seq: `'` }, force, fixPartialWrap);
}

// MARK: doubleQuote
// TODO When done, find and replace symbol in code: "${
/**
 * Wraps a given string in the double quotation mark character `"`.
 * By default, only wraps if the characters are not already present.
 * @param str The string to wrap.
 * @param force Whether to forcibly wrap the string in double quotes
 *  even if they are already present.
 * @param fixPartialWrap Whether to, if the {@link str} starts but does
 *  not end with the double quote character, or vice versa, "repair" the
 *  wrapping by adding the quotation mark to the missing side.
 * @returns The wrapped string.
 */
export function doubleQuote(str: string, force = false, fixPartialWrap = false): string {
	return wrap({ str: str, seq: `"` }, force, fixPartialWrap);
}

// MARK: quote
/**
 * Wraps a given string in quotation marks, preferring double quotes
 * by default.
 * @param str The string to wrap.
 * @param useSingleQuotes Whether to use single quotes instead of
 *  double quotes.
 * @param force Whether to forcibly wrap the string in quotation marks
 *  even if they are already present.
 * @param fixPartialWrap Whether to, if ${@link str} starts but does not
 *  end with the given quotation mark, or vice versa, "repair" the
 *  wrapping by adding the quotation mark to the missing side.
 * @returns The given string wrapped in quotation marks.
 */
export function quote(
	str: string,
	options: QuoteOperationOptions = {
		singleQuotes: false,
		force: false,
		partialWrap: false,
	},
): string {
	const { singleQuotes, force, partialWrap } = options;

	const sequence = singleQuotes ? `'` : `"`;
	return wrap({ str: str, seq: sequence }, force, partialWrap);
}

// MARK: unquote
/**
 * Unwraps a given string, removing its quotation marks, which by
 * default will be double quotes.
 * @param str The string to unwrap.
 * @param useSingleQuotes Whether to look for and remove single
 *  quotes instead of double quotes.
 * @param removePartialWrap Whether to, if {@link str} starts but does not
 *  end with the given quotation mark, or vice versa, remove the one-sided
 *  wrap from the present side.
 * @returns The string unwrapped of quotation marks.
 */
export function unquote(
	str: string,
	options: QuoteOperationOptions = {
		singleQuotes: false,
		force: false,
		partialWrap: false,
	},
): string {
	const { singleQuotes, partialWrap } = options;
	const sequence = singleQuotes ? `'` : `"`;

	if (isWrapped({ str: str, seq: `"` }) && singleQuotes) {
		return unwrap({ str: str, seq: `"` }, partialWrap);
	}

	return unwrap({ str: str, seq: sequence }, partialWrap);
}
