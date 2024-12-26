import clr from 'chalk';

import { UserConfig } from '../../config/type/UserConfig.js';
import { isPathAccessible } from '../file/path.js';
import * as str from './grammar.js';
import { quote } from './quote.js';
import { SB_ERR_SM, SB_OK_SM } from './symbols.js';

// MARK: BOOLEAN

// TODO Benchmark is it faster to store four string values: trueLowerStr trueUpperStr falseLowerStr and falseUpperStr or current?
export interface BoolFmtOptions {
	/** Whether the formatted boolean should be color-coded */
	color: boolean;
	/** Whether the boolean value-dependent string should have its first letter capitalized */
	capitalize: boolean;
	/** The string to use if a given boolean is true */
	trueStr: string;
	/** The string to use if a given boolean is false */
	falseStr: string;
}

// TODO Unit test
// TODO jsdoc
export const boolPresets: Record<string, BoolFmtOptions> = {
	/** "true" / "false" - color on, capitalize off */
	TrueFalse: { color: true, capitalize: false, trueStr: 'true', falseStr: 'false' },
	/** "Yes" / "No" - color on, capitalize off */
	YesNo: { color: true, capitalize: true, trueStr: 'yes', falseStr: 'no' },
	/** "On" / "Off" - color on, capitalize off */
	OnOff: { color: true, capitalize: true, trueStr: 'on', falseStr: 'off' },
	/** "Enabled" / "Disabled" - color on, capitalize off */
	EnabledDisabled: {
		color: true,
		capitalize: true,
		trueStr: 'enabled',
		falseStr: 'disabled',
	},
	/** "enable" / "disable" - color on, capitalize off */
	EnableDisable: {
		color: true,
		capitalize: false,
		trueStr: 'enable',
		falseStr: 'disable',
	},
	/** "✓" (unicode 2713) / "✕" (unicode 2715) - color on */
	CheckCross: { color: true, capitalize: false, trueStr: '\u2713', falseStr: '\u2715' },
	/** "✔" (unicode 2714) / "✖" (unicode 2716) */
	CheckCrossHeavy: {
		color: true,
		capitalize: false,
		trueStr: '\u2714',
		falseStr: '\u2716',
	},
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
 */
// TODO jsdoc
export function bool(
	b: boolean,
	options: BoolFmtOptions = boolPresets.TrueFalse,
): string {
	const { capitalize, color, trueStr, falseStr } = options;
	let s = b ? trueStr : falseStr;

	if (capitalize) {
		s = str.capitalize(s);
	}

	if (!color) {
		return s;
	}

	return b ? clr.green(s) : clr.red(s);
}

export const yesNo = (b: boolean): string => bool(b, boolPresets.YesNo);
export const enabledDisabled = (b: boolean): string =>
	bool(b, boolPresets.EnabledDisabled);
export const checkCross = (b: boolean): string => bool(b, boolPresets.CheckCross);

// MARK: PATH

export interface PathFmtOptions {
	useUnderline: boolean;
	useQuotes: boolean;
}

export const defaultPathFmtOptions: PathFmtOptions = {
	useUnderline: true,
	useQuotes: true,
};

// MARK: path

/**
 * Formats a given filepath to a better version for console.
 * Options available are to apply underline and/or apply
 * quotations, both of which are enabled by default.
 *
 * @param filePath The filepath to format.
 * @param useUnderline Whether to apply underline formatting
 *  to the given filepath.
 * @param useQuotes Whether to apply quotation marks to the
 *  the given filepath if it not surrounded by them already.
 * @returns The formatted filepath with the options applied.
 */
// TODO Unit Test
export function path(
	filePath: string,
	options: PathFmtOptions = defaultPathFmtOptions,
): string {
	if (filePath.trim() === '') {
		return filePath;
	}

	const { useQuotes, useUnderline } = options;

	if (useQuotes) {
		filePath = quote(filePath, {
			singleQuotes: false,
			force: false,
			partialWrap: false,
		});
	}

	if (useUnderline) {
		filePath = clr.underline(filePath);
	}

	return filePath;
}

// MARK: pathWithExists

/**
 * Styles the given path according to if it is accessible or not.
 * If the path is accessible, a green checkmark prefix is applied.
 * Otherwise, a red x-mark prefix is applied.
 *
 * * This function uses `fs.access` to determine if the path is
 *   accessible or not
 * * This means that if the user does not have permissions to
 *   access the file, it will appear with the red x-mark, even
 *   if the path exists in the system
 *
 * @param filePath The filepath to check for accessibility.
 * @returns A Promise which unwraps to a `boolean` value if
 *  resolved, which represents whether `filePath` was accessible
 *  or not.
 */
// TODO jsdoc
// TODO Unit Test
export async function pathWithExists( // TODO Update jsdoc
	filePath: string,
	config?: UserConfig,
	options: PathFmtOptions = defaultPathFmtOptions,
): Promise<string> {
	const shouldValidatePaths = config?.shouldValidateFilePaths() ?? true;

	if (options.useUnderline || options.useQuotes) {
		filePath = path(filePath, options);
	}

	if (!shouldValidatePaths) {
		return filePath;
	}

	const prefixOk = SB_OK_SM + ' ';
	const prefixErr = SB_ERR_SM + ' ';

	const accessible = await isPathAccessible(filePath);
	const prefix = accessible ? prefixOk : prefixErr;

	return prefix + filePath;
}

// MARK: pathWithName
// TODO jsdoc
// TODO Unit Test
export function pathWithName(
	filePath: string,
	nickname: string,
	options: PathFmtOptions = defaultPathFmtOptions,
): string {
	if (options.useUnderline || options.useQuotes) {
		filePath = path(filePath, options);
	}

	return nickname + ': ' + filePath;
}

// MARK: pathWithNameAndExists
// TODO jsdoc
// TODO Unit Test
// eslint-disable-next-line @typescript-eslint/max-params
export async function pathWithNameAndExists(
	filePath: string,
	nickname: string,
	config?: UserConfig,
	tabPrefix = ' ',
	options: PathFmtOptions = defaultPathFmtOptions,
): Promise<string> {
	const shouldValidatePaths = config?.shouldValidateFilePaths() ?? true;

	if (options.useUnderline || options.useQuotes) {
		filePath = path(filePath, options);
	}

	if (!shouldValidatePaths) {
		return filePath;
	}

	const accessible = await isPathAccessible(filePath);
	const suffix = accessible ? SB_OK_SM : SB_ERR_SM;

	return tabPrefix + nickname + ': ' + filePath + ' ' + suffix;
}

// MARK: pathAsTag
// TODO jsdoc
// TODO Unit Test
export function pathAsTag(
	filePath: string,
	innerPrefix = 'Path',
	options: PathFmtOptions = defaultPathFmtOptions,
): string {
	filePath = path(filePath, options);
	innerPrefix = innerPrefix !== '' ? innerPrefix + ': ' : '';
	return `(${innerPrefix}${filePath})`;
}
