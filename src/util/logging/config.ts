import clr from 'chalk';
import { USER_CONFIG_ATTRIBUTION, USER_CONFIG_FILENAME } from '../../config/loadConfig.js';
import { ResolvedYamlKey } from '../file/yaml.js';
import * as fmt from '../string/format.js';
import { delimitedList, getTypeDisplayName, indefiniteArticleFor } from '../string/grammar.js';
import { quote } from '../string/quote.js';
import {
	SB_BULLET,
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_SECT_START,
	SB_WARN,
} from '../string/symbols.js';
import { clog } from './console.js';
import { dlog, isDebugActive, vlog, vlogList } from './debug.js';
import { ConfigData } from '../../config/type/ConfigData.js';

// MARK: GENERIC

// TODO Are these even used?

// TODO jsdoc

export function clogConfigWarn(str: string): void {
	console.warn(` ${SB_WARN} ${USER_CONFIG_ATTRIBUTION}: ${str}`);
	// TODO Check out where these old styles are used and replace
}

export function clogConfigFatalErr(str: string): void {
	const errUserAttribution = clr.red(`User `) + clr.redBright(USER_CONFIG_FILENAME);
	console.error(`${SB_ERR_LG} ${errUserAttribution} ` + clr.red(str));
}

// MARK: SECTION HEADERS

export function dlogConfigSectionStart(sectionKey: string): void {
	sectionKey = quote(sectionKey);
	dlog(`${SB_SECT_START}Loading: Config section ${sectionKey}`);
}

export function dlogConfigSectionOk(sectionKey: string): void {
	dlog(`${SB_OK_LG} Loaded: Config section ${quote(sectionKey)}`);
}

// MARK: LINT SECTIONS

// NON-FATAL SECTION WARNS

export function dlogConfigWarnMissingOptionalSection(sectionKey: string): void {
	dlog(
		`${SB_WARN} ${USER_CONFIG_ATTRIBUTION} is missing optional section ${quote(sectionKey)}`,
	);
}

export function dlogConfigWarnOptionalSectionSkipped(
	sectionKey: string,
	reason: string,
): void {
	dlog(`${SB_ERR_LG} Skipped section ${quote(sectionKey)}: ${reason}`);
}

/*
 * TODO jsdoc
 * TODO: Write TEST cases:
 * - expectedType="string" and value=42 -> "should be a string but was a number"
 * - expectedType="mapping" and value=[1,2,3] -> "should be a mapping but was an array"
 * - expectedType="object" and value = {} -> "should be an object but was an object"
 */
export function dlogConfigWarnOptionalSectionSkippedWrongType(
	sectionKey: string,
	expectedType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any,
): void {
	// Various terms used to describe an object when it is serialized to JSON or YAML
	const typeOfValue = getTypeDisplayName(value);
	const articleActualType = indefiniteArticleFor(typeOfValue);
	const articleExpectedType = indefiniteArticleFor(expectedType);

	// TODO Rewrite long line
	const msg = `Value of ${quote(sectionKey)} should be ${articleExpectedType} ${expectedType} but was ${articleActualType} ${typeOfValue}`;
	dlogConfigWarnOptionalSectionSkipped(sectionKey, msg);
}

// FATAL SECTION ERRS

export function clogConfigFatalErrMissingRequiredSection(fullSectionKey: string): void {
	fullSectionKey = clr.redBright(quote(fullSectionKey));
	clogConfigFatalErr(`is missing required required section ${fullSectionKey}.`);
}

export function clogConfigFatalErrRequiredSectionWrongType(
	sectionKey: string,
	expectedType: string,
	value: unknown,
): void {
	const typeOfValue = getTypeDisplayName(value);
	const articleActualType = indefiniteArticleFor(typeOfValue);
	const articleExpectedType = indefiniteArticleFor(expectedType);

	const msg = `has an invalid required section: Value of ${clr.redBright(quote(sectionKey))} should be ${articleExpectedType} ${expectedType} but was ${articleActualType} ${typeOfValue}`;
	clogConfigFatalErr(msg);
}

// MARK: LINT KEYS

/**
 * Warns the user that an unknown config key was set at a fully-qualified,
 * given key path.
 * Uses ConfigData over UserConfig because this function is used in the
 * process of creating the user config instance.
 * @param fullGivenKey The fully-qualified key path given by the user.
 * @param config The current ConfigData object, used to determine if
 *  unknown keys should be logged.
 */
export function clogConfigKeyUnknown(fullGivenKey: string, config: ConfigData): void {
	if (!config.validate.configKeys) {
		return;
	}

	clog(`  ${SB_WARN} Unknown key set at ${quote(fullGivenKey)}`);
}

// MARK: LINT VALUES

export function vlogConfigValueLoaded(resolvedKeys: ResolvedYamlKey, value: unknown): void {
	const { givenKey, fullGivenKey, resolvedKey } = resolvedKeys;
	const isAlias = givenKey !== resolvedKey;
	const fmtValue = fmt.value(value);
	const fmtIsAlias = fmt.yesNo(isAlias);
	const fmtGivenKey = quote(givenKey);
	const fmtInternalKey = quote(resolvedKey);

	vlog(`  ${SB_OK_SM} Key loaded ${quote(fullGivenKey)}`);
	vlogList(
		`     ${SB_BULLET} `,
		`Value: ${fmtValue}`,
		`Given Key: ${fmtGivenKey}`,
		`Internal Key: ${fmtInternalKey}`,
		`Is Key Alias? ${fmtIsAlias}`,
	);
}

// TODO Move this to use unknown
export function logConfigValueUnknown(fullGivenKey: string, value: unknown): void {
	const postfix = `(Value: ${fmt.value(value)})`;
	clog(`  ${SB_WARN} Unknown value set for key ${quote(fullGivenKey)} ${postfix}`);
}

export function logConfigValueUnknownWithSuggestions(fullGivenKey: string, value: unknown, suggestions: Array<string>): void {
	logConfigValueUnknown(fullGivenKey, value);
	clog(`   - Valid options: ${delimitedList(suggestions)}`);
}

function logConfigValueErr(key: string, msg: string): void {
	const prefix = isDebugActive() ? SB_ERR_SM : `${SB_ERR_LG} Config:`;
	let blob = `${prefix} Value of key ${quote(key)} ${msg}`;

	if (isDebugActive()) {
		// Pad left if debug
		blob = `  ` + blob;
	}

	clog(blob);
}

// eslint-disable-next-line @typescript-eslint/max-params
export function logConfigValueWrongType(
	key: string,
	expectedType: string,
	value: unknown,
	displayValue = true,
): void {
	const valueFmtd = fmt.value(value);
	let msg = `must be ${indefiniteArticleFor(expectedType)} ${expectedType} but was`;

	if (value === undefined) msg += ` not`;
	else msg += ` ${indefiniteArticleFor(typeof value)} ${typeof value}`;

	if (displayValue) msg += ` (Value: ${valueFmtd})`;

	logConfigValueErr(key, `${msg}`);
}
