// TODO Functions for pulling symbols, fallback symbols, etc. based on config

import UnicodeModeMap from './UnicodeModeMap.js';

/**
 * Sets of plain symbols free of any styling.
 * Which symbol is used in the app is determined
 * by the user configuration, but the default will
 * be the `unicode` option.
 *
 * For styled symbol presets: {@link StyledSymbols}
 */
const PlainSymbols: Record<string, UnicodeModeMap> = {
	// MARK: Checkmarks
	/** A plain, small checkmark unicode symbol */
	checkSm: {
		modern: '\u2713',
		compatibility: '\u2713',
		disabled: '√',
		description: 'A plain, small checkmark symbol',
	},
	/** A plain, bigger checkmark unicode symbol */
	checkLg: {
		modern: '\u2714',
		compatibility: '\u2714',
		disabled: '√',
		description: 'A plain, bigger checkmark symbol',
	},
	// MARK: X-Marks
	/** A plain, small x-mark unicode symbol */
	xmarkSm: {
		modern: '\u2715',
		compatibility: '\u2715',
		disabled: 'x',
		description: 'A plain, small x-mark symbol',
	},
	/** A plain, bigger x-mark unicode symbol */
	xmarkLg: {
		modern: '\u2716',
		compatibility: '\u2716',
		disabled: 'X',
		description: 'A plain, bigger x-mark symbol',
	},
	// MARK: Warning
	/** A plain warning sign unicode symbol */
	warn: {
		modern: '\u26A0',
		compatibility: '\u26A0',
		disabled: '!',
		description: 'A plain warning sign symbol',
	},
	// MARK: Arrows
	/** A plain, right-facing, heavy arrow supplementary unicode symbol */
	arrowRight: {
		modern: String.fromCodePoint(0x1f846),
		compatibility: '\uD83C\uDF0A', // TODO Test manually encoded surrogate pair for older envs
		disabled: '->',
		description: 'A plain, right-facing, heavy arrow symbol',
	},
	/** A plain, right-facing arrow head unicode symbol reminiscent of a playhead */
	play: {
		modern: '\u2BC8',
		compatibility: '\u2BC8',
		disabled: '>>',
		description: 'A plain, right-facing arrow head symbol reminiscent of a playhead',
	},
	// MARK: Boxes
	boxEmpty: {
		modern: '\u2610',
		compatibility: '\u2610',
		disabled: '[]',
		description: 'A hollow square symbol',
	},
	boxCheck: {
		modern: '\u2611',
		compatibility: '\u2611',
		disabled: '[√]',
		description: 'A hollow square with a checkmark inside it',
	},
	boxXmark: {
		modern: '\u2612',
		compatibility: '\u2612',
		disabled: '[x]',
		description: 'A hollow square with an x-mark inside it',
	},
};

export default PlainSymbols;
