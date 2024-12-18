import clr from 'chalk';

import { capitalize as strCapitalize } from './string';

import BoolFmtOptions from './type/BoolFmtOptions';
import BoolFmtPreset from './type/BoolFmtPreset';

/**
 * TODO Benchmark faster to store all four truth+capitalization values (trueUpper, falseLower, etc.) than current impl
 * TODO Options for color customization
 * TODO Options for formatting (bold, italic, underline)
 * TODO Test unit
 */
/**
 * Formats a given `boolean` into a prettier string with context-dependent
 * formatting as well as options for color-coding and auto-capitalization.
 *
 * This is the abstract version of my boolean formatter. See {@link fmtBool} for
 * a version with extensible options mappings ({@link BoolFmtOptions}) as well as
 * presets ({@link BoolFmtPreset}).
 *
 * @param b The boolean value to format into a pretty string.
 * @param color Whether color-coding should be used on the string.
 * @param capitalize Whether to capitalize the first letter of the string.
 * @param trueStr The string to start with if the given boolean value is true.
 * @param falseStr The string to start with if the given boolean value is false.
 * @returns The final formatted string.
 */
function formattedBoolean(
	b: boolean,
	color: boolean,
	capitalize: boolean,
	trueStr: string,
	falseStr: string
): string {
	if (typeof b !== 'boolean') throw new TypeError(`Arg b must be a boolean: ${b}`);

	let str = b ? trueStr : falseStr;
	if (capitalize) str = strCapitalize(str);
	if (!color) return str;
	return b ? clr.green(str) : clr.red(str);
}

// TODO jsdoc
const fmtBool = (b: boolean, options: BoolFmtOptions = BoolFmtPreset.TrueFalse) =>
	formattedBoolean(b, options.color, options.capitalize, options.trueStr, options.falseStr);
const yesNo = (b: boolean): string => fmtBool(b, BoolFmtPreset.YesNo);
const enabledDisabled = (b: boolean): string => fmtBool(b, BoolFmtPreset.EnabledDisabled);
const checkCross = (b: boolean): string => fmtBool(b, BoolFmtPreset.CheckCross);

export { checkCross, enabledDisabled, fmtBool, formattedBoolean, yesNo };
