// MARK: GENERAL
import clr from 'chalk';
import { USER_CONFIG_FILENAME } from '../../config/loadFileData.js';
import { USER_CONFIG_ATTRIBUTION } from '../../config/parseConfigData.js';
import { UserConfig } from '../../config/type/UserConfig.js';
import { fmtBool, yesNo } from '../boolean.js';
import { ResolvedYamlKey } from '../file/yaml.js';
import { getTypeDisplayName, indefiniteArticleFor } from '../string/grammar.js';
import {
	SB_BULLET,
	SB_ERR_LG,
	SB_ERR_SM,
	SB_OK_LG,
	SB_OK_SM,
	SB_SECT_START,
	SB_WARN,
} from '../string/symbols.js';
import { quote } from '../string/wrap.js';
import { clog } from './console.js';
import { dlog, isDebugActive, vlog, vlogList } from './debug.js';

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

// MARK: BY SECTION

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
export function vlogConfigValueLoaded(resolvedPair: ResolvedYamlKey, value?: any): void {
	const { givenKey, fullGivenKey, resolvedKey } = resolvedPair;
	const isAlias = givenKey !== resolvedKey;
	const fmtValue = fmtValueForLoadedLog(value);
	const fmtIsAlias = yesNo(isAlias);
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
