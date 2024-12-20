// TODO Look into substituting use of `any` in this file for `unknown` or `never`

import clr from 'chalk';

import { fmtBool, yesNo } from './boolean.js';
import { clog } from './console.js';
import { dlog, isDebugActive, vlog, vlogList } from './debug.js';
import { quote } from './string-wrap.js';
import { getTypeDisplayName, indefiniteArticleFor } from './string.js';
import {
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_SECT_START,
	SB_WARN,
} from './symbols.js';

import { USER_CONFIG_ATTRIBUTION, USER_CONFIG_FILENAME } from '../config/config.js';
import ConfigKeyAliases from '../type/config/ConfigKeyAliases.js';
import ConfigKeyPair from '../type/config/ConfigKeyPair.js';
import UserConfig from '../type/config/UserConfig.js';

// MARK: Utility

/**
 * Resolves a {@link ConfigKeyPair} from the {@link givenKey} by searching the
 * {@link keyAliases} for a matching alias.
 *
 * @param keyAliases The map of alias to reference values for a given config section.
 * @param givenKey The key the user actually gave in an iteration over a section's
 *  contents.
 * @param sectionFullKey The full key that is being searched within for a given context.
 *  By default this value is empty, which represents top-level key searches. However,
 *  if used to search within levels which are any deeper, giving this value is important
 *  so the secondary full key values are inferred correctly automatically.
 * @returns A {@link ConfigKeyPair} containing the {@link ConfigKeyPair.resolvedKey}
 *  as well as the {@link givenKey} as {@link ConfigKeyPair.givenKey}.
 * @example
 */
// TODO Example
// TODO Write TEST
export function resolveKeyFromAlias(
	keyAliases: ConfigKeyAliases,
	givenKey: string,
	sectionFullKey: string | null,
): ConfigKeyPair {
	const upperKey = sectionFullKey === null ? '' : sectionFullKey;
	return {
		givenKey: givenKey,
		resolvedKey: keyAliases[givenKey] || givenKey,
		fullGivenKey: joinPathKeys(upperKey, givenKey),
		fullResolvedKey: joinPathKeys(upperKey, givenKey),
	};
}

/**
 * Joins a series of YAML path keys with '.' characters
 * in order to constructor a full key to a section, value,
 * etc.
 *
 * * If a key starts or ends with a '.' character, it will
 *   be ignored. Keys containing '.' inside will not be ignored
 *   because those might be multi-leveled keys themselves.
 * * If a key is empty or consists of only whitespace, it
 *   will be ignored
 * * Therefore, it's important to **check the returned value**
 *   for emptiness because an empty string could be returned
 *
 * @param keys The keys to join.
 * @returns The resulting joined key which points to a
 *  value which is found deeper than the top level of the
 *  document.
 */
// TODO jsdoc + example
// TODO Write TEST
export function joinPathKeys(...keys: Array<string>): string {
	return keys
		.filter(k => !k.startsWith('.'))
		.filter(k => !k.endsWith('.'))
		.filter(k => k.trim() !== '')
		.join('.');
}

// MARK: General Logs

// TODO Are these even used?

// TODO jsdoc
export function clogConfigSucc(str: string, emphasize = false): void {
	clog(`  ` + (emphasize ? SB_OK_LG : SB_OK_SM) + ` ${str}`);
	// TODO Support changing whitespace prefix?
}

export function clogConfigWarn(str: string): void {
	console.warn(` ${SB_WARN} ${USER_CONFIG_ATTRIBUTION}: ${str}`);
	// TODO Check out where these old styles are used and replace
}

export function clogConfigFatalErr(str: string): void {
	const errUserAttribution = clr.red(`User `) + clr.redBright(USER_CONFIG_FILENAME);
	console.error(`${SB_ERR_LG} ${errUserAttribution} ` + clr.red(str));
}

// MARK: Section Logging

export function dlogConfigSectionStart(sectionKey: string): void {
	sectionKey = quote(sectionKey);
	dlog(`${SB_SECT_START}Loading: Config section ${sectionKey}`);
}

export function clogConfigFatalErrMissingRequiredSection(fullSectionKey: string): void {
	fullSectionKey = clr.redBright(quote(fullSectionKey));
	clogConfigFatalErr(`is missing required required section ${fullSectionKey}.`);
}

export function clogConfigFatalErrRequiredSectionWrongType(
	sectionKey: string,
	expectedType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any,
): void {
	const typeOfValue = getTypeDisplayName(value);
	const articleActualType = indefiniteArticleFor(typeOfValue);
	const articleExpectedType = indefiniteArticleFor(expectedType);

	const msg = `has an invalid required section: Value of ${clr.redBright(quote(sectionKey))} should be ${articleExpectedType} ${expectedType} but was ${articleActualType} ${typeOfValue}`;
	clogConfigFatalErr(msg);
}

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

export function dlogConfigSectionOk(sectionKey: string): void {
	dlog(`${SB_OK_LG} Loaded: Config section ${quote(sectionKey)}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmtValueForLoadedLog(value?: any): string {
	if (typeof value === 'undefined') {
		value = '';
	}

	let fmtValue = `${value}`;
	if (typeof value === 'string') fmtValue = value !== '' ? quote(value) : '';
	else if (typeof value === 'boolean') fmtValue = fmtBool(value);
	// TODO More type fmts
	return fmtValue;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function vlogConfigValueLoaded(resolvedPair: ConfigKeyPair, value?: any): void {
	const { givenKey, fullGivenKey, resolvedKey } = resolvedPair;
	const isAlias = givenKey !== resolvedKey;
	const fmtValue = fmtValueForLoadedLog(value);
	const fmtIsAlias = yesNo(isAlias);
	const fmtGivenKey = quote(givenKey);
	const fmtInternalKey = quote(resolvedKey);

	vlog(`  ${SB_OK_SM} Key loaded ${quote(fullGivenKey)}`);
	vlogList(
		`     \u26AC `,
		`Value: ${fmtValue}`,
		`Given Key: ${fmtGivenKey}`,
		`Internal Key: ${fmtInternalKey}`,
		`Is Key Alias? ${fmtIsAlias}`,
	);
}

export function clogConfigKeyUnknown(fullGivenKey: string, config: UserConfig): void {
	if (!config.shouldWarnUnknownConfigKey()) return;
	clog(`  ${SB_WARN} Unknown key set at ${quote(fullGivenKey)}`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function clogConfigValueUnknown(fullGivenKey: string, value: any): void {
	clog(
		`  ${SB_WARN} Unknown value set for key ${quote(fullGivenKey)} (Value: ${value})`,
	);
}

function clogConfigValueErr(key: string, msg: string): void {
	const prefix = isDebugActive() ? SB_ERR_SM : `${SB_ERR_LG} Config:`;
	let blob = `${prefix} Value of key ${quote(key)} ${msg}`;

	if (isDebugActive()) {
		blob = `  ` + blob;
	}

	clog(blob);
}

export function clogConfigValueWrongType(
	key: string,
	expectedType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any,
	displayValue = true,
): void {
	const valuef = fmtValueForLoadedLog(value);
	let msg = `must be ${indefiniteArticleFor(expectedType)} ${expectedType} but was`;

	if (value === undefined) msg += ` not`;
	else msg += ` ${indefiniteArticleFor(typeof value)} ${typeof value}`;

	if (displayValue) msg += ` (Value: ${valuef})`;

	clogConfigValueErr(key, `${msg}`);
}
