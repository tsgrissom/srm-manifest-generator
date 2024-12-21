// TODO Rewrite all jsdocs to account for QuoteOperationOptions

import { isWrapped, unwrap, wrap } from './wrap.js';

// TODO jsdocs
export interface QuoteOperationOptions {
	singleQuotes: boolean;
	force: boolean;
	partialWrap: boolean;
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
