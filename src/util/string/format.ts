import chalk from 'chalk';
import { Chalk } from 'chalk';

import { UserConfig } from '../../config/type/UserConfig.js';
import { isPathAccessible } from '../file/path.js';
import * as str from './grammar.js';
import { quote } from './quote.js';
import { SB_ERR_SM, SB_OK_SM } from './symbols.js';
import * as fmt from './format.js';
import { delimitedList } from './grammar.js';
import { vlog } from '../logging/debug.js';

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
export const boolFmtPresets: Record<string, BoolFmtOptions> = {
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

export function trueColor(): Chalk {
	return chalk.rgb(186, 245, 154);
}

export function falseColor(): Chalk {
	return chalk.rgb(255, 150, 150);
}

// MARK: bool
/*
 * TODO Benchmark faster to store all four truth+capitalization values (trueUpper, falseLower, etc.) than current impl
 * TODO Options for color customization
 * TODO Options for formatting (bold, italic, underline)
 * TODO Test unit
 */
/**
 * Formats a given `boolean` into a prettier string with context-dependent
 * formatting as well as options for color-coding and auto-capitalization.
 * 
 * @param b The boolean value to format into a prettier string.
 * @param options The {@link BoolFmtOptions} which inform how the boolean
 *  will be formatted into a prettier string.
 * @returns A string value representing the boolean value.
 */
export function bool(
	b: boolean,
	options: BoolFmtOptions = boolFmtPresets.TrueFalse,
): string {
	const { capitalize, color, trueStr, falseStr } = options;
	let s = b ? trueStr : falseStr;

	if (capitalize) {
		s = str.capitalize(s);
	}

	if (!color) {
		return s;
	}

	return b ? trueColor()(s) : falseColor()(s);
}

// TODO jsdoc
export function yesNo(b: boolean): string {
	return bool(b, boolFmtPresets.YesNo);
}
// TODO jsdoc
export function enabledDisabled(b: boolean): string {
	return bool(b, boolFmtPresets.EnabledDisabled);
}
// TODO jsdoc
export function checkCross(b: boolean): string {
	return bool(b, boolFmtPresets.CheckCross);
}

// MARK: PATH

// TODO jsdoc
export interface PathFmtOptions {
	useUnderline: boolean;
	useQuotes: boolean;
}

// TODO jsdoc
export const defaultPathFmtOptions: PathFmtOptions = {
	useUnderline: true,
	useQuotes: true,
};

// MARK: path
/**
 * Formats a string representing some file path with the requisite
 * options supplied by the given {@link PathFmtOptions}, including
 * underlining and quoting the string.
 * @param filePath The file path to format as a path.
 * @param options The {@link PathFmtOptions} which inform how the
 *  string will be formatted as a path.
 * @returns 
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
		filePath = chalk.underline(filePath);
	}

	return filePath;
}

// MARK: pathWithExists
// TODO jsdoc
// TODO Unit Test
export async function pathWithExists( // TODO Update jsdoc
	filePath: string,
	config: UserConfig,
	options: PathFmtOptions = defaultPathFmtOptions,
): Promise<string> {
	if (options.useUnderline || options.useQuotes) {
		filePath = path(filePath, options);
	}

	if (!config.shouldValidateFilePaths) {
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
	config: UserConfig,
	tabPrefix = ' ',
	options: PathFmtOptions = defaultPathFmtOptions,
): Promise<string> {
	if (options.useUnderline || options.useQuotes) {
		filePath = path(filePath, options);
	}

	if (!config.shouldValidateFilePaths) {
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

// MARK: MISC

// MARK: value
export function value(value: unknown): string {
	switch (typeof value) {
		case 'undefined':
			return 'undefined';
		case 'boolean':
			return fmt.bool(value);
		case 'number':
			return `${value}`;
		case 'object':
			if (Array.isArray(value)) {
				return delimitedList(value);
			} else {
				return 'Object'
			}
		case 'string':
			return quote(value);
		default:
			return '[unknown type]'
	};
}

// MARK: enumValue
export function enumValue(
	value: string
): string {
	return chalk.cyanBright(value);
}