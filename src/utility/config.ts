// TODO Look into substituting use of `any` in this file for `unknown` or `never`

import clr from 'chalk';

import { checkCross, fmtBool } from './boolean';
import { clog } from './console';
import { dlog } from './debug';
import { getTypeDisplayName, indefiniteArticleFor } from './string';
import { quote } from './string-wrap';
import { SB_ERR_LG, SB_ERR_SM, SB_OK_LG, SB_OK_SM, SB_WARN, UNICODE_ARRW_RIGHT } from './symbols';

import { USER_CONFIG_ATTRIBUTION, USER_CONFIG_FILENAME } from '../config/config';
import ConfigKeyAliases from '../type/config/ConfigKeyAliases';
import ConfigKeyPair from '../type/config/ConfigKeyPair';
import UserConfig from '../type/config/UserConfig';

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
export const resolveKeyFromAlias = (
	keyAliases: ConfigKeyAliases,
	givenKey: string,
	sectionFullKey: string | null
): ConfigKeyPair => {
	const upperKey = sectionFullKey === null ? '' : sectionFullKey;
	return {
		givenKey: givenKey,
		resolvedKey: keyAliases[givenKey] || givenKey,
		fullGivenKey: joinPathKeys(upperKey, givenKey),
		fullResolvedKey: joinPathKeys(upperKey, givenKey)
	};
};

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
export const joinPathKeys = (...keys: Array<string>) => {
	return keys
		.filter(k => !k.startsWith('.'))
		.filter(k => !k.endsWith('.'))
		.filter(k => k.trim() !== '')
		.join('.');
};

// MARK: General Logs

export const clogConfigSucc = (emphasis: boolean, msg: string) =>
	clog(`  ` + (emphasis ? SB_OK_LG : SB_OK_SM) + ` ${msg}`); // TODO Support changing whitespace prefix?

export const clogConfigWarn = (msg: string) => console.warn(` ${SB_WARN} ${USER_CONFIG_ATTRIBUTION}: ${msg}`);
// TODO Check out where these old styles are used and replace

export const clogConfigFatalErr = (msg: string) => {
	const errUserAttribution = clr.red(`User `) + clr.redBright(USER_CONFIG_FILENAME);
	console.error(`${SB_ERR_LG} ${errUserAttribution} ` + clr.red(msg));
};

// MARK: Section Logging

export const dlogConfigSectionStart = (sectionKey: string) => {
	dlog(UNICODE_ARRW_RIGHT + clr.underline(`Loading: Config section "${sectionKey}"`));
};

export const clogConfigFatalErrMissingRequiredSection = (sectionKey: string) =>
	clogConfigFatalErr(`is missing required required section ${clr.redBright(quote(sectionKey))}.`);

export const clogConfigFatalErrRequiredSectionWrongType = (
	sectionKey: string,
	expectedType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any
) => {
	const typeOfValue = getTypeDisplayName(value);
	const articleActualType = indefiniteArticleFor(typeOfValue);
	const articleExpectedType = indefiniteArticleFor(expectedType);

	const msg = `has an invalid required section: Value of ${clr.redBright(quote(sectionKey))} should be ${articleExpectedType} ${expectedType} but was ${articleActualType} ${typeOfValue}`;
	clogConfigFatalErr(msg);
};

export const dlogConfigWarnMissingOptionalSection = (sectionKey: string) =>
	dlog(`${SB_WARN} ${USER_CONFIG_ATTRIBUTION} is missing optional section ${quote(sectionKey)}`);

export const dlogConfigWarnOptionalSectionSkipped = (sectionKey: string, reason: string) =>
	dlog(`${SB_ERR_LG} Skipped section ${quote(sectionKey)}: ${reason}`);

/*
 * TODO jsdoc
 * TODO: Write TEST cases:
 * - expectedType="string" and value=42 -> "should be a string but was a number"
 * - expectedType="mapping" and value=[1,2,3] -> "should be a mapping but was an array"
 * - expectedType="object" and value = {} -> "should be an object but was an object"
 */
export const dlogConfigWarnOptionalSectionSkippedWrongType = (
	sectionKey: string,
	expectedType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any
) => {
	// Various terms used to describe an object when it is serialized to JSON or YAML
	const typeOfValue = getTypeDisplayName(value);
	const articleActualType = indefiniteArticleFor(typeOfValue);
	const articleExpectedType = indefiniteArticleFor(expectedType);

	const msg = `Value of ${quote(sectionKey)} should be ${articleExpectedType} ${expectedType} but was ${articleActualType} ${typeOfValue}`;
	dlogConfigWarnOptionalSectionSkipped(sectionKey, msg);
};

export const dlogConfigSectionOk = (sectionKey: string) =>
	console.log(SB_OK_LG + ` ` + clr.underline(`Loaded: Config section "${sectionKey}"`));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fmtValueForLoadedLog = (value?: any): string => {
	if (value === undefined) value = '';

	let fmtValue = `${value}`;
	if (typeof value === 'string') fmtValue = value !== '' ? quote(value) : '';
	else if (typeof value === 'boolean') fmtValue = fmtBool(value);
	// TODO More type fmts

	return fmtValue;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const dlogConfigValueLoaded = (resolvedPair: ConfigKeyPair, value?: any) => {
	const { givenKey, fullGivenKey, resolvedKey } = resolvedPair;
	const usedAlias = givenKey !== resolvedKey;
	dlog(`  ${SB_OK_SM} Value loaded ${quote(fullGivenKey)} (${fmtValueForLoadedLog(value)})`);
	// TODO Make the below verbose logs
	dlog(`    > Alias used? ${checkCross(usedAlias)}`);
	if (usedAlias) {
		dlog(`    > Alias: ${quote(givenKey)}`);
		dlog(`    > Actual: ${quote(resolvedKey)}`);
	}
};

export const clogConfigKeyUnknown = (fullGivenKey: string, config: UserConfig) => {
	if (!config.shouldWarnUnknownConfigKey()) return;
	clog(`  ${SB_WARN} Unknown key set at ${quote(fullGivenKey)}`);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const clogConfigValueUnknown = (fullGivenKey: string, value: any) => {
	clog(`  ${SB_WARN} Unknown value set for key ${quote(fullGivenKey)} (Value: ${value})`);
};

export const clogConfigValueErr = (key: string, msg: string) =>
	clog(`  ${SB_ERR_SM} Value of key ${quote(key)} ${msg}`);

export const clogConfigValueWrongType = (
	key: string,
	expectedType: string,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any,
	displayValue = true
) => {
	const valuef = fmtValueForLoadedLog(value);
	let msg = `must be ${indefiniteArticleFor(expectedType)} ${expectedType} but was`;

	if (value === undefined) msg += ` not`;
	else msg += ` ${indefiniteArticleFor(typeof value)} ${typeof value}`;

	if (displayValue) msg += ` (Value: ${valuef})`;

	clogConfigValueErr(key, `${msg}`);
};
