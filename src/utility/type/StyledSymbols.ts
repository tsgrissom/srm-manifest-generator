// TODO Once functions for pulling PlainSymbols are done, set up these ones
// TODO Once all of that is done, phase out the hardcoded symbols

import clr from 'chalk';

import PlainSymbols from './PlainSymbols.js';
import UnicodeModeMap from './UnicodeModeMap.js';

/**
 * Sets of symbols with styling such as color applied
 * to them.
 * Which symbol is used in the app is determined by the
 * user configuration, but the default will be the
 * `unicode` option.
 *
 * For non-styled, plain symbol presets: {@link PlainSymbols}
 */
const StyledSymbols: Record<string, UnicodeModeMap> = {
	/** A small, bright green checkmark unicode symbol */
	okSm: {
		modern: '',
		compatibility: '',
		disabled: '',
		description: '',
	},
	/** A bigger, bright green checkmark unicode symbol */
	okLg: {
		modern: '',
		compatibility: '',
		disabled: '',
		description: '',
	},
	/** A bright yellow warning sign unicode symbol */
	warn: {
		modern: '',
		compatibility: '',
		disabled: '',
		description: '',
	},
	/** A small, bright red x-mark unicode symbol */
	errSm: {
		modern: '',
		compatibility: '',
		disabled: '',
		description: '',
	},
	/** A bigger, bright red x-mark unicode symbol */
	errLg: {
		modern: '',
		compatibility: '',
		disabled: '',
		description: '',
	},
	/** A sharp, white, right-facing arrow indicating the start of a section */
	sectionStart: {
		modern: PlainSymbols.arrowRight.modern + ' ', // Fixes weird bug with unicode + chalk styles // TODO Check if it's just my font
		compatibility: PlainSymbols.arrowRight.compatibility + ' ',
		disabled: PlainSymbols.arrowRight.disabled,
		description:
			'A sharp, white, right-facing arrow indicating the start of a section',
	},
	/** A sharp, green, right-facing arrow indicating success at the end of a section */
	sectionEndOk: {
		modern: clr.greenBright(PlainSymbols.arrowRight.modern),
		compatibility: clr.greenBright(PlainSymbols.arrowRight.compatibility),
		disabled: clr.greenBright(PlainSymbols.arrowRight.disabled),
		description:
			'A sharp, bright green, right-facing arrow indicating success at the end of a section',
	},
	/** A sharp, bright red, right-facing arrow indicating failure at the end of a section */
	sectionEndErr: {
		modern: clr.redBright(PlainSymbols.arrowRight.modern),
		compatibility: clr.redBright(PlainSymbols.arrowRight.compatibility),
		disabled: clr.redBright(PlainSymbols.arrowRight.disabled),
		description:
			'A sharp, bright red, right-facing arrow indicating failure at the end of a section',
	},
};

export default StyledSymbols;
