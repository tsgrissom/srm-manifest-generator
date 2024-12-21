// TODO Update all jsdocs to reflect new WrapOperationParams

// TODO jsdoc
export interface WrapOperationParams {
	/** The string which will have wrap operations applied to it */
	str: string;
	/** The sequence of characters to apply to wrap operations */
	seq: string;
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
