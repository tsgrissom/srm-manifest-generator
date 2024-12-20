import clr from 'chalk';

import PlainSymbols from './type/PlainSymbols.js';
import StyledSymbols from './type/StyledSymbols.js';

// TODO Phase out hardcoded symbol constants

/** A plain, right-facing, heavy arrow supplementary unicode symbol */
export const UNICODE_ARRW_RIGHT = PlainSymbols.arrowRight.modern,
	/** A plain, right-facing arrow head unicode symbol reminiscent of a playhead */
	UNICODE_PLAY = PlainSymbols.play.modern,
	/** A plain, small checkmark unicode symbol */
	UNICODE_CHECK_SM = PlainSymbols.checkSm.modern,
	/** A plain, bigger checkmark unicode symbol */
	UNICODE_CHECK_LG = PlainSymbols.checkLg.modern,
	/** A plain, small x-mark unicode symbol */
	UNICODE_XMARK_SM = PlainSymbols.xmarkSm.modern,
	/** A plain, bigger x-mark unicode symbol */
	UNICODE_XMARK_LG = PlainSymbols.xmarkLg.modern,
	/** A plain warning sign unicode symbol */
	UNICODE_WARN = PlainSymbols.warn.modern;

/** A small, bright green checkmark unicode symbol */
export const SB_OK_SM = clr.greenBright(UNICODE_CHECK_SM),
	/** A bigger, bright green checkmark unicode symbol */
	SB_OK_LG = clr.greenBright(UNICODE_CHECK_LG),
	/** A bright yellow warning sign unicode symbol */
	SB_WARN = clr.yellowBright(UNICODE_WARN),
	/** A small, bright red x-mark unicode symbol */
	SB_ERR_SM = clr.redBright(UNICODE_XMARK_SM),
	/** A bigger, bright red x-mark unicode symbol */
	SB_ERR_LG = clr.redBright(UNICODE_XMARK_LG),
	SB_SECT_START = StyledSymbols.sectionStart.modern,
	SB_SECT_END_OK = StyledSymbols.sectionEndOk.modern,
	SB_SECT_END_ERR = StyledSymbols.sectionEndErr.modern;

// function test(): void {
// 	clog(PlainSymbols.boxEmpty.modern);

// 	clog(PlainSymbols.boxCheck.modern);

// 	clog(chalk.green(PlainSymbols.boxCheck.modern));

// 	clog(PlainSymbols.boxXmark.modern);

// 	clog(chalk.red(PlainSymbols.boxXmark.modern));

// 	clog('\u26AC Testing this as a delimiter');

// 	clog('\u26CC');

// 	clog('\u2716');
// 	// TODO add as xmark xl
// 	clog(chalk.red('\u26CC'));
// 	clog(chalk.red('\u2716'));
// }
// test();
