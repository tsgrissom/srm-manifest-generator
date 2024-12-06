import clr from 'chalk';
import { capitalize as strCapitalize } from './string';

// TODO Benchmark is it faster to store four string values: trueLowerStr trueUpperStr falseLowerStr and falseUpperStr or current?

// TEST Unit
// TODO jsdoc
interface BoolFmtOptions {
	/** Whether the formatted boolean should be color-coded */
	color: boolean;
	/** Whether the boolean value-dependent string should have its first letter capitalized */
	capitalize: boolean;
	/** The string to use if a given boolean is true */
	trueStr: string;
	/** The string to use if a given boolean is false */
	falseStr: string;
}

// TEST Unit
// TODO jsdoc
const BoolFmtPreset: Record<string, BoolFmtOptions> = {
	/** "true" / "false" - color on, capitalize off */
	TrueFalse: { color: true, capitalize: false, trueStr: 'true', falseStr: 'false' },
	/** "Yes" / "No" - color on, capitalize off */
	YesNo: { color: true, capitalize: true, trueStr: 'yes', falseStr: 'no' },
	/** "On" / "Off" - color on, capitalize off */
	OnOff: { color: true, capitalize: true, trueStr: 'on', falseStr: 'off' },
	/** "Enabled" / "Disabled" - color on, capitalize off */
	EnabledDisabled: { color: true, capitalize: true, trueStr: 'enabled', falseStr: 'disabled' },
	/** "enable" / "disable" - color on, capitalize off */
	EnableDisable: { color: true, capitalize: false, trueStr: 'enable', falseStr: 'disable' },
	/** "✓" (unicode 2713) / "✕" (unicode 2715) - color on */
	CheckCross: { color: true, capitalize: false, trueStr: '\u2713', falseStr: '\u2715' },
	/** "✔" (unicode 2714) / "✖" (unicode 2716) */
	CheckCrossHeavy: { color: true, capitalize: false, trueStr: '\u2714', falseStr: '\u2716' }
};

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

export { BoolFmtOptions, BoolFmtPreset, checkCross, enabledDisabled, fmtBool, formattedBoolean, yesNo };
